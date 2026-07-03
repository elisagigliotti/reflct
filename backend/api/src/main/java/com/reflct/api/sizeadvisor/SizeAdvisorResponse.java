package com.reflct.api.sizeadvisor;

import java.util.Map;

public record SizeAdvisorResponse(
        String consigliata,
        double fitScore,
        Map<String, String> dettaglio
) {
}
