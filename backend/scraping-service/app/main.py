"""
Reflct Scraping Service — FastAPI app.

Espone l'endpoint di import capo da URL e-commerce usato dal backend-api
(Spring Boot) come da Concept v4.0 sez. 8 (API Contract):
POST /api/v1/garments/import delega a questo servizio.
"""
from fastapi import FastAPI

from app.routers import scrape

app = FastAPI(
    title="Reflct Scraping Service",
    description="Import capo da URL e-commerce (scraping + parsing) per la piattaforma Reflct",
    version="0.1.0",
)

app.include_router(scrape.router)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok", "service": "scraping-service"}
