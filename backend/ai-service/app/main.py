"""
Reflct AI Service — FastAPI app.

Espone gli endpoint di body scan (stima misure), try-on render (job mock) e
size advisor (logica reale) usati dal backend-api (Spring Boot) come da
Concept v4.0 sez. 8 (API Contract): POST /api/v1/body-scan e affini delegano
a questo servizio.
"""
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.routers import bodyscan, size_advisor, tryon

app = FastAPI(
    title="Reflct AI Service",
    description="Body scan, try-on render (CatVTON) e size advisor per la piattaforma Reflct",
    version="0.1.0",
)

app.include_router(bodyscan.router)
app.include_router(tryon.router)
app.include_router(size_advisor.router)

# Immagini renderizzate dal try-on (vedi routers/tryon.py): servite staticamente,
# stesso pattern di /uploads lato backend/api (com.reflct.api.media).
_OUTPUTS_DIR = Path(__file__).resolve().parent.parent / "outputs"
_OUTPUTS_DIR.mkdir(exist_ok=True)
app.mount("/outputs", StaticFiles(directory=str(_OUTPUTS_DIR)), name="outputs")


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-service"}
