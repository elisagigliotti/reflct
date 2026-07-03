"""
Router Body Scan — stima REALE (non piu' mock).

Usa MediaPipe Pose Landmarker (modello bundlato in app/models_bin/pose_landmarker.task,
BlazePose lite) per rilevare 33 landmark corporei nella foto frontale caricata
dall'utente, poi calibra le distanze in pixel sull'altezza dichiarata per stimare
le 7 misure corporee. E' comunque un'approssimazione (una singola foto 2D non da'
una circonferenza esatta, serve un fattore di conversione larghezza->circonferenza),
ma a differenza della versione precedente osserva davvero il contenuto della foto:
se non c'e' una persona visibile, o il corpo non e' inquadrato per intero, la
richiesta fallisce con un errore reale invece di restituire numeri inventati.
"""
import logging
from pathlib import Path

import cv2
import mediapipe as mp
import numpy as np
import requests
from fastapi import APIRouter, HTTPException
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision

from app.models import BodyScanEstimate, BodyScanRequest

router = APIRouter(prefix="/bodyscan", tags=["bodyscan"])

logger = logging.getLogger(__name__)

_MODEL_PATH = Path(__file__).resolve().parent.parent / "models_bin" / "pose_landmarker.task"
_DOWNLOAD_TIMEOUT_SECONDS = 15

# Indici landmark BlazePose (33 punti) usati per la stima.
_NOSE = 0
_L_SHOULDER, _R_SHOULDER = 11, 12
_L_HIP, _R_HIP = 23, 24
_L_WRIST, _R_WRIST = 15, 16
_L_ANKLE, _R_ANKLE = 27, 28

# Landmark critici per giudicare se la foto e' "a figura intera" e utilizzabile.
_REQUIRED_VISIBILITY = 0.15
_MIN_AVG_VISIBILITY_FOR_CONFIDENCE = 0.3

# Frazione dell'altezza totale coperta dal segmento naso->caviglia (il resto e'
# sommità del cranio sopra il naso + piede sotto la caviglia), usata per calibrare
# i pixel in centimetri a partire dall'altezza dichiarata dall'utente.
_NOSE_TO_ANKLE_HEIGHT_RATIO = 0.88

# Fattori empirici larghezza-frontale -> circonferenza (una foto 2D frontale non
# cattura la profondità del corpo, quindi la larghezza da sola sottostima la
# circonferenza reale: questi fattori compensano in modo approssimativo, come
# fanno le app di body-measurement da singola foto).
_CHEST_WIDTH_TO_CIRCUMFERENCE = 2.9
_HIP_WIDTH_TO_CIRCUMFERENCE = 2.8
_WAIST_WIDTH_TO_HIP_WIDTH_RATIO = 0.85
_WAIST_WIDTH_TO_CIRCUMFERENCE = 2.6
_INSEAM_HIP_TO_ANKLE_FACTOR = 0.9  # l'anca landmark e' un po' sopra il cavallo

# Controlli di plausibilita' (una singola foto 2D senza inquadratura corretta
# produce landmark "sicuri" secondo MediaPipe ma geometricamente inattendibili,
# es. persona di profilo/inclinata: qui rifiutiamo esplicitamente invece di
# restituire misure senza senso).
_MIN_BODY_FRAME_FRACTION = 0.30  # naso->caviglia deve coprire almeno il 30% dell'altezza foto
_PLAUSIBLE_SHOULDER_TO_BODY_RATIO = (0.14, 0.45)  # spalle / (naso->caviglia)

_detector: mp_vision.PoseLandmarker | None = None


def _get_detector() -> mp_vision.PoseLandmarker:
    """Carica il modello BlazePose una sola volta (singleton di processo)."""
    global _detector
    if _detector is None:
        if not _MODEL_PATH.exists():
            raise RuntimeError(
                f"Modello pose landmarker non trovato in {_MODEL_PATH}. "
                "Vedi README ai-service per come scaricarlo."
            )
        base_options = mp_python.BaseOptions(model_asset_path=str(_MODEL_PATH))
        options = mp_vision.PoseLandmarkerOptions(base_options=base_options, num_poses=1)
        _detector = mp_vision.PoseLandmarker.create_from_options(options)
    return _detector


def _download_image(url: str) -> np.ndarray:
    try:
        response = requests.get(url, timeout=_DOWNLOAD_TIMEOUT_SECONDS)
        response.raise_for_status()
    except requests.exceptions.RequestException as exc:
        raise HTTPException(status_code=422, detail=f"impossibile scaricare la foto da {url}: {exc}") from exc

    array = np.frombuffer(response.content, dtype=np.uint8)
    image = cv2.imdecode(array, cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=422, detail="il contenuto scaricato non e' un'immagine valida")
    return image


def _detect_landmarks(image_bgr: np.ndarray):
    rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    result = _get_detector().detect(mp_image)
    if not result.pose_landmarks:
        raise HTTPException(
            status_code=422,
            detail="nessuna persona rilevata nella foto: assicurati che il corpo intero sia visibile, "
            "ben illuminato e di fronte alla fotocamera",
        )
    return result.pose_landmarks[0]


