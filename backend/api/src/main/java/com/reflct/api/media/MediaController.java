package com.reflct.api.media;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Upload di foto scattate dall'utente (fotocamera body-scan, capo per il try-on).
 * Richiede autenticazione (nessuna eccezione in SecurityConfig per questo path);
 * l'URL restituito e' invece pubblico cosi' che ai-service possa scaricarlo.
 */
@RestController
@RequestMapping("/api/v1/media")
public class MediaController {

    private final MediaStorageService storageService;

    public MediaController(MediaStorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MediaUploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = storageService.store(file);
        return ResponseEntity.status(HttpStatus.CREATED).body(new MediaUploadResponse(url));
    }
}
