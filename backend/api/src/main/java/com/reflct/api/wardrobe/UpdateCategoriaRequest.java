package com.reflct.api.wardrobe;

import jakarta.validation.constraints.NotBlank;

public record UpdateCategoriaRequest(
        @NotBlank String categoria
) {
}
