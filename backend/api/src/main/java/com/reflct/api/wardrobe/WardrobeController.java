package com.reflct.api.wardrobe;

import com.reflct.api.common.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/gallery")
public class WardrobeController {

    private final WardrobeService wardrobeService;

    public WardrobeController(WardrobeService wardrobeService) {
        this.wardrobeService = wardrobeService;
    }

    @GetMapping
    public ResponseEntity<Page<WardrobeItemResponse>> getGallery(
            @RequestParam(required = false) String categoria,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(wardrobeService.getGallery(CurrentUser.id(), categoria, pageable));
    }

    /** {id} qui e' l'id del WardrobeItem (non del capo). */
    @PatchMapping("/{id}/categoria")
    public ResponseEntity<WardrobeItemResponse> updateCategoria(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCategoriaRequest request) {
        return ResponseEntity.ok(wardrobeService.updateCategoria(CurrentUser.id(), id, request.categoria()));
    }

    /** {garmentId} qui e' l'id del capo (non del WardrobeItem) — vedi WardrobeService.toggleFavorite. */
    @PostMapping("/{garmentId}/toggle-favorite")
    public ResponseEntity<ToggleFavoriteResponse> toggleFavorite(@PathVariable UUID garmentId) {
        return ResponseEntity.ok(wardrobeService.toggleFavorite(CurrentUser.id(), garmentId));
    }
}
