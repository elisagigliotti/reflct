package com.reflct.api.payment;

import com.reflct.api.user.Piano;
import jakarta.validation.constraints.NotNull;

public record SubscribeRequest(
        @NotNull Piano piano
) {
}
