package com.reflct.api.outfit;

import com.reflct.api.common.exception.ResourceNotFoundException;
import com.reflct.api.user.User;
import com.reflct.api.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Servizio minimale per l'Outfit Builder (Concept v4.0 sez. 5.4). Non ha un
 * controller REST proprio (non nel contratto MVP, vedi Outfit.java), ma resta
 * pronto per essere richiamato da un futuro OutfitController o da altri moduli.
 */
@Service
public class OutfitService {

    private final OutfitRepository outfitRepository;
    private final UserRepository userRepository;

    public OutfitService(OutfitRepository outfitRepository, UserRepository userRepository) {
        this.outfitRepository = outfitRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Outfit create(UUID userId, String nome, List<UUID> itemIds, String fotoCoverUrl, boolean isPublic) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato: " + userId));

        Outfit outfit = Outfit.builder()
                .user(user)
                .nome(nome)
                .itemIds(itemIds)
                .fotoCoverUrl(fotoCoverUrl)
                .isPublic(isPublic)
                .build();

        return outfitRepository.save(outfit);
    }

    @Transactional(readOnly = true)
    public List<Outfit> listByUser(UUID userId) {
        return outfitRepository.findByUserId(userId);
    }
}
