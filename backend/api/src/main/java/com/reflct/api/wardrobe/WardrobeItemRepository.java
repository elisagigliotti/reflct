package com.reflct.api.wardrobe;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WardrobeItemRepository extends JpaRepository<WardrobeItem, UUID> {

    Page<WardrobeItem> findByUserId(UUID userId, Pageable pageable);

    Page<WardrobeItem> findByUserIdAndCategoria(UUID userId, String categoria, Pageable pageable);

    Optional<WardrobeItem> findByUserIdAndGarmentId(UUID userId, UUID garmentId);

    boolean existsByUserIdAndGarmentId(UUID userId, UUID garmentId);
}
