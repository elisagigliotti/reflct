package com.reflct.api.payment;

import com.reflct.api.user.Piano;

public record SubscribeResponse(
        String checkoutUrl,
        Piano piano
) {
}
