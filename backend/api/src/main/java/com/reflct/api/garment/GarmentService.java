package com.reflct.api.garment;

import com.reflct.api.client.ScrapingServiceClient;
import com.reflct.api.common.exception.ResourceNotFoundException;
import com.reflct.api.wardrobe.WardrobeItemRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URI;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class GarmentService {

    private final GarmentItemRepository garmentItemRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final WardrobeItemRepository wardrobeItemRepository;
    private final ScrapingServiceClient scrapingServiceClient;

    public GarmentService(GarmentItemRepository garmentItemRepository,
                           PriceHistoryRepository priceHistoryRepository,
                           WardrobeItemRepository wardrobeItemRepository,
                           ScrapingServiceClient scrapingServiceClient) {
        this.garmentItemRepository = garmentItemRepository;
        this.priceHistoryRepository = priceHistoryRepository;
        this.wardrobeItemRepository = wardrobeItemRepository;
        this.scrapingServiceClient = scrapingServiceClient;
    }

    /**
     * Feed/catalogo (nuovo, non nel contratto MVP originale ma necessario per collegare
     * la schermata Feed a dati reali invece che mock). Per ogni capo calcola il prezzo
     * storico piu' alto (per il badge price-drop, REALE via price_history) e se e' gia'
     * nel guardaroba dell'utente corrente (cuore pieno/vuoto in Feed).
     */
    @Transactional(readOnly = true)
    public Page<GarmentItemResponse> listGarments(UUID userId, Pageable pageable) {
        return garmentItemRepository.findAll(pageable).map(g -> {
            BigDecimal prezzoPrecedente = priceHistoryRepository.findByGarmentIdOrderByRilevatoAtDesc(g.getId())
                    .stream()
                    .map(PriceHistory::getPrezzo)
                    .filter(p -> g.getPrezzoAttuale() == null || p.compareTo(g.getPrezzoAttuale()) > 0)
                    .max(BigDecimal::compareTo)
                    .orElse(null);
            boolean preferito = wardrobeItemRepository.existsByUserIdAndGarmentId(userId, g.getId());
            return GarmentItemResponse.from(g, prezzoPrecedente, preferito);
        });
    }

    /**
     * Delega l'estrazione dei dati del capo a scraping-service e persiste il risultato.
     * Se scraping-service non risponde, UpstreamServiceException viene propagata al
     * GlobalExceptionHandler (mappata su 502) senza far crashare l'applicazione.
     */
    @Transactional
    public GarmentItemResponse importGarment(GarmentImportRequest request) {
        Map<String, Object> scraped = scrapingServiceClient.importGarment(request.url());

        GarmentItem garment = GarmentItem.builder()
                .urlOriginale(request.url())
                .nome(stringValue(scraped, "nome"))
                .brand(stringValue(scraped, "brand"))
                .categoria(stringValue(scraped, "categoria"))
                .prezzoAttuale(decimalValue(scraped, "prezzo_attuale"))
                .prezzoStoricoJson(stringValue(scraped, "prezzo_storico_json"))
                .fotoFrontUrl(stringValue(scraped, "foto_front_url"))
                .fotoBackUrl(stringValue(scraped, "foto_back_url"))
                .misureTaglieJson(stringValue(scraped, "misure_taglie_json"))
                .sourceDomain(extractDomain(request.url()))
                .build();

        garment = garmentItemRepository.save(garment);

        if (garment.getPrezzoAttuale() != null) {
            PriceHistory snapshot = PriceHistory.builder()
                    .garment(garment)
                    .prezzo(garment.getPrezzoAttuale())
                    .build();
            priceHistoryRepository.save(snapshot);
        }

        return GarmentItemResponse.from(garment);
    }

    @Transactional(readOnly = true)
    public GarmentItemResponse getGarment(UUID id) {
        GarmentItem garment = garmentItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Capo non trovato: " + id));
        return GarmentItemResponse.from(garment);
    }

    /** Storico prezzo di un capo, ordine cronologico crescente (per la sparkline). */
    @Transactional(readOnly = true)
    public List<PriceHistoryPointResponse> getPriceHistory(UUID garmentId) {
        return priceHistoryRepository.findByGarmentIdOrderByRilevatoAtDesc(garmentId).stream()
                .sorted(Comparator.comparing(PriceHistory::getRilevatoAt))
                .map(PriceHistoryPointResponse::from)
                .toList();
    }

    private static String stringValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }

    private static BigDecimal decimalValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) {
            return null;
        }
        try {
            return new BigDecimal(value.toString());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private static String extractDomain(String url) {
        try {
            String host = URI.create(url).getHost();
            return host != null ? host.replaceFirst("^www\\.", "") : null;
        } catch (Exception ex) {
            return null;
        }
    }
}
