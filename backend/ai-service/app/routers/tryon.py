"""
Router Try-On Render.

MOCK: nella versione reale il rendering AI ad alta qualita' userebbe
OOTDiffusion + ControlNet (per la sintesi della vista posteriore quando il sito
ha solo foto frontale), eseguiti in modo asincrono su GPU con frame sampling
ogni ~500ms e output 512x512 in circa 800ms, come descritto nel Concept v4.0
sez. 5.1. Qui il job viene creato e segnato immediatamente come "done" per
semplicita' di scaffolding: non c'e' alcuna coda/gpu reale dietro.
"""
import uuid

from fastapi import APIRouter, HTTPException

from app.models import JobStatus, TryOnJobCreated, TryOnJobResult, TryOnRenderRequest

router = APIRouter(prefix="/tryon", tags=["tryon"])

# Storage in-memory dei job mock. In produzione sarebbe una coda (es. Redis +
# worker GPU) con stato persistito, non un dict in RAM del processo FastAPI.
_JOBS: dict[str, TryOnRenderRequest] = {}


@router.post("/render", response_model=TryOnJobCreated)
def create_render_job(payload: TryOnRenderRequest) -> TryOnJobCreated:
    """Crea un job di rendering try-on mock e ritorna subito lo stato 'processing'."""
    job_id = str(uuid.uuid4())
    _JOBS[job_id] = payload
    return TryOnJobCreated(job_id=job_id, status=JobStatus.processing)


@router.get("/render/{job_id}", response_model=TryOnJobResult)
def get_render_job(job_id: str) -> TryOnJobResult:
    """Ritorna lo stato del job. MOCK: simula 'pronto' immediatamente.

    Nella realta' userebbe OOTDiffusion/ControlNet in modo asincrono su GPU
    (vedi Concept v4.0 sez. 5.1) e questo endpoint farebbe polling sullo stato
    reale del job in coda.
    """
    if job_id not in _JOBS:
        raise HTTPException(status_code=404, detail="job non trovato")

    return TryOnJobResult(
        job_id=job_id,
        status=JobStatus.done,
        output_url=f"https://mock.reflct.app/render/{job_id}.png",
    )
