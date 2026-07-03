package com.reflct.api.share;

import com.reflct.api.common.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/share")
public class ShareController {

    private final ShareService shareService;

    public ShareController(ShareService shareService) {
        this.shareService = shareService;
    }

    @PostMapping
    public ResponseEntity<SharedLinkResponse> create(@Valid @RequestBody CreateShareRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(shareService.createLink(CurrentUser.id(), request));
    }

    /** No-auth (vedi SecurityConfig: "/api/v1/share/*" e' permitAll). */
    @GetMapping("/{token}")
    public ResponseEntity<PublicShareResponse> getPublic(
            @PathVariable String token,
            @RequestParam(required = false) String pin) {
        return ResponseEntity.ok(shareService.getPublicByToken(token, pin));
    }
}
