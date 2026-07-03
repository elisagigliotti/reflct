package com.reflct.api.wardrobe;

import com.reflct.api.common.exception.ResourceNotFoundException;
import com.reflct.api.garment.GarmentItem;
import com.reflct.api.garment.GarmentItemRepository;
import com.reflct.api.user.User;
import com.reflct.api.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class WardrobeService {

    private final WardrobeItemRepository wardrobeItemRepository;
    private final UserRepository userRepository;
    private final GarmentItemRepository garmentItemRepository;

    public WardrobeService(WardrobeItemRepository wardrobeItemRepository,
                            UserRepository userRepository,
                            GarmentItemRepository garmentItemRepository) {
        this.wardrobeItemRepository = wardrobeItemRepository;
        this.userRepository = userRepository;
        this.garmentItemRepository = garmentItemRepository;
    }

    @Transactional(readOnly = true)
    public Page<WardrobeItemResponse> getGallery(UUID userId, String categoria, Pageable pageable) {
        Page<WardrobeItem> page = (categoria != null && !categoria.isBlank())
                ? wardrobeItemRepository.findByUserIdAndCategoria(userId, categoria, pageable)
                : wardrobeItemRepository.findByUserId(userId, pageable);
        return page.map(WardrobeItemResponse::from);
    }

    @Transactional
    public WardrobeItemResponse updateCategoria(UUID userId, UUID itemId, String nuovaCategoria) {
        WardrobeItem item = wardrobeItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item guardaroba non trovato: " + itemId));

        if (!item.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Non autorizzato a modificare questo item di guardaroba");
        }

        item.setCategoriaCustom(nuovaCategoria);
        item.setCategoria(nuovaCategoria);
        wardrobeItemRepository.save(item);
        return WardrobeItemResponse.from(item);
    }

    /**
     * Aggiunge/rimuove un capo dal guardaroba dell'utente corrente — e' l'azione
     * "cuore" della Feed (like = salva in guardaroba, coerente con l'handoff di
     * design dove "SALVATI" in Armadio conta esattamente i capi con like attivo).
     * `garmentId` (il capo), non l'id del WardrobeItem stesso.
     */
    @Transactional
    public ToggleFavoriteResponse toggleFavorite(UUID userId, UUID garmentId) {
        var existing = wardrobeItemRepository.findByUserIdAndGarmentId(userId, garmentId);
        if (existing.isPresent()) {
            wardrobeItemRepository.delete(existing.get());
            return new ToggleFavoriteResponse(false);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato: " + userId));
        GarmentItem garment = garmentItemRepository.findById(garmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Capo non trovato: " + garmentId));

        WardrobeItem item = WardrobeItem.builder()
                .user(user)
                .garment(garment)
                .favorite(true)
                .build();
        wardrobeItemRepository.save(item);
        return new ToggleFavoriteResponse(true);
    }
}
