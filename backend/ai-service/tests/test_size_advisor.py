import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models import BodyMeasures
from app.routers.size_advisor import compute_size_advice

client = TestClient(app)


def test_compute_size_advice_picks_closest_size():
    body = BodyMeasures(busto_cm=96, vita_cm=80, fianchi_cm=102)
    size_chart = {
        "S": {"busto_cm": 88, "vita_cm": 72, "fianchi_cm": 94},
        "M": {"busto_cm": 96, "vita_cm": 80, "fianchi_cm": 102},
        "L": {"busto_cm": 104, "vita_cm": 88, "fianchi_cm": 110},
    }
    result = compute_size_advice(body, size_chart)
    assert result.consigliata == "M"
    assert result.fit_score == 100.0
    assert result.dettaglio["busto_cm"] == "PERFETTO"
    assert result.dettaglio["vita_cm"] == "PERFETTO"
    assert result.dettaglio["fianchi_cm"] == "PERFETTO"


def test_compute_size_advice_prefers_nearest_when_no_exact_match():
    body = BodyMeasures(busto_cm=99, vita_cm=83, fianchi_cm=104)
    size_chart = {
        "S": {"busto_cm": 88, "vita_cm": 72, "fianchi_cm": 94},
        "M": {"busto_cm": 96, "vita_cm": 80, "fianchi_cm": 102},
        "L": {"busto_cm": 104, "vita_cm": 88, "fianchi_cm": 110},
    }
    result = compute_size_advice(body, size_chart)
    assert result.consigliata == "M"
    assert 0 < result.fit_score < 100


def test_compute_size_advice_flags_large_deltas_with_sign():
    body = BodyMeasures(busto_cm=80, vita_cm=65, fianchi_cm=88)
    size_chart = {
        "M": {"busto_cm": 96, "vita_cm": 80, "fianchi_cm": 102},
    }
    result = compute_size_advice(body, size_chart)
    assert result.consigliata == "M"
    # taglia più abbondante del corpo -> scostamento positivo
    assert result.dettaglio["busto_cm"].startswith("+")
    assert result.fit_score < 60


def test_compute_size_advice_raises_on_empty_chart():
    body = BodyMeasures(busto_cm=96, vita_cm=80, fianchi_cm=102)
    with pytest.raises(ValueError):
        compute_size_advice(body, {})


def test_compute_size_advice_raises_when_no_overlap_measures():
    body = BodyMeasures(manica_cm=60)
    size_chart = {"M": {"busto_cm": 96}}
    with pytest.raises(ValueError):
        compute_size_advice(body, size_chart)


def test_size_advisor_endpoint_returns_valid_response():
    payload = {
        "body_measures": {"busto_cm": 96, "vita_cm": 80, "fianchi_cm": 102},
        "size_chart": {
            "S": {"busto_cm": 88, "vita_cm": 72, "fianchi_cm": 94},
            "M": {"busto_cm": 96, "vita_cm": 80, "fianchi_cm": 102},
            "L": {"busto_cm": 104, "vita_cm": 88, "fianchi_cm": 110},
        },
    }
    response = client.post("/size-advisor", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["consigliata"] == "M"
    assert body["fit_score"] == 100.0
