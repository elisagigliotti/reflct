package com.reflct.api.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Scaffold STOMP over WebSocket per notificare aggiornamenti di stato delle
 * sessioni try-on in tempo reale (Concept Document v4.0, sezione 4.2: "WebSocket (STOMP)").
 *
 * Endpoint di connessione: /ws
 * Topic broadcast per sessione:  /topic/tryon/{sessionId}
 *
 * Nota: questo e' solo lo scaffold del transport layer. La pubblicazione effettiva
 * di messaggi sul topic (es. da TryOnService quando arriva la risposta di ai-service)
 * va fatta iniettando un SimpMessagingTemplate nei service interessati.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
