"""
Modelli Pydantic per lo scraping-service.

`GarmentItem` rispecchia (in forma ridotta, i campi prodotti da questo
servizio) l'entita' GarmentItem del "Modello Dati" (Concept Document v4.0,
sez. 7): url_originale, nome, brand, prezzo_attuale, foto_front_url,
foto_back_url, source_domain.
"""
from typing import Optional

from pydantic import BaseModel, HttpUrl


class ScrapeRequest(BaseModel):
    url: HttpUrl


class GarmentItem(BaseModel):
    url_originale: str
    nome: str
    brand: str
    prezzo_attuale: Optional[float] = None
    foto_front_url: Optional[str] = None
    foto_back_url: Optional[str] = None
    source_domain: str
