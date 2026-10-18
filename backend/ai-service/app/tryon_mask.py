"""
Genera la maschera "da riempire" per CatVTON a partire dai landmark posa di
MediaPipe (stesso modello BlazePose gia' usato per il body-scan, vedi
routers/bodyscan.py — qui e' un secondo detector indipendente per non toccare
quel modulo gia' testato).

CatVTON originale userebbe SCHP + DensePose (human parsing) per una maschera
precisa che segue i contorni del corpo: entrambi richiedono Detectron2, che
non ha wheel ufficiali per Windows e va compilato da sorgente (rischio alto di
rompere l'ambiente). Qui si approssima invece con un poligono derivato dai
landmark posa (spalle/fianchi/caviglie), gia' disponibili e testati in questo
stesso servizio: risultato meno preciso di una vera human-parsing mask (segue
un trapezoide, non il contorno esatto dei vestiti), ma sufficiente per
un'inpainting diffusion-based come CatVTON, che e' abbastanza tollerante a
maschere imperfette.
"""
from pathlib import Path

import cv2
import mediapipe as mp
import numpy as np
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision
from PIL import Image, ImageDraw

_MODEL_PATH = Path(__file__).resolve().parent / "models_bin" / "pose_landmarker.task"

_L_SHOULDER, _R_SHOULDER = 11, 12
_L_HIP, _R_HIP = 23, 24
_L_ANKLE, _R_ANKLE = 27, 28

_detector: mp_vision.PoseLandmarker | None = None


def _get_detector() -> mp_vision.PoseLandmarker:
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


def detect_landmarks_or_none(image_bgr: np.ndarray):
    rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    result = _get_detector().detect(mp_image)
    if not result.pose_landmarks:
        return None
    return result.pose_landmarks[0]


def garment_region(categoria: str | None) -> str:
    """Euristica su testo libero (categoria scraping, vedi GarmentItem.categoria
    lato Java): non e' una vera classificazione ML, solo parole chiave note."""
    if not categoria:
        return "upper"
    c = categoria.lower()
    if any(k in c for k in ("vestit", "abito", "dress", "tuta", "jumpsuit")):
        return "full"
    if any(k in c for k in ("pantalon", "jeans", "gonna", "skirt", "short", "pant", "trouser")):
        return "lower"
    return "upper"


def build_agnostic_mask(image_bgr: np.ndarray, categoria: str | None) -> Image.Image:
    """Ritorna una maschera PIL 'L' (bianco = area da rigenerare) grande quanto
    l'immagine sorgente, coprendo la regione plausibile del capo indicato."""
    height, width = image_bgr.shape[:2]
    landmarks = detect_landmarks_or_none(image_bgr)
    mask = Image.new("L", (width, height), 0)

    if landmarks is None:
        # Nessuna posa rilevata: fallback su una fascia centrale generica
        # (meglio di niente, ma l'endpoint segnala comunque bassa confidenza).
        draw = ImageDraw.Draw(mask)
        draw.rectangle([width * 0.2, height * 0.15, width * 0.8, height * 0.85], fill=255)
        return mask

    def px(idx: int) -> tuple[float, float]:
        p = landmarks[idx]
        return p.x * width, p.y * height

    l_sh_x, l_sh_y = px(_L_SHOULDER)
    r_sh_x, r_sh_y = px(_R_SHOULDER)
    l_hip_x, l_hip_y = px(_L_HIP)
    r_hip_x, r_hip_y = px(_R_HIP)
    l_ank_x, l_ank_y = px(_L_ANKLE)
    r_ank_x, r_ank_y = px(_R_ANKLE)

    shoulder_y = min(l_sh_y, r_sh_y)
    hip_y = (l_hip_y + r_hip_y) / 2
    ankle_y = max(l_ank_y, r_ank_y)
    shoulder_span = abs(r_sh_x - l_sh_x)
    hip_span = abs(r_hip_x - l_hip_x)
    margin_x = max(shoulder_span, hip_span) * 0.35

    region = garment_region(categoria)
    draw = ImageDraw.Draw(mask)

    if region == "lower":
        top = hip_y - (ankle_y - hip_y) * 0.08
        bottom = min(ankle_y + (ankle_y - hip_y) * 0.12, height)
        left = min(l_hip_x, r_hip_x) - margin_x
        right = max(l_hip_x, r_hip_x) + margin_x
    elif region == "full":
        top = shoulder_y - (hip_y - shoulder_y) * 0.25
        bottom = min(ankle_y + (ankle_y - hip_y) * 0.08, height)
        left = min(l_sh_x, r_sh_x, l_hip_x, r_hip_x) - margin_x
        right = max(l_sh_x, r_sh_x, l_hip_x, r_hip_x) + margin_x
    else:  # upper
        top = shoulder_y - (hip_y - shoulder_y) * 0.25
        bottom = hip_y + (hip_y - shoulder_y) * 0.15
        left = min(l_sh_x, r_sh_x) - margin_x
        right = max(l_sh_x, r_sh_x) + margin_x

    left = max(0, left)
    top = max(0, top)
    right = min(width, right)
    bottom = min(height, bottom)
    draw.rectangle([left, top, right, bottom], fill=255)
    return mask
