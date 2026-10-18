"""
Router Try-On Render — rendering REALE con CatVTON (diffusion model), non piu'
mock. Vedi app/tryon_inference.py per il wrapper d'inferenza e
app/tryon_model/ per il codice vendorizzato da CatVTON (licenza CC BY-NC-SA
4.0, SOLO USO NON COMMERCIALE — vedi README.md di questo servizio).

Il job viene reso in modo SINCRONO dentro create_render_job (come
routers/bodyscan.py): niente coda GPU/worker separato. Per un singolo utente
alla volta va bene; sotto carico concorrente andrebbe messa una vera coda
(Redis + worker), che oggi non c'e'.
"""
import logging
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.models import JobStatus, TryOnJobCreated, TryOnJobResult, TryOnRenderRequest
from app.tryon_inference import render_tryon

router = APIRouter(prefix="/tryon", tags=["tryon"])
logger = logging.getLogger(__name__)

_OUTPUTS_DIR = Path(__file__).resolve().parent.parent.parent / "outputs"
_OUTPUTS_DIR.mkdir(exist_ok=True)
# Deve essere raggiungibile direttamente dal browser/telefono che mostra il
# risultato (backend/api si limita a inoltrare questo URL, non fa da proxy).
_PUBLIC_BASE_URL = os.environ.get("AI_SERVICE_PUBLIC_BASE_URL", "http://localhost:8001").rstrip("/")

# Storage in-memory dei job. In produzione andrebbe persistito (Redis/DB) e
# reso asincrono con un worker GPU separato — qui il rendering e' sincrono
# (vedi docstring del modulo), quindi il job e' gia' "done" quando si ritorna.
_JOBS: dict[str, TryOnJobResult] = {}


@router.post("/render", response_model=TryOnJobCreated)
def create_render_job(payload: TryOnRenderRequest) -> TryOnJobCreated:
    job_id = str(uuid.uuid4())
    try:
        image = render_tryon(payload.person_image_url, payload.garment_image_url, payload.garment_categoria)
        output_path = _OUTPUTS_DIR / f"{job_id}.jpg"
        image.save(output_path, "JPEG", quality=92)
        _JOBS[job_id] = TryOnJobResult(
            job_id=job_id, status=JobStatus.done, output_url=f"{_PUBLIC_BASE_URL}/outputs/{job_id}.jpg"
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Rendering try-on fallito per job %s", job_id)
        _JOBS[job_id] = TryOnJobResult(job_id=job_id, status=JobStatus.failed, output_url=None)
    return TryOnJobCreated(job_id=job_id, status=_JOBS[job_id].status)


@router.get("/render/{job_id}", response_model=TryOnJobResult)
def get_render_job(job_id: str) -> TryOnJobResult:
    result = _JOBS.get(job_id)
    if result is None:
        raise HTTPException(status_code=404, detail="job non trovato")
    return result
