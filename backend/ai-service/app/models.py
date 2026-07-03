"""
Modelli Pydantic condivisi per l'AI Service.

Le forme di questi payload rispecchiano le entita' del "Modello Dati" (Concept
Document v4.0, sez. 7): BodyScan (misure_json con le 7 misure corporee) e
TryOnSession (vista, taglia_consigliata, fit_score).
"""
from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Body Scan (sez. 5.3 del Concept)
# ---------------------------------------------------------------------------
class BodyScanRequest(BaseModel):
    user_id: str
    altezza_cm: float = Field(..., gt=0, description="Altezza inserita manualmente dall'utente, usata per calibrazione")
    foto_front_url: str
    foto_side_url: Optional[str] = None
    video_url: Optional[str] = None


class BodyScanEstimate(BaseModel):
    busto_cm: float
    vita_cm: float
    fianchi_cm: float
    spalle_cm: float
    torso_cm: float
    inseam_cm: float
    manica_cm: float
    confidence: float = Field(..., ge=0, le=1)


# ---------------------------------------------------------------------------
# Try-On (sez. 5.1 del Concept)
# ---------------------------------------------------------------------------
Vista = Literal["front", "back"]


class TryOnRenderRequest(BaseModel):
    session_id: str
    garment_id: str
    vista: Vista = "front"


class JobStatus(str, Enum):
    processing = "processing"
    done = "done"
    failed = "failed"


class TryOnJobCreated(BaseModel):
    job_id: str
    status: JobStatus = JobStatus.processing


class TryOnJobResult(BaseModel):
    job_id: str
    status: JobStatus
    output_url: Optional[str] = None


# ---------------------------------------------------------------------------
# Size Advisor (sez. 5.3 del Concept)
# ---------------------------------------------------------------------------
class BodyMeasures(BaseModel):
    busto_cm: Optional[float] = None
    vita_cm: Optional[float] = None
    fianchi_cm: Optional[float] = None
    spalle_cm: Optional[float] = None
    torso_cm: Optional[float] = None
    inseam_cm: Optional[float] = None
    manica_cm: Optional[float] = None


class SizeAdvisorRequest(BaseModel):
    body_measures: BodyMeasures
    size_chart: dict[str, dict[str, float]] = Field(
        ..., description="Mappa taglia -> {misura: cm}, es. {'M': {'busto_cm': 96, 'vita_cm': 80}}"
    )


class SizeAdvisorResponse(BaseModel):
    consigliata: str
    fit_score: float = Field(..., ge=0, le=100)
    dettaglio: dict[str, str]
