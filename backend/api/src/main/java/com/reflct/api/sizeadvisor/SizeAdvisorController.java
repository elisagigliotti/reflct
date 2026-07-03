package com.reflct.api.sizeadvisor;

import com.reflct.api.common.security.CurrentUser;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/size-advisor")
public class SizeAdvisorController {

    private final SizeAdvisorService sizeAdvisorService;

    public SizeAdvisorController(SizeAdvisorService sizeAdvisorService) {
        this.sizeAdvisorService = sizeAdvisorService;
    }

    @GetMapping("/{garmentId}")
    public ResponseEntity<SizeAdvisorResponse> adviseSize(@PathVariable UUID garmentId) {
        return ResponseEntity.ok(sizeAdvisorService.adviseSize(CurrentUser.id(), garmentId));
    }
}
