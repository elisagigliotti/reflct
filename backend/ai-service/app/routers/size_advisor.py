"""
Router Size Advisor.

Logica REALE (non mock): confronta le misure corporee dell'utente con la
tabella taglie del capo (estratta dallo scraping-service) e suggerisce la
taglia con la minor distanza pesata, come descritto nel Concept v4.0 sez. 5.3.
"""
from fastapi import APIRouter

from app.models import BodyMeasures, SizeAdvisorRequest, SizeAdvisorResponse

router = APIRouter(prefix="/size-advisor", tags=["size-advisor"])

# Pesi per misura: busto/vita/fianchi contano di piu' nella vestibilita'
# generale di un capo rispetto a spalle/torso/inseam/manica.
_WEIGHTS = {
    "busto_cm": 1.2,
    "vita_cm": 1.2,
    "fianchi_cm": 1.2,
    "spalle_cm": 1.0,
    "torso_cm": 0.8,
    "inseam_cm": 0.8,
    "manica_cm": 0.8,
}

# Soglie (in cm) per classificare lo scostamento su una singola misura.
_PERFETTO_SOGLIA_CM = 1.5
_OK_SOGLIA_CM = 4.0


def _classifica_scostamento(delta_cm: float) -> str:
    """Classifica lo scostamento (taglia - corpo) in etichetta leggibile."""
    if abs(delta_cm) <= _PERFETTO_SOGLIA_CM:
        return "PERFETTO"
    if abs(delta_cm) <= _OK_SOGLIA_CM:
        return "OK"
    if delta_cm > 0:
        return f"+{round(delta_cm, 1)}cm"
    return f"-{round(abs(delta_cm), 1)}cm"


def compute_size_advice(body_measures: BodyMeasures, size_chart: dict[str, dict[str, float]]) -> SizeAdvisorResponse:
    """Calcola la taglia consigliata, il fit score e il dettaglio per misura.

    Per ogni taglia disponibile calcola una distanza pesata (somma dei valori
    assoluti degli scostamenti, pesati per importanza della misura) rispetto
    alle misure del corpo. Sceglie la taglia con distanza minima.
    """
    body_dict = body_measures.model_dump(exclude_none=True)

    if not size_chart:
        raise ValueError("size_chart non puo' essere vuoto")

    migliore_taglia = None
    migliore_distanza = float("inf")
    migliore_dettaglio: dict[str, str] = {}
    migliore_scostamenti: list[float] = []

    for taglia, misure_taglia in size_chart.items():
        distanza_pesata = 0.0
        peso_totale = 0.0
        dettaglio: dict[str, str] = {}
        scostamenti: list[float] = []

        for misura, valore_corpo in body_dict.items():
            if misura not in misure_taglia:
                continue
            valore_taglia = misure_taglia[misura]
            delta = valore_taglia - valore_corpo
            peso = _WEIGHTS.get(misura, 1.0)

            distanza_pesata += abs(delta) * peso
            peso_totale += peso
            scostamenti.append(abs(delta))
            dettaglio[misura] = _classifica_scostamento(delta)

        # Se non c'e' overlap di misure tra body e size_chart per questa
        # taglia, la saltiamo (non abbiamo dati per giudicarla).
        if peso_totale == 0:
            continue

        distanza_normalizzata = distanza_pesata / peso_totale

        if distanza_normalizzata < migliore_distanza:
            migliore_distanza = distanza_normalizzata
            migliore_taglia = taglia
            migliore_dettaglio = dettaglio
            migliore_scostamenti = scostamenti

    if migliore_taglia is None:
        raise ValueError("nessuna misura in comune tra body_measures e size_chart")

    # Fit score: 100 quando la distanza media pesata e' 0, decresce
    # linearmente fino a 0 quando la distanza raggiunge/supera 10cm.
    fit_score = max(0.0, 100.0 - (migliore_distanza * 10.0))
    fit_score = min(100.0, fit_score)

    return SizeAdvisorResponse(
        consigliata=migliore_taglia,
        fit_score=round(fit_score, 1),
        dettaglio=migliore_dettaglio,
    )


@router.post("", response_model=SizeAdvisorResponse)
def size_advisor(payload: SizeAdvisorRequest) -> SizeAdvisorResponse:
    """Suggerisce la taglia migliore dato il corpo dell'utente e la tabella taglie del capo."""
    return compute_size_advice(payload.body_measures, payload.size_chart)