def estimate_from_landmarks(landmarks, image_width: int, image_height: int, altezza_cm: float) -> BodyScanEstimate:
    """Calcola le 7 misure corporee a partire dai landmark rilevati (funzione pura,
    testabile senza rete/immagini reali passando landmark sintetici)."""

    def visibility(idx: int) -> float:
        return landmarks[idx].visibility

    def point_px(idx: int) -> tuple[float, float]:
        p = landmarks[idx]
        return p.x * image_width, p.y * image_height

    critical = [_L_SHOULDER, _R_SHOULDER, _L_HIP, _R_HIP, _L_ANKLE, _R_ANKLE]
    if any(visibility(i) < _REQUIRED_VISIBILITY for i in critical):
        raise HTTPException(
            status_code=422,
            detail="foto non idonea: alcune parti del corpo (spalle/fianchi/caviglie) non sono "
            "visibili. Usa una foto a figura intera, di fronte, senza parti tagliate",
        )

    nose_x, nose_y = point_px(_NOSE)
    l_sh_x, l_sh_y = point_px(_L_SHOULDER)
    r_sh_x, r_sh_y = point_px(_R_SHOULDER)
    l_hip_x, l_hip_y = point_px(_L_HIP)
    r_hip_x, r_hip_y = point_px(_R_HIP)
    l_ank_x, l_ank_y = point_px(_L_ANKLE)
    r_ank_x, r_ank_y = point_px(_R_ANKLE)

    shoulder_y = (l_sh_y + r_sh_y) / 2
    hip_y = (l_hip_y + r_hip_y) / 2
    ankle_y = (l_ank_y + r_ank_y) / 2

    # Calibrazione pixel -> cm dall'altezza dichiarata dall'utente.
    nose_to_ankle_px = ankle_y - nose_y
    if nose_to_ankle_px <= 0:
        raise HTTPException(status_code=422, detail="geometria del corpo non plausibile nella foto rilevata")

    if nose_to_ankle_px / image_height < _MIN_BODY_FRAME_FRACTION:
        raise HTTPException(
            status_code=422,
            detail="la persona nella foto e' troppo piccola/lontana per una stima affidabile: "
            "avvicinati alla fotocamera cosi' che il corpo riempia la maggior parte dell'inquadratura",
        )

    shoulder_width_px = abs(l_sh_x - r_sh_x)
    shoulder_ratio = shoulder_width_px / nose_to_ankle_px
    if not (_PLAUSIBLE_SHOULDER_TO_BODY_RATIO[0] <= shoulder_ratio <= _PLAUSIBLE_SHOULDER_TO_BODY_RATIO[1]):
        raise HTTPException(
            status_code=422,
            detail="non e' stato possibile stimare le misure in modo affidabile da questa foto "
            "(corpo non frontale o posa non standard): prova una foto di fronte, in piedi, braccia "
            "leggermente staccate dai fianchi",
        )

    total_height_px = nose_to_ankle_px / _NOSE_TO_ANKLE_HEIGHT_RATIO
    cm_per_px = altezza_cm / total_height_px

    shoulder_width_cm = shoulder_width_px * cm_per_px
    hip_width_cm = abs(l_hip_x - r_hip_x) * cm_per_px
    torso_height_cm = (hip_y - shoulder_y) * cm_per_px
    leg_length_cm = (ankle_y - hip_y) * cm_per_px

    # Manica: spalla -> polso, sul lato con visibilita' migliore.
    if visibility(_L_WRIST) >= visibility(_R_WRIST) and visibility(_L_WRIST) >= _REQUIRED_VISIBILITY:
        wr_x, wr_y = point_px(_L_WRIST)
        sh_x, sh_y = l_sh_x, l_sh_y
    elif visibility(_R_WRIST) >= _REQUIRED_VISIBILITY:
        wr_x, wr_y = point_px(_R_WRIST)
        sh_x, sh_y = r_sh_x, r_sh_y
    else:
        wr_x = wr_y = sh_x = sh_y = None

    if wr_x is not None:
        sleeve_length_cm = ((wr_x - sh_x) ** 2 + (wr_y - sh_y) ** 2) ** 0.5 * cm_per_px
    else:
        # Braccia non visibili (es. lungo i fianchi, foto stretta): stima da proporzione tipica.
        sleeve_length_cm = altezza_cm * 0.335

    waist_width_cm = hip_width_cm * _WAIST_WIDTH_TO_HIP_WIDTH_RATIO

    misure = {
        "busto_cm": round(shoulder_width_cm * _CHEST_WIDTH_TO_CIRCUMFERENCE, 1),
        "vita_cm": round(waist_width_cm * _WAIST_WIDTH_TO_CIRCUMFERENCE, 1),
        "fianchi_cm": round(hip_width_cm * _HIP_WIDTH_TO_CIRCUMFERENCE, 1),
        "spalle_cm": round(shoulder_width_cm, 1),
        "torso_cm": round(torso_height_cm, 1),
        "inseam_cm": round(leg_length_cm * _INSEAM_HIP_TO_ANKLE_FACTOR, 1),
        "manica_cm": round(sleeve_length_cm, 1),
    }

    avg_visibility = sum(visibility(i) for i in critical) / len(critical)
    confidence = max(_MIN_AVG_VISIBILITY_FOR_CONFIDENCE, min(avg_visibility, 0.97))

    return BodyScanEstimate(confidence=round(confidence, 2), **misure)


@router.post("/estimate", response_model=BodyScanEstimate)
def estimate(payload: BodyScanRequest) -> BodyScanEstimate:
    """Scarica la foto frontale, rileva la persona con MediaPipe Pose e stima le
    misure calibrandole sull'altezza dichiarata. Fallisce con 422 se non c'e' una
    persona rilevabile o il corpo non e' inquadrato per intero (comportamento REALE:
    a differenza della versione precedente, foto senza una persona ora vengono
    davvero rifiutate)."""
    image = _download_image(payload.foto_front_url)
    landmarks = _detect_landmarks(image)
    height, width = image.shape[:2]
    return estimate_from_landmarks(landmarks, width, height, payload.altezza_cm)
