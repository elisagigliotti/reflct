package com.reflct.api.social;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SocialPostRepository extends JpaRepository<SocialPost, UUID> {

    List<SocialPost> findByTipoOrderByCreatedAtDesc(TipoSocialPost tipo);
}
