package com.reflct.api.share;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SharedLinkRepository extends JpaRepository<SharedLink, UUID> {

    Optional<SharedLink> findByToken(String token);
}
