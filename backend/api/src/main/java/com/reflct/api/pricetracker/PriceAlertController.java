package com.reflct.api.pricetracker;

import com.reflct.api.common.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/price-alerts")
public class PriceAlertController {

    private final PriceAlertService priceAlertService;

    public PriceAlertController(PriceAlertService priceAlertService) {
        this.priceAlertService = priceAlertService;
    }

    @PostMapping
    public ResponseEntity<PriceAlertResponse> create(@Valid @RequestBody CreatePriceAlertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(priceAlertService.create(CurrentUser.id(), request));
    }

    /** Alert dell'utente corrente (nuovo, serve al frontend per precompilare le soglie gia' impostate). */
    @GetMapping
    public ResponseEntity<List<PriceAlertResponse>> listMine() {
        return ResponseEntity.ok(priceAlertService.listMine(CurrentUser.id()));
    }
}
