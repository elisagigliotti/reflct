package com.reflct.api.payment;

import com.reflct.api.user.Piano;

import java.math.BigDecimal;
import java.util.List;

/** Piano B2C — Concept Document v4.0, sezione 6.1 (Modello di Business). */
public record PlanResponse(
        Piano piano,
        String nome,
        BigDecimal prezzoEuroMese,
        List<String> features
) {
}
