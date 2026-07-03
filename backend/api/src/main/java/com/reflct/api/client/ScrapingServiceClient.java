package com.reflct.api.client;

import java.util.Map;

/**
 * Client verso il microservizio Python scraping-service (Playwright + BeautifulSoup4 +
 * fallback LLM). Vedi Concept Document v4.0, sezione 5.2 (Import E-Commerce & Scraping).
 */
public interface ScrapingServiceClient {

    /**
     * Avvia l'estrazione di un capo da un URL e-commerce (foto, misure, prezzo, brand).
     * Endpoint FastAPI ipotizzato: POST /scrape/import.
     */
    Map<String, Object> importGarment(String urlOriginale);
}
