"""
Router di scraping.

Implementazione REALE (non mock): scarica la pagina con `requests` e la
parsa con BeautifulSoup (logica in app/parser.py). Il fallback LLM
(`llm_fallback_extract`) viene invocato solo se il parsing euristico
solleva un errore, e in questo scaffold non e' realmente implementato
(vedi Concept v4.0 sez. 5.2).
"""
import logging

import requests
from fastapi import APIRouter, HTTPException

from app.models import GarmentItem, ScrapeRequest
from app.parser import llm_fallback_extract, parse_garment_html

router = APIRouter(tags=["scrape"])

logger = logging.getLogger(__name__)

_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)
_TIMEOUT_SECONDS = 10


@router.post("/scrape", response_model=GarmentItem)
def scrape(payload: ScrapeRequest) -> GarmentItem:
    url = str(payload.url)

    try:
        response = requests.get(
            url,
            headers={"User-Agent": _USER_AGENT},
            timeout=_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
    except requests.exceptions.Timeout as exc:
        raise HTTPException(status_code=504, detail="timeout durante il download della pagina") from exc
    except requests.exceptions.ConnectionError as exc:
        raise HTTPException(status_code=504, detail="impossibile connettersi all'URL fornito") from exc
    except requests.exceptions.HTTPError as exc:
        raise HTTPException(
            status_code=422, detail=f"la pagina ha risposto con errore HTTP: {exc}"
        ) from exc
    except requests.exceptions.RequestException as exc:
        raise HTTPException(status_code=422, detail=f"richiesta fallita: {exc}") from exc

    try:
        return parse_garment_html(response.text, url)
    except ValueError:
        # Parsing euristico fallito: prova il fallback LLM (non implementato
        # in questo scaffold, vedi Concept v4.0 sez. 5.2).
        try:
            risultato = llm_fallback_extract(response.text)
        except NotImplementedError as exc:
            raise HTTPException(
                status_code=422,
                detail="impossibile estrarre i dati del prodotto: parsing euristico fallito e fallback LLM non configurato",
            ) from exc

        if risultato is None:
            raise HTTPException(
                status_code=422,
                detail="impossibile estrarre i dati del prodotto dalla pagina",
            )
        return risultato
