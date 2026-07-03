package com.reflct.api.common.seed;

import com.reflct.api.garment.GarmentItem;
import com.reflct.api.garment.GarmentItemRepository;
import com.reflct.api.garment.PriceHistory;
import com.reflct.api.garment.PriceHistoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Seed di un piccolo catalogo capi (stessi 6 nomi/prezzi del prototipo di design
 * originale, per continuita' visiva) cosi' che Feed/Prova/Armadio abbiano dati
 * REALI su cui lavorare invece di mock lato frontend. Idempotente: gira ad ogni
 * avvio ma non fa nulla se garment_items non e' vuota. Usa le repository JPA
 * (non SQL raw) per funzionare identico sia su H2 (profilo dev) sia su Postgres
 * (default), evitando differenze di dialetto SQL tra i due.
 */
@Component
public class GarmentCatalogSeeder implements CommandLineRunner {

    private final GarmentItemRepository garmentItemRepository;
    private final PriceHistoryRepository priceHistoryRepository;

    public GarmentCatalogSeeder(GarmentItemRepository garmentItemRepository,
                                 PriceHistoryRepository priceHistoryRepository) {
        this.garmentItemRepository = garmentItemRepository;
        this.priceHistoryRepository = priceHistoryRepository;
    }

    @Override
    public void run(String... args) {
        if (garmentItemRepository.count() > 0) {
            return;
        }

        GarmentItem denim = save("https://example-shop.test/denim-01", "Giacca denim oversize", "ATELIER_9", "giacche", new BigDecimal("79.00"), CHART_TOP);
        GarmentItem dress = save("https://example-shop.test/dress-02", "Slip dress raso", "MOTH&CO", "vestiti", new BigDecimal("54.00"), CHART_DRESS);
        GarmentItem cargo = save("https://example-shop.test/cargo-03", "Cargo pants Y2K", "RIP//STOP", "pantaloni", new BigDecimal("65.00"), CHART_BOTTOM);
        save("https://example-shop.test/tee-04", "Baby tee stampata", "CUTOUT", "top", new BigDecimal("28.00"), CHART_TOP);
        save("https://example-shop.test/knit-05", "Maxi cardigan mohair", "NONNA_CLB", "maglieria", new BigDecimal("92.00"), CHART_TOP);
        GarmentItem skirt = save("https://example-shop.test/skirt-06", "Gonna cargo midi", "RIP//STOP", "gonne", new BigDecimal("48.00"), CHART_BOTTOM);

        // Storico prezzi REALE (non un campo finto) per dimostrare il badge "price drop"
        // su 3 dei 6 capi, come nel prototipo di design.
        priceHistory(denim, new BigDecimal("110.00"), 30);
        priceHistory(cargo, new BigDecimal("89.00"), 20);
        priceHistory(skirt, new BigDecimal("60.00"), 15);
    }

    // Tabelle taglie realistiche (formato atteso da ai-service /size-advisor:
    // taglia -> {misura_cm: valore}), cosi' il size-advisor funziona da subito
    // sui capi seed invece di richiedere una valorizzazione manuale.
    private static final String CHART_TOP = "{"
            + "\"S\":{\"busto_cm\":88,\"vita_cm\":70,\"spalle_cm\":38,\"manica_cm\":58},"
            + "\"M\":{\"busto_cm\":96,\"vita_cm\":78,\"spalle_cm\":40,\"manica_cm\":60},"
            + "\"L\":{\"busto_cm\":104,\"vita_cm\":86,\"spalle_cm\":42,\"manica_cm\":62}"
            + "}";
    private static final String CHART_BOTTOM = "{"
            + "\"S\":{\"vita_cm\":68,\"fianchi_cm\":92,\"inseam_cm\":76},"
            + "\"M\":{\"vita_cm\":76,\"fianchi_cm\":100,\"inseam_cm\":78},"
            + "\"L\":{\"vita_cm\":84,\"fianchi_cm\":108,\"inseam_cm\":80}"
            + "}";
    private static final String CHART_DRESS = "{"
            + "\"S\":{\"busto_cm\":86,\"vita_cm\":68,\"fianchi_cm\":92},"
            + "\"M\":{\"busto_cm\":94,\"vita_cm\":76,\"fianchi_cm\":100},"
            + "\"L\":{\"busto_cm\":102,\"vita_cm\":84,\"fianchi_cm\":108}"
            + "}";

    private GarmentItem save(String url, String nome, String brand, String categoria, BigDecimal prezzo, String misureTaglieJson) {
        GarmentItem garment = GarmentItem.builder()
                .urlOriginale(url)
                .nome(nome)
                .brand(brand)
                .categoria(categoria)
                .prezzoAttuale(prezzo)
                .sourceDomain("example-shop.test")
                .misureTaglieJson(misureTaglieJson)
                .build();
        return garmentItemRepository.save(garment);
    }

    private void priceHistory(GarmentItem garment, BigDecimal prezzoStorico, int giorniFa) {
        PriceHistory snapshot = PriceHistory.builder()
                .garment(garment)
                .prezzo(prezzoStorico)
                .rilevatoAt(Instant.now().minus(giorniFa, ChronoUnit.DAYS))
                .build();
        priceHistoryRepository.save(snapshot);
    }
}
