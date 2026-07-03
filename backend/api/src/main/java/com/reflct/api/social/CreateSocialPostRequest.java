package com.reflct.api.social;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateSocialPostRequest(
        @NotNull UUID sessionId,
        @NotNull TipoSocialPost tipo
) {
}
