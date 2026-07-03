package com.reflct.api.tryon;

import java.util.UUID;

/**
 * Payload pubblicato sul topic STOMP /topic/tryon/{sessionId} quando lo stato
 * della sessione cambia (scaffold: pubblicato in modo sincrono subito dopo la
 * risposta di ai-service, non c'e' un vero motore asincrono).
 */
public record TryOnStatusUpdate(UUID sessionId, String status, String tagliaConsigliata) {
}
