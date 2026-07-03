package com.reflct.api.share;

import com.reflct.api.common.exception.BadRequestException;
import com.reflct.api.common.exception.ResourceNotFoundException;
import com.reflct.api.tryon.TryOnSession;
import com.reflct.api.tryon.TryOnSessionRepository;
import com.reflct.api.user.User;
import com.reflct.api.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * Genera e risolve link di condivisione (Concept v4.0 sez. 5.6). Il GET pubblico
 * (getPublicByToken) e' l'unico endpoint no-auth di questo modulo (vedi
 * SecurityConfig: "/api/v1/share/*" e' in permitAll).
 */
@Service
public class ShareService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final SharedLinkRepository sharedLinkRepository;
    private final UserRepository userRepository;
    private final TryOnSessionRepository tryOnSessionRepository;
    private final PasswordEncoder passwordEncoder;

    public ShareService(SharedLinkRepository sharedLinkRepository,
                         UserRepository userRepository,
                         TryOnSessionRepository tryOnSessionRepository,
                         PasswordEncoder passwordEncoder) {
        this.sharedLinkRepository = sharedLinkRepository;
        this.userRepository = userRepository;
        this.tryOnSessionRepository = tryOnSessionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public SharedLinkResponse createLink(UUID userId, CreateShareRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato: " + userId));
        TryOnSession session = tryOnSessionRepository.findById(request.sessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Sessione try-on non trovata: " + request.sessionId()));

        String pinInChiaro = null;
        String passwordHash = null;
        if (request.tipo() == TipoSharedLink.PIN_PROTECTED) {
            pinInChiaro = generatePin();
            passwordHash = passwordEncoder.encode(pinInChiaro);
        }

        SharedLink link = SharedLink.builder()
                .user(user)
                .session(session)
                .token(generateToken())
                .tipo(request.tipo())
                .scadenza(computeScadenza(request.tipo()))
                .passwordHash(passwordHash)
                .viewCount(0L)
                .build();

        return SharedLinkResponse.from(sharedLinkRepository.save(link), pinInChiaro);
    }

    /** `pin` e' opzionale nella query string; richiesto solo se il link e' PIN_PROTECTED. */
    @Transactional
    public PublicShareResponse getPublicByToken(String token, String pin) {
        SharedLink link = sharedLinkRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Link di condivisione non trovato o rimosso"));

        if (link.getScadenza() != null && Instant.now().isAfter(link.getScadenza())) {
            throw new BadRequestException("Questo link e' scaduto");
        }

        if (link.getTipo() == TipoSharedLink.PIN_PROTECTED) {
            if (pin == null || pin.isBlank()) {
                throw new BadRequestException("Link protetto da PIN: specifica il parametro 'pin'");
            }
            if (!passwordEncoder.matches(pin, link.getPasswordHash())) {
                throw new BadRequestException("PIN non valido");
            }
        }

        link.setViewCount(link.getViewCount() + 1);
        sharedLinkRepository.save(link);

        TryOnSession session = link.getSession();
        var garment = session.getGarment();

        return new PublicShareResponse(
                garment.getNome(),
                garment.getBrand(),
                garment.getPrezzoAttuale(),
                garment.getUrlOriginale(),
                session.getFotoUrl(),
                session.getVideoUrl(),
                link.getViewCount()
        );
    }

    private static String generateToken() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }

    private static String generatePin() {
        int pin = RANDOM.nextInt(9000) + 1000;
        return String.valueOf(pin);
    }

    private static Instant computeScadenza(TipoSharedLink tipo) {
        Instant now = Instant.now();
        return switch (tipo) {
            case H24 -> now.plus(24, ChronoUnit.HOURS);
            case D7 -> now.plus(7, ChronoUnit.DAYS);
            case D30 -> now.plus(30, ChronoUnit.DAYS);
            case PERMANENT, PIN_PROTECTED -> null;
        };
    }
}
