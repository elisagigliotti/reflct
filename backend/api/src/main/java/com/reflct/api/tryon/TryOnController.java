package com.reflct.api.tryon;

import com.reflct.api.common.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Stato/risultato della sessione disponibile sia via polling (GET /{sessionId})
 * sia via WebSocket STOMP sul topic /topic/tryon/{sessionId} (vedi WebSocketConfig
 * e TryOnService.publishStatus).
 */
@RestController
@RequestMapping("/api/v1/tryon")
public class TryOnController {

    private final TryOnService tryOnService;

    public TryOnController(TryOnService tryOnService) {
        this.tryOnService = tryOnService;
    }

    @PostMapping("/start")
    public ResponseEntity<TryOnSessionResponse> start(@Valid @RequestBody TryOnStartRequest request) {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(tryOnService.startSession(CurrentUser.id(), request));
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<TryOnSessionResponse> getSession(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(tryOnService.getSession(sessionId));
    }
}
