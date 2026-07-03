package com.reflct.api.sizeadvisor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reflct.api.client.AiServiceClient;
import com.reflct.api.common.exception.BadRequestException;
import com.reflct.api.common.exception.ResourceNotFoundException;
import com.reflct.api.garment.GarmentItem;
import com.reflct.api.garment.GarmentItemRepository;
import com.reflct.api.user.User;
import com.reflct.api.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SizeAdvisorServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private GarmentItemRepository garmentItemRepository;

    @Mock
    private AiServiceClient aiServiceClient;

    private SizeAdvisorService sizeAdvisorService;

    @BeforeEach
    void setUp() {
        sizeAdvisorService = new SizeAdvisorService(userRepository, garmentItemRepository, aiServiceClient, new ObjectMapper());
    }

    @Test
    void adviseSize_restituisceRisposta_quandoMisureEDettaglioDisponibili() {
        UUID userId = UUID.randomUUID();
        UUID garmentId = UUID.randomUUID();

        User user = User.builder().id(userId).misureJson("{\"busto_cm\":95.0,\"vita_cm\":78.0}").build();
        GarmentItem garment = GarmentItem.builder()
                .id(garmentId)
                .misureTaglieJson("{\"M\":{\"busto_cm\":96,\"vita_cm\":80}}")
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(garmentItemRepository.findById(garmentId)).thenReturn(Optional.of(garment));
        when(aiServiceClient.adviseSize(anyMap(), anyMap())).thenReturn(Map.of(
                "consigliata", "M",
                "fit_score", 92.5,
                "dettaglio", Map.of("busto_cm", "PERFETTO", "vita_cm", "PERFETTO")
        ));

        SizeAdvisorResponse response = sizeAdvisorService.adviseSize(userId, garmentId);

        assertThat(response.consigliata()).isEqualTo("M");
        assertThat(response.fitScore()).isEqualTo(92.5);
        assertThat(response.dettaglio()).containsEntry("busto_cm", "PERFETTO");
    }

    @Test
    void adviseSize_lanciaBadRequest_quandoUtenteNonHaMisure() {
        UUID userId = UUID.randomUUID();
        UUID garmentId = UUID.randomUUID();

        User user = User.builder().id(userId).misureJson(null).build();
        GarmentItem garment = GarmentItem.builder().id(garmentId).misureTaglieJson("{\"M\":{}}").build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(garmentItemRepository.findById(garmentId)).thenReturn(Optional.of(garment));

        assertThatThrownBy(() -> sizeAdvisorService.adviseSize(userId, garmentId))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("body-scan");
    }

    @Test
    void adviseSize_lanciaResourceNotFound_quandoCapoNonEsiste() {
        UUID userId = UUID.randomUUID();
        UUID garmentId = UUID.randomUUID();

        User user = User.builder().id(userId).misureJson("{\"busto_cm\":95.0}").build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(garmentItemRepository.findById(garmentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sizeAdvisorService.adviseSize(userId, garmentId))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
