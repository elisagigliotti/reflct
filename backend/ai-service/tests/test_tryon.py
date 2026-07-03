from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_create_render_job_returns_processing():
    payload = {"session_id": "sess-1", "garment_id": "garment-1", "vista": "front"}
    response = client.post("/tryon/render", json=payload)
    assert response.status_code == 200

    body = response.json()
    assert body["status"] == "processing"
    assert "job_id" in body and body["job_id"]


def test_get_render_job_returns_done_with_output_url():
    create_response = client.post(
        "/tryon/render", json={"session_id": "sess-2", "garment_id": "garment-2", "vista": "back"}
    )
    job_id = create_response.json()["job_id"]

    result_response = client.get(f"/tryon/render/{job_id}")
    assert result_response.status_code == 200

    body = result_response.json()
    assert body["job_id"] == job_id
    assert body["status"] == "done"
    assert body["output_url"] == f"https://mock.reflct.app/render/{job_id}.png"


def test_get_render_job_unknown_id_returns_404():
    response = client.get("/tryon/render/does-not-exist")
    assert response.status_code == 404


def test_default_vista_is_front():
    response = client.post("/tryon/render", json={"session_id": "sess-3", "garment_id": "garment-3"})
    assert response.status_code == 200
