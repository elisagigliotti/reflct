package com.reflct.api.sizeadvisor;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reflct.api.client.AiServiceClient;
import com.reflct.api.common.exception.BadRequestException;
import com.reflct.api.common.exception.ResourceNotFoundException;
import com.reflct.api.garment.GarmentItem;
import com.reflct.api.garment.GarmentItemRepository;
import com.reflct.api.user.User;
import com.reflct.api.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * Orchestratore del size advisor (Concept v4.0 sez. 5.3): recupera le misure
 * corporee dell'utente (cache su User.misureJson, popolata dal body-scan) e la
 * tabella taglie del capo (GarmentItem.misureTaglieJson), poi delega il calcolo
 * vero e proprio ad ai-service (POST /size-advisor — logica reale di confronto
 * pesato, non mock). Nessuna logica di matching e' duplicata qui.
 */
@Service
public class SizeAdvisorService {

    private final UserRepository userRepository;
    private final GarmentItemRepository garmentItemRepository;
    private final AiServiceClient aiServiceClient;
    private final ObjectMapper objectMapper;

    public SizeAdvisorService(UserRepository userRepository,
                               GarmentItemRepository garmentItemRepository,
                               AiServiceClient aiServiceClient,
                               ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.garmentItemRepository = garmentItemRepository;
        this.aiServiceClient = aiServiceClient;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public SizeAdvisorResponse adviseSize(UUID userId, UUID garmentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato: " + userId));
        GarmentItem garment = garmentItemRepository.findById(garmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Capo non trovato: " + garmentId));

        if (user.getMisureJson() == null || user.getMisureJson().isBlank()) {
            throw new BadRequestException("Nessuna misura corporea disponibile: esegui prima un body-scan (POST /api/v1/body-scan)");
        }
        if (garment.getMisureTaglieJson() == null || garment.getMisureTaglieJson().isBlank()) {
            throw new BadRequestException("Il capo non ha una tabella taglie disponibile per il confronto");
        }

        Map<String, Object> bodyMeasures = readJsonAsMap(user.getMisureJson(), "le misure corporee dell'utente");
        Map<String, Object> sizeChart = readJsonAsMap(garment.getMisureTaglieJson(), "la tabella taglie del capo");

        Map<String, Object> result = aiServiceClient.adviseSize(bodyMeasures, sizeChart);

        Object consigliata = result.get("consigliata");
        Object fitScore = result.get("fit_score");
        Object dettaglio = result.get("dettaglio");

        return new SizeAdvisorResponse(
                consigliata != null ? consigliata.toString() : null,
                fitScore != null ? Double.parseDouble(fitScore.toString()) : 0.0,
                dettaglio instanceof Map ? (Map<String, String>) dettaglio : Map.of()
        );
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> readJsonAsMap(String json, String descrizione) {
        try {
            return objectMapper.readValue(json, Map.class);
        } catch (JsonProcessingException ex) {
            throw new BadRequestException("Formato JSON non valido per " + descrizione);
        }
    }
}
