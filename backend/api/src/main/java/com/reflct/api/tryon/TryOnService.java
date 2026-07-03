package com.reflct.api.tryon;

import com.reflct.api.client.AiServiceClient;
import com.reflct.api.common.exception.ResourceNotFoundException;
import com.reflct.api.common.exception.UpstreamServiceException;
import com.reflct.api.garment.GarmentItem;
import com.reflct.api.garment.GarmentItemRepository;
import com.reflct.api.user.User;
import com.reflct.api.user.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class TryOnService {

    private final TryOnSessionRepository tryOnSessionRepository;
    private final UserRepository userRepository;
    private final GarmentItemRepository garmentItemRepository;
    private final AiServiceClient aiServiceClient;
    private final SimpMessagingTemplate messagingTemplate;

    public TryOnService(TryOnSessionRepository tryOnSessionRepository,
                         UserRepository userRepository,
                         GarmentItemRepository garmentItemRepository,
                         AiServiceClient aiServiceClient,
                         SimpMessagingTemplate messagingTemplate) {
        this.tryOnSessionRepository = tryOnSessionRepository;
        this.userRepository = userRepository;
        this.garmentItemRepository = garmentItemRepository;
        this.aiServiceClient = aiServiceClient;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Avvia una sessione try-on: crea il job di rendering su ai-service (POST
     * /tryon/render) e ne fa subito il polling (GET /tryon/render/{jobId}) — nello
     * scaffold attuale ai-service segna il job "done" immediatamente, in produzione
     * questo secondo passo sarebbe asincrono (coda GPU, notifica via WebSocket).
     *
     * La taglia consigliata / fit score NON vengono da questa chiamata (ai-service
     * tratta rendering visivo e size-advisor come due concern separati, vedi
     * Concept v4.0 sez. 5.1 vs 5.3): restano null qui e si ottengono da
     * GET /api/v1/size-advisor/{garmentId}.
     */
    @Transactional
    public TryOnSessionResponse startSession(UUID userId, TryOnStartRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato: " + userId));
        GarmentItem garment = garmentItemRepository.findById(request.garmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Capo non trovato: " + request.garmentId()));

        TryOnSession session = TryOnSession.builder()
                .user(user)
                .garment(garment)
                .fotoUrl(request.fotoUrl())
                .vista(request.vista() != null ? request.vista() : "FRONTE")
                .status("PROCESSING")
                .build();
        session = tryOnSessionRepository.save(session);

        publishStatus(session);

        try {
            Map<String, Object> job = aiServiceClient.createTryOnRenderJob(
                    session.getId().toString(), garment.getId().toString(), toAiVista(session.getVista()));

            Object jobId = job.get("job_id");
            Map<String, Object> result = jobId != null
                    ? aiServiceClient.getTryOnRenderJob(jobId.toString())
                    : job;

            Object outputUrl = result.get("output_url");
            session.setVideoUrl(outputUrl != null ? outputUrl.toString() : null);
            session.setStatus("COMPLETED");
            tryOnSessionRepository.save(session);
            publishStatus(session);

            return TryOnSessionResponse.from(session);
        } catch (UpstreamServiceException ex) {
            session.setStatus("FAILED");
            tryOnSessionRepository.save(session);
            publishStatus(session);
            throw ex;
        }
    }

    @Transactional(readOnly = true)
    public TryOnSessionResponse getSession(UUID sessionId) {
        TryOnSession session = tryOnSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Sessione try-on non trovata: " + sessionId));
        return TryOnSessionResponse.from(session);
    }

    /** L'entita' usa "FRONTE"/"RETRO" (italiano, coerente col resto del modello dati);
     *  ai-service si aspetta il letterale "front"/"back" (vedi Vista in models.py). */
    private static String toAiVista(String vista) {
        return "RETRO".equalsIgnoreCase(vista) ? "back" : "front";
    }

    private void publishStatus(TryOnSession session) {
        TryOnStatusUpdate update = new TryOnStatusUpdate(session.getId(), session.getStatus(), session.getTagliaConsigliata());
        messagingTemplate.convertAndSend("/topic/tryon/" + session.getId(), update);
    }
}
