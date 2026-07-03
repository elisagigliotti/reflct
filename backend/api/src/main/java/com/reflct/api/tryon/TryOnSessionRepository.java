package com.reflct.api.tryon;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TryOnSessionRepository extends JpaRepository<TryOnSession, UUID> {
}
