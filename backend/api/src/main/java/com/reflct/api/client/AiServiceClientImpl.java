package com.reflct.api.client;

import com.reflct.api.common.exception.UpstreamServiceException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.HashMap;
import java.util.Map;

@Component
public class AiServiceClientImpl implements AiServiceClient {

    private final RestClient aiServiceRestClient;

    public AiServiceClientImpl(@Qualifier("aiServiceRestClient") RestClient aiServiceRestClient) {
        this.aiServiceRestClient = aiServiceRestClient;
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> estimateBodyMeasurements(String userId, String fotoFrontUrl, String fotoSideUrl, String videoUrl, Double altezzaCm) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("user_id", userId);
        payload.put("altezza_cm", altezzaCm);
        payload.put("foto_front_url", fotoFrontUrl);
        payload.put("foto_side_url", fotoSideUrl);
        payload.put("video_url", videoUrl);

        try {
            return aiServiceRestClient.post()
                    .uri("/bodyscan/estimate")
                    .body(payload)
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientException ex) {
            throw new UpstreamServiceException(
                    "Il servizio ai-service non e' raggiungibile o ha restituito un errore durante la stima delle misure corporee.", ex);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> createTryOnRenderJob(String sessionId, String garmentId, String vista) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("session_id", sessionId);
        payload.put("garment_id", garmentId);
        payload.put("vista", vista);

        try {
            return aiServiceRestClient.post()
                    .uri("/tryon/render")
                    .body(payload)
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientException ex) {
            throw new UpstreamServiceException(
                    "Il servizio ai-service non e' raggiungibile o ha restituito un errore durante la creazione del job try-on.", ex);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> getTryOnRenderJob(String jobId) {
        try {
            return aiServiceRestClient.get()
                    .uri("/tryon/render/{jobId}", jobId)
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientException ex) {
            throw new UpstreamServiceException(
                    "Il servizio ai-service non e' raggiungibile o ha restituito un errore durante il polling del job try-on.", ex);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> adviseSize(Map<String, Object> bodyMeasures, Map<String, Object> sizeChart) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("body_measures", bodyMeasures);
        payload.put("size_chart", sizeChart);

        try {
            return aiServiceRestClient.post()
                    .uri("/size-advisor")
                    .body(payload)
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientException ex) {
            throw new UpstreamServiceException(
                    "Il servizio ai-service non e' raggiungibile o ha restituito un errore durante il calcolo del size advisor.", ex);
        }
    }
}
