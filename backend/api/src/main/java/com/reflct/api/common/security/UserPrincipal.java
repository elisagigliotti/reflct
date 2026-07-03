package com.reflct.api.common.security;

import com.reflct.api.user.Piano;
import com.reflct.api.user.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Adapter Spring Security sopra l'entita' User. Il "ruolo" e' derivato dal piano
 * di abbonamento (ROLE_FREE / ROLE_PREMIUM / ROLE_PRO), utile per eventuali
 * @PreAuthorize su feature premium in futuro.
 */
public class UserPrincipal implements UserDetails {

    private final UUID userId;
    private final String email;
    private final String passwordHash;
    private final Piano piano;

    public UserPrincipal(UUID userId, String email, String passwordHash, Piano piano) {
        this.userId = userId;
        this.email = email;
        this.passwordHash = passwordHash;
        this.piano = piano;
    }

    public static UserPrincipal fromUser(User user) {
        return new UserPrincipal(user.getId(), user.getEmail(), user.getPasswordHash(), user.getPiano());
    }

    public UUID getUserId() {
        return userId;
    }

    public Piano getPiano() {
        return piano;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + piano.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
