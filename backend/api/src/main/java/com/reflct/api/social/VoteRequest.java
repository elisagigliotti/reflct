package com.reflct.api.social;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/** `opzione` e' la chiave del contatore da incrementare in voti_json (es. "fire"/"meh"/"skip" o "a"/"b"). */
public record VoteRequest(
        @NotNull UUID postId,
        @NotBlank String opzione
) {
}
