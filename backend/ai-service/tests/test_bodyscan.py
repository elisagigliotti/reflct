from dataclasses import dataclass
from pathlib import Path
from unittest.mock import patch

import cv2
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.main import app
from app.routers.bodyscan import estimate_from_landmarks

client = TestClient(app)

FIXTURE_DIR = Path(__file__).resolve().parent / "fixtures"


@dataclass
class FakeLandmark:
    x: float
    y: float
    visibility: float


def _make_landmarks(scale: float = 1.0, arms_visible: bool = True) -> list[FakeLandmark]:
    """33 landmark BlazePose plausibili per una persona in piedi, frontale.
    `scale` sposta di poco fianchi/spalle in orizzontale per simulare corporature diverse."""
    lm = [FakeLandmark(0.5, 0.5, 0.9) for _ in range(33)]
    lm[0] = FakeLandmark(0.5, 0.10, 0.99)  # naso
    lm[11] = FakeLandmark(0.5 - 0.09 * scale, 0.22, 1.0)  # spalla sx
    lm[12] = FakeLandmark(0.5 + 0.09 * scale, 0.22, 1.0)  # spalla dx
    lm[23] = FakeLandmark(0.5 - 0.08 * scale, 0.50, 1.0)  # anca sx
    lm[24] = FakeLandmark(0.5 + 0.08 * scale, 0.50, 1.0)  # anca dx
    lm[27] = FakeLandmark(0.48, 0.95, 0.9)  # caviglia sx
    lm[28] = FakeLandmark(0.52, 0.95, 0.9)  # caviglia dx
    vis = 0.8 if arms_visible else 0.05
    lm[15] = FakeLandmark(0.55, 0.35, vis)  # polso sx
    lm[16] = FakeLandmark(0.45, 0.35, vis)  # polso dx
    return lm


def test_estimate_from_landmarks_scales_with_declared_height():
    lm = _make_landmarks()
    misure_basse = estimate_from_landmarks(lm, image_width=600, image_height=800, altezza_cm=150)
    misure_alte = estimate_from_landmarks(lm, image_width=600, image_height=800, altezza_cm=200)

    assert misure_alte.busto_cm > misure_basse.busto_cm
    assert misure_alte.inseam_cm > misure_basse.inseam_cm


def test_estimate_from_landmarks_returns_all_seven_measures():
    lm = _make_landmarks()
    result = estimate_from_landmarks(lm, image_width=600, image_height=800, altezza_cm=170)

    for campo in ["busto_cm", "vita_cm", "fianchi_cm", "spalle_cm", "torso_cm", "inseam_cm", "manica_cm"]:
        assert getattr(result, campo) > 0
    assert 0 <= result.confidence <= 1


def test_estimate_from_landmarks_falls_back_to_proportion_when_arms_not_visible():
    lm = _make_landmarks(arms_visible=False)
    result = estimate_from_landmarks(lm, image_width=600, image_height=800, altezza_cm=170)

    assert result.manica_cm == round(170 * 0.335, 1)


def test_estimate_from_landmarks_rejects_missing_body_parts():
    lm = _make_landmarks()
    lm[27].visibility = 0.02  # caviglia sinistra non visibile
    lm[28].visibility = 0.02

    with pytest.raises(HTTPException) as exc_info:
        estimate_from_landmarks(lm, image_width=600, image_height=800, altezza_cm=170)
    assert exc_info.value.status_code == 422


def test_bodyscan_estimate_endpoint_detects_real_person_in_fixture_photo():
    """Verifica end-to-end (download mockato, pose detection REALE) su una foto
    vera con una persona: a differenza della versione mock precedente, il
    contenuto della foto viene davvero analizzato."""
    photo_bytes = (FIXTURE_DIR / "person_front.jpg").read_bytes()

    class FakeResponse:
        content = photo_bytes

        def raise_for_status(self):
            pass

    with patch("app.routers.bodyscan.requests.get", return_value=FakeResponse()):
        payload = {
            "user_id": "user-abc",
            "altezza_cm": 168,
            "foto_front_url": "https://example.test/front.jpg",
            "foto_side_url": None,
            "video_url": None,
        }
        response = client.post("/bodyscan/estimate", json=payload)

    assert response.status_code == 200
    body = response.json()
    for campo in ["busto_cm", "vita_cm", "fianchi_cm", "spalle_cm", "torso_cm", "inseam_cm", "manica_cm", "confidence"]:
        assert campo in body
    assert body["confidence"] > 0.3


def test_bodyscan_estimate_endpoint_rejects_photo_without_a_person():
    """Foto reale ma senza persona rilevabile (sfondo/paesaggio): a differenza
    della versione mock, ora viene rifiutata invece di restituire numeri finti."""
    blank = cv2.imencode(".jpg", cv2.UMat(400, 300, cv2.CV_8UC3).get())[1].tobytes()

    class FakeResponse:
        content = blank

        def raise_for_status(self):
            pass

    with patch("app.routers.bodyscan.requests.get", return_value=FakeResponse()):
        payload = {
            "user_id": "user-abc",
            "altezza_cm": 168,
            "foto_front_url": "https://example.test/empty.jpg",
        }
        response = client.post("/bodyscan/estimate", json=payload)

    assert response.status_code == 422


def test_bodyscan_estimate_endpoint_rejects_unreachable_url():
    with patch("app.routers.bodyscan.requests.get", side_effect=__import__("requests").exceptions.ConnectionError):
        payload = {
            "user_id": "user-bad",
            "altezza_cm": 168,
            "foto_front_url": "https://does-not-exist.test/front.jpg",
        }
        response = client.post("/bodyscan/estimate", json=payload)

    assert response.status_code == 422


def test_bodyscan_estimate_rejects_invalid_height():
    payload = {
        "user_id": "user-bad",
        "altezza_cm": -10,
        "foto_front_url": "https://example.com/front.jpg",
    }
    response = client.post("/bodyscan/estimate", json=payload)
    assert response.status_code == 422
