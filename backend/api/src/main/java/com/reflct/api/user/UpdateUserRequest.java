package com.reflct.api.user;

import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/** PATCH parziale: i campi null non vengono modificati. */
public record UpdateUserRequest(
        @Size(max = 150) String nome,
        @Size(max = 150) String cognome,
        @Size(min = 3, max = 50) @Pattern(regexp = "^[a-zA-Z0-9._]+$", message = "username puo' contenere solo lettere, numeri, punto e underscore") String username,
        @Past LocalDate dataNascita,
        @Positive Integer altezzaCm,
        @Pattern(regexp = "cm|in", message = "unitaMisura deve essere 'cm' o 'in'") String unitaMisura
) {
}
