package com.reflct.api.bodyscan;

import com.reflct.api.common.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/body-scan")
public class BodyScanController {

    private final BodyScanService bodyScanService;

    public BodyScanController(BodyScanService bodyScanService) {
        this.bodyScanService = bodyScanService;
    }

    @PostMapping
    public ResponseEntity<BodyScanResponse> startBodyScan(@Valid @RequestBody BodyScanRequest request) {
        BodyScanResponse response = bodyScanService.startBodyScan(CurrentUser.id(), request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<BodyScanResponse> getMyBodyScan() {
        return ResponseEntity.ok(bodyScanService.getMyLatestBodyScan(CurrentUser.id()));
    }
}
