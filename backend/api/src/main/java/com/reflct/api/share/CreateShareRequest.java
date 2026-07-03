package com.reflct.api.share;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateShareRequest(
        @NotNull UUID sessionId,
        @NotNull TipoSharedLink tipo
) {
}
