package com.reflct.api.garment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PriceHistoryRepository extends JpaRepository<PriceHistory, UUID> {

    List<PriceHistory> findByGarmentIdOrderByRilevatoAtDesc(UUID garmentId);
}
