package com.reflct.api.wardrobe;

import com.reflct.api.garment.GarmentItem;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record WardrobeItemResponse(
        UUID id,
        UUID garmentId,
        String garmentNome,
        String garmentBrand,
        BigDecimal garmentPrezzoAttuale,
        String garmentFotoFrontUrl,
        UUID sessionId,
        String categoria,
        String categoriaCustom,
        UUID capsuleId,
        String note,
        boolean favorite,
        Instant createdAt
) {
    public static WardrobeItemResponse from(WardrobeItem item) {
        GarmentItem garment = item.getGarment();
        return new WardrobeItemResponse(
                item.getId(),
                garment.getId(),
                garment.getNome(),
                garment.getBrand(),
                garment.getPrezzoAttuale(),
                garment.getFotoFrontUrl(),
                item.getSession() != null ? item.getSession().getId() : null,
                item.getCategoria(),
                item.getCategoriaCustom(),
                item.getCapsuleId(),
                item.getNote(),
                item.isFavorite(),
                item.getCreatedAt()
        );
    }
}
