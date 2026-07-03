package com.reflct.api.bodyscan;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reflct.api.client.AiServiceClient;
import com.reflct.api.common.exception.ResourceNotFoundException;
import com.reflct.api.common.exception.UpstreamServiceException;
import com.reflct.api.user.User;
import com.reflct.api.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class BodyScanService {

    private final BodyScanRepository bodyScanRepository;
    private final UserRepository userRepository;
    private final AiServiceClient aiServiceClient;
    private final ObjectMapper objectMapper;

    public BodyScanService(BodyScanRepository bodyScanRepository, UserRepository userRepository,
                            AiServiceClient aiServiceClient, ObjectMapper objectMapper) {
        this.bodyScanRepository = bodyScanRepository;
        this.userRepository = userRepository;
        this.aiServiceClient = aiServiceClient;
        this.objectMapper = objectMapper;
    }

    /**
     * Avvia (in modo sincrono in questo scaffold, "async" a livello di prodotto) la stima
     * delle misure corporee delegando ad ai-service. Se ai-service non risponde, il body
     * scan viene comunque persistito con status FAILED cosi' da non perdere l'upload
     * dell'utente, e viene propagato un errore 502 pulito al chiamante.
     */
    @Transactional
    public BodyScanResponse startBodyScan(UUID userId, BodyScanRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato: " + userId));

        BodyScan scan = BodyScan.builder()
                .user(user)
                .fotoFrontUrl(request.fotoFrontUrl())
                .fotoSideUrl(request.fotoSideUrl())
                .videoUrl(request.videoUrl())
                .status("PROCESSING")
                .build();
        scan = bodyScanRepository.save(scan);

        try {
            Double altezza = request.altezzaCm() != null ? request.altezzaCm().doubleValue() : null;
            Map<String, Object> result = aiServiceClient.estimateBodyMeasurements(
                    userId.toString(), request.fotoFrontUrl(), request.fotoSideUrl(), request.videoUrl(), altezza);

            // ai-service risponde con le 7 misure + confidence come campi separati
            // (non un unico "misure_json" gia' pronto): li serializziamo qui per
            // popolare la colonna TEXT misure_json, che resta la cache canonica.
            String misureJson = serializeMisure(result);
            scan.setMisureJson(misureJson);
            scan.setStatus("COMPLETED");
            bodyScanRepository.save(scan);

            if (misureJson != null) {
                user.setMisureJson(misureJson);
            }
            if (request.altezzaCm() != null) {
                user.setAltezzaCm(request.altezzaCm());
            }
            userRepository.save(user);

            return BodyScanResponse.from(scan);
        } catch (UpstreamServiceException ex) {
            scan.setStatus("FAILED");
            bodyScanRepository.save(scan);
            throw ex;
        }
    }

    @Transactional(readOnly = true)
    public BodyScanResponse getMyLatestBodyScan(UUID userId) {
        BodyScan scan = bodyScanRepository.findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Nessun body scan trovato per l'utente corrente"));
        return BodyScanResponse.from(scan);
    }

    private String serializeMisure(Map<String, Object> result) {
        try {
            return objectMapper.writeValueAsString(result);
        } catch (JsonProcessingException ex) {
            return null;
        }
    }
}
