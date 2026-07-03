package com.reflct.api.garment;

import com.reflct.api.common.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/garments")
public class GarmentController {

    private final GarmentService garmentService;

    public GarmentController(GarmentService garmentService) {
        this.garmentService = garmentService;
    }

    /** Feed/catalogo capi (nuovo, non nel contratto MVP originale — vedi GarmentService.listGarments). */
    @GetMapping
    public ResponseEntity<Page<GarmentItemResponse>> listGarments(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(garmentService.listGarments(CurrentUser.id(), pageable));
    }

    @PostMapping("/import")
    public ResponseEntity<GarmentItemResponse> importGarment(@Valid @RequestBody GarmentImportRequest request) {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(garmentService.importGarment(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GarmentItemResponse> getGarment(@PathVariable UUID id) {
        return ResponseEntity.ok(garmentService.getGarment(id));
    }

    /** Storico prezzo (nuovo — alimenta la sparkline reale di pricewatch.sys). */
    @GetMapping("/{id}/price-history")
    public ResponseEntity<java.util.List<PriceHistoryPointResponse>> getPriceHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(garmentService.getPriceHistory(id));
    }
}
