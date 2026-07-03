package com.reflct.api.garment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface GarmentItemRepository extends JpaRepository<GarmentItem, UUID> {
}
