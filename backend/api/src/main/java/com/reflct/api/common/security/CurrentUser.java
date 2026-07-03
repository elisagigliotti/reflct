package com.reflct.api.common.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

/**
 * Helper statico per leggere l'utente autenticato corrente dal SecurityContext
 * senza dover iniettare Authentication in ogni singolo metodo di controller.
 */
public final class CurrentUser {

    private CurrentUser() {
    }

    public static UserPrincipal get() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new IllegalStateException("Nessun utente autenticato nel contesto di sicurezza corrente");
        }
        return principal;
    }

    public static UUID id() {
        return get().getUserId();
    }
}
