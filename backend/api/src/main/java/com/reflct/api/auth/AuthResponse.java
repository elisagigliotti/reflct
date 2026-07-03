package com.reflct.api.auth;

import java.util.UUID;

/**
 * Risposta di register/login. Il campo "onboardingToken" e' lo stesso JWT restituito
 * da /register: il client lo usa sia per l'onboarding guidato (body-scan incluso)
 * sia come token di sessione standard, come richiesto dal contratto MVP
 * ("Registrazione + onboarding token").
 */
public record AuthResponse(
        String token,
        UUID userId,
        String email,
        String nome,
        String piano
) {
}
