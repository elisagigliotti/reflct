package com.reflct.api.garment;

import jakarta.validation.constraints.NotBlank;

public record GarmentImportRequest(
        @NotBlank String url
) {
}
