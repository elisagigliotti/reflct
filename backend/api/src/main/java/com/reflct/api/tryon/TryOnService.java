package com.reflct.api.tryon;

import com.reflct.api.client.AiServiceClient;
import com.reflct.api.common.exception.ResourceNotFoundException;
import com.reflct.api.common.exception.UpstreamServiceException;
import com.reflct.api.garment.GarmentItem;
import com.reflct.api.garment.GarmentItemRepository;
import com.reflct.api.user.User;
import com.reflct.api.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class TryOnService {

    private static final Logger log = LoggerFactory.getLogger(TryOnService.class);

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
     * Avvia una sessione try-on: crea il job di rendering fotorealistico su
     * ai-service (POST /tryon/render, CatVTON) usando la foto dell'utente
     * (request.fotoUrl(), tipicamente lo scatto fatto con la fotocamera o
     * l'ultimo body-scan) e la foto del capo. Il rendering e' sincrono lato
     * ai-service (vedi ai-service/app/routers/tryon.py), quindi al ritorno di
     * questa chiamata il job e' gia' "done" o "failed".
     *
     * Se il rendering fallisce (AI non raggiungibile, foto non valida, ecc.)
     * la sessione viene comunque creata con status FAILED invece di far
     * fallire l'intera richiesta: Share/Social hanno bisogno solo che la
     * sessione esista per generare un link, indipendentemente dal fatto che
     * il render fotorealistico sia riuscito.
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

        String garmentImageUrl = "RETRO".equalsIgnoreCase(session.getVista()) && garment.getFotoBackUrl() != null
                ? garment.getFotoBackUrl()
                : garment.getFotoFrontUrl();

        try {
            Map<String, Object> job = aiServiceClient.createTryOnRenderJob(
                    session.getId().toString(), garment.getId().toString(), toAiVista(session.getVista()),
                    request.fotoUrl(), garmentImageUrl, garment.getCategoria());

            Object jobId = job.get("job_id");
            Map<String, Object> result = jobId != null
                    ? aiServiceClient.getTryOnRenderJob(jobId.toString())
                    : job;

            Object outputUrl = result.get("output_url");
            Object status = result.get("status");
            session.setVideoUrl(outputUrl != null ? outputUrl.toString() : null);
            session.setStatus("done".equals(status) ? "COMPLETED" : "FAILED");
            tryOnSessionRepository.save(session);
            publishStatus(session);

            return TryOnSessionResponse.from(session);
        } catch (UpstreamServiceException ex) {
            log.warn("Rendering try-on fallito per sessione {}: {}", session.getId(), ex.getMessage());
            session.setStatus("FAILED");
            tryOnSessionRepository.save(session);
            publishStatus(session);
            return TryOnSessionResponse.from(session);
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
