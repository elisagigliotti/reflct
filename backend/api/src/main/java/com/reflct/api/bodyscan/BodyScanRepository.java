package com.reflct.api.bodyscan;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BodyScanRepository extends JpaRepository<BodyScan, UUID> {

    Optional<BodyScan> findTopByUserIdOrderByCreatedAtDesc(UUID userId);
}
