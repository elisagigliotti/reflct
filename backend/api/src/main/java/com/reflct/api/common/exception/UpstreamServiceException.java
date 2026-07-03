package com.reflct.api.common.exception;

/**
 * Sollevata quando una chiamata verso un servizio esterno (ai-service, scraping-service)
 * fallisce o non risponde. Mappata su HTTP 502 Bad Gateway da GlobalExceptionHandler:
 * l'applicazione non deve mai crashare per l'indisponibilita' di un servizio a valle.
 */
public class UpstreamServiceException extends RuntimeException {
    public UpstreamServiceException(String message) {
        super(message);
    }

    public UpstreamServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
