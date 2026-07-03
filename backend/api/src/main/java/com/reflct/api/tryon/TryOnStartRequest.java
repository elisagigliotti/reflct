package com.reflct.api.tryon;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record TryOnStartRequest(
        @NotNull UUID garmentId,
        @NotBlank String fotoUrl,
        String vista
) {
}
