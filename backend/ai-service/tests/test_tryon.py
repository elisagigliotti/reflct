from unittest.mock import patch

from fastapi import HTTPException
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app

client = TestClient(app)

_PAYLOAD = {
    "session_id": "sess-1",
    "garment_id": "garment-1",
    "vista": "front",
    "person_image_url": "https://example.test/person.jpg",
    "garment_image_url": "https://example.test/garment.jpg",
}


def _fake_image() -> Image.Image:
    return Image.new("RGB", (16, 16), (200, 200, 200))


def test_create_render_job_returns_done_with_output_url():
    with patch("app.routers.tryon.render_tryon", return_value=_fake_image()) as mocked:
        response = client.post("/tryon/render", json=_PAYLOAD)
        assert response.status_code == 200
        mocked.assert_called_once_with(
            _PAYLOAD["person_image_url"], _PAYLOAD["garment_image_url"], None
        )

    body = response.json()
    assert body["status"] == "done"
    assert body["job_id"]


def test_get_render_job_returns_persisted_result():
    with patch("app.routers.tryon.render_tryon", return_value=_fake_image()):
        create_response = client.post("/tryon/render", json=_PAYLOAD)
    job_id = create_response.json()["job_id"]

    result_response = client.get(f"/tryon/render/{job_id}")
    assert result_response.status_code == 200

    body = result_response.json()
    assert body["job_id"] == job_id
    assert body["status"] == "done"
    assert body["output_url"].endswith(f"/outputs/{job_id}.jpg")


def test_get_render_job_unknown_id_returns_404():
    response = client.get("/tryon/render/does-not-exist")
    assert response.status_code == 404


def test_create_render_job_propagates_image_download_errors():
    with patch(
        "app.routers.tryon.render_tryon",
        side_effect=HTTPException(status_code=422, detail="impossibile scaricare l'immagine"),
    ):
        response = client.post("/tryon/render", json=_PAYLOAD)
    assert response.status_code == 422


def test_create_render_job_marks_job_failed_on_unexpected_error():
    with patch("app.routers.tryon.render_tryon", side_effect=RuntimeError("boom")):
        response = client.post("/tryon/render", json=_PAYLOAD)

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "failed"

    result_response = client.get(f"/tryon/render/{body['job_id']}")
    assert result_response.json()["status"] == "failed"
    assert result_response.json()["output_url"] is None


def test_render_request_requires_image_urls():
    payload = {"session_id": "sess-x", "garment_id": "garment-x"}
    response = client.post("/tryon/render", json=payload)
    assert response.status_code == 422
