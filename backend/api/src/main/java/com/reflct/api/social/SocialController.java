package com.reflct.api.social;

import com.reflct.api.common.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/social")
public class SocialController {

    private final SocialPostService socialPostService;

    public SocialController(SocialPostService socialPostService) {
        this.socialPostService = socialPostService;
    }

    @PostMapping("/post")
    public ResponseEntity<SocialPostResponse> post(@Valid @RequestBody CreateSocialPostRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(socialPostService.createPost(CurrentUser.id(), request));
    }

    @PostMapping("/vote")
    public ResponseEntity<SocialPostResponse> vote(@Valid @RequestBody VoteRequest request) {
        return ResponseEntity.ok(socialPostService.vote(request));
    }

    /** Elenco post attivi per tab (nuovo, serve al frontend per popolare Rate/Battle con dati reali). */
    @GetMapping("/posts")
    public ResponseEntity<List<SocialPostResponse>> list(@RequestParam TipoSocialPost tipo) {
        return ResponseEntity.ok(socialPostService.listByTipo(tipo));
    }
}
