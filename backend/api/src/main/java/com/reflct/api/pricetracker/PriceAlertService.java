package com.reflct.api.pricetracker;

import com.reflct.api.common.exception.ResourceNotFoundException;
import com.reflct.api.garment.GarmentItem;
import com.reflct.api.garment.GarmentItemRepository;
import com.reflct.api.user.User;
import com.reflct.api.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/** Price Alert (Concept v4.0 sez. 5.4): soglia personalizzabile, notifica al ribasso. */
@Service
public class PriceAlertService {

    private final PriceAlertRepository priceAlertRepository;
    private final UserRepository userRepository;
    private final GarmentItemRepository garmentItemRepository;

    public PriceAlertService(PriceAlertRepository priceAlertRepository,
                              UserRepository userRepository,
                              GarmentItemRepository garmentItemRepository) {
        this.priceAlertRepository = priceAlertRepository;
        this.userRepository = userRepository;
        this.garmentItemRepository = garmentItemRepository;
    }

    @Transactional
    public PriceAlertResponse create(UUID userId, CreatePriceAlertRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato: " + userId));
        GarmentItem garment = garmentItemRepository.findById(request.garmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Capo non trovato: " + request.garmentId()));

        PriceAlert alert = PriceAlert.builder()
                .user(user)
                .garment(garment)
                .soglia(request.soglia())
                .active(true)
                .build();

        return PriceAlertResponse.from(priceAlertRepository.save(alert));
    }

    @Transactional(readOnly = true)
    public List<PriceAlertResponse> listMine(UUID userId) {
        return priceAlertRepository.findByUserId(userId).stream()
                .map(PriceAlertResponse::from)
                .toList();
    }
}
