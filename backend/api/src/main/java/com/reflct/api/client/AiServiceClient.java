package com.reflct.api.client;

import java.util.Map;

/**
 * Client verso il microservizio Python ai-service (FastAPI), responsabile di:
 *  - stima misure corporee da body scan (mock deterministico, vedi ai-service/app/routers/bodyscan.py)
 *  - rendering try-on (job mock asincrono, vedi ai-service/app/routers/tryon.py)
 *  - size advisor (logica reale di confronto misure, vedi ai-service/app/routers/size_advisor.py)
 * Vedi Concept Document v4.0, sezioni 4.2 e 5.1/5.3.
 *
 * Contratto allineato ai modelli Pydantic reali in backend/ai-service/app/models.py
 * (non e' uno stub indovinato: rispecchia l'implementazione FastAPI effettiva).
 */
public interface AiServiceClient {

    /**
     * Stima le misure corporee. Corrisponde a POST /bodyscan/estimate su ai-service.
     * Risposta attesa: { busto_cm, vita_cm, fianchi_cm, spalle_cm, torso_cm, inseam_cm,
     * manica_cm, confidence } (tutti numeri).
     */
    Map<String, Object> estimateBodyMeasurements(String userId, String fotoFrontUrl, String fotoSideUrl, String videoUrl, Double altezzaCm);

    /**
     * Crea un job di rendering try-on. Corrisponde a POST /tryon/render su ai-service.
     * Risposta attesa: { job_id, status } con status iniziale "processing".
     * `vista` deve essere "front" o "back" (non "FRONTE"/"RETRO" come nell'entita' TryOnSession).
     */
    Map<String, Object> createTryOnRenderJob(String sessionId, String garmentId, String vista);

    /**
     * Interroga lo stato del job di rendering. Corrisponde a GET /tryon/render/{jobId}.
     * Risposta attesa: { job_id, status, output_url } — nello scaffold attuale il job e'
     * sempre gia' "done" al primo poll (nessuna vera coda GPU dietro, vedi ai-service).
     */
    Map<String, Object> getTryOnRenderJob(String jobId);

    /**
     * Suggerisce la taglia migliore. Corrisponde a POST /size-advisor su ai-service.
     * Risposta attesa: { consigliata, fit_score, dettaglio } dove dettaglio e' una mappa
     * misura -> etichetta ("PERFETTO"/"OK"/"+Ncm"/"-Ncm").
     */
    Map<String, Object> adviseSize(Map<String, Object> bodyMeasures, Map<String, Object> sizeChart);
}
