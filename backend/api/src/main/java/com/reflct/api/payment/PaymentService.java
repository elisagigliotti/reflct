package com.reflct.api.payment;

import com.reflct.api.common.exception.ResourceNotFoundException;
import com.reflct.api.user.Piano;
import com.reflct.api.user.User;
import com.reflct.api.user.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Piani e (mock) checkout Stripe — Concept Document v4.0, sezione 6 (Modello di
 * Business). Nessuna vera integrazione Stripe qui: subscribe() ritorna un URL di
 * checkout finto. In produzione il piano dell'utente si aggiorna SOLO tramite
 * webhook Stripe dopo pagamento confermato, non a questa chiamata (che serve solo
 * ad avviare il checkout) — per questo lo scaffold non modifica user.piano.
 */
@Service
public class PaymentService {

    private static final List<PlanResponse> PLANS = List.of(
            new PlanResponse(Piano.FREE, "Free", BigDecimal.ZERO, List.of(
                    "Try-on illimitato", "20 capi guardaroba", "Rate My Outfit / Battle",
                    "Condivisione con watermark")),
            new PlanResponse(Piano.PREMIUM, "Premium", new BigDecimal("7.99"), List.of(
                    "Guardaroba illimitato", "AI Stylist", "Price tracker + alert",
                    "HD senza watermark", "Notifiche AI", "Beta access", "30 giorni gratis, nessuna carta")),
            new PlanResponse(Piano.PRO, "Pro", new BigDecimal("14.99"), List.of(
                    "Tutto Premium", "Analisi stile avanzata", "Priority AI rendering",
                    "Outfit builder avanzato", "Capsule illimitate", "API access early"))
    );

    private final UserRepository userRepository;

    public PaymentService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<PlanResponse> getPlans() {
        return PLANS;
    }

    public SubscribeResponse subscribe(UUID userId, SubscribeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato: " + userId));

        String checkoutUrl = "https://checkout.stripe.com/mock/" + UUID.randomUUID() + "?piano=" + request.piano()
                + "&user=" + user.getId();

        return new SubscribeResponse(checkoutUrl, request.piano());
    }
}
