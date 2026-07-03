package com.reflct.api.social;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reflct.api.common.exception.BadRequestException;
import com.reflct.api.common.exception.ResourceNotFoundException;
import com.reflct.api.tryon.TryOnSession;
import com.reflct.api.tryon.TryOnSessionRepository;
import com.reflct.api.user.User;
import com.reflct.api.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Rate My Outfit / Outfit Battle (Concept v4.0 sez. 5.5). I contatori voto sono
 * tenuti in JSON (voti_json) invece che in tabelle dedicate per restare aderenti
 * al modello dati del Concept Document, che descrive SocialPost con un unico
 * campo voti_json.
 */
@Service
public class SocialPostService {

    private static final Map<String, Integer> RATE_DEFAULTS = Map.of("fire", 0, "meh", 0, "skip", 0);
    private static final Map<String, Integer> BATTLE_DEFAULTS = Map.of("a", 0, "b", 0);

    private final SocialPostRepository socialPostRepository;
    private final UserRepository userRepository;
    private final TryOnSessionRepository tryOnSessionRepository;
    private final ObjectMapper objectMapper;

    public SocialPostService(SocialPostRepository socialPostRepository,
                              UserRepository userRepository,
                              TryOnSessionRepository tryOnSessionRepository,
                              ObjectMapper objectMapper) {
        this.socialPostRepository = socialPostRepository;
        this.userRepository = userRepository;
        this.tryOnSessionRepository = tryOnSessionRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public SocialPostResponse createPost(UUID userId, CreateSocialPostRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato: " + userId));
        TryOnSession session = tryOnSessionRepository.findById(request.sessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Sessione try-on non trovata: " + request.sessionId()));

        Map<String, Integer> defaults = request.tipo() == TipoSocialPost.BATTLE ? BATTLE_DEFAULTS : RATE_DEFAULTS;

        SocialPost post = SocialPost.builder()
                .user(user)
                .session(session)
                .tipo(request.tipo())
                .status("ACTIVE")
                .scadenza(request.tipo() == TipoSocialPost.BATTLE ? Instant.now().plus(24, ChronoUnit.HOURS) : null)
                .votiJson(writeJson(new LinkedHashMap<>(defaults)))
                .build();

        return SocialPostResponse.from(socialPostRepository.save(post));
    }

    @Transactional
    public SocialPostResponse vote(VoteRequest request) {
        SocialPost post = socialPostRepository.findById(request.postId())
                .orElseThrow(() -> new ResourceNotFoundException("Post social non trovato: " + request.postId()));

        if (post.getScadenza() != null && Instant.now().isAfter(post.getScadenza())) {
            throw new BadRequestException("Questo post e' scaduto, non e' piu' possibile votare");
        }

        Map<String, Integer> voti = readVoti(post.getVotiJson());
        if (!voti.containsKey(request.opzione())) {
            throw new BadRequestException("Opzione di voto non valida: " + request.opzione());
        }
        voti.merge(request.opzione(), 1, Integer::sum);
        post.setVotiJson(writeJson(voti));

        return SocialPostResponse.from(socialPostRepository.save(post));
    }

    @Transactional(readOnly = true)
    public java.util.List<SocialPostResponse> listByTipo(TipoSocialPost tipo) {
        return socialPostRepository.findByTipoOrderByCreatedAtDesc(tipo).stream()
                .map(SocialPostResponse::from)
                .toList();
    }

    private Map<String, Integer> readVoti(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<LinkedHashMap<String, Integer>>() {
            });
        } catch (JsonProcessingException ex) {
            throw new BadRequestException("Formato voti_json non valido per questo post");
        }
    }

    private String writeJson(Map<String, Integer> voti) {
        try {
            return objectMapper.writeValueAsString(voti);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Impossibile serializzare i voti", ex);
        }
    }
}
