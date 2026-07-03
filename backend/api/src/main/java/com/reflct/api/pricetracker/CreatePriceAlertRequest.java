package com.reflct.api.pricetracker;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record CreatePriceAlertRequest(
        @NotNull UUID garmentId,
        @NotNull @Positive BigDecimal soglia
) {
}
