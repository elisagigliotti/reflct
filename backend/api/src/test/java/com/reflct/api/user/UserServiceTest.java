package com.reflct.api.user;

import com.reflct.api.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository);
    }

    @Test
    void getMe_restituisceUtente_quandoEsiste() {
        UUID id = UUID.randomUUID();
        User user = User.builder().id(id).email("giulia@example.com").nome("Giulia").unitaMisura("cm").piano(Piano.FREE).build();
        when(userRepository.findById(id)).thenReturn(Optional.of(user));

        UserResponse response = userService.getMe(id);

        assertThat(response.email()).isEqualTo("giulia@example.com");
        assertThat(response.unitaMisura()).isEqualTo("cm");
    }

    @Test
    void getMe_lanciaResourceNotFound_quandoNonEsiste() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getMe(id)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateMe_aggiornaSoloICampiValorizzati() {
        UUID id = UUID.randomUUID();
        User user = User.builder().id(id).email("giulia@example.com").nome("Giulia").altezzaCm(168).unitaMisura("cm").piano(Piano.FREE).build();
        when(userRepository.findById(id)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        UpdateUserRequest request = new UpdateUserRequest(null, null, null, null, 170, "in");
        UserResponse response = userService.updateMe(id, request);

        assertThat(response.nome()).isEqualTo("Giulia"); // invariato
        assertThat(response.altezzaCm()).isEqualTo(170);
        assertThat(response.unitaMisura()).isEqualTo("in");
    }
}
