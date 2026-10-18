package com.reflct.api.media;

import com.reflct.api.common.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Storage locale delle foto caricate dall'utente (body-scan, capo per il try-on).
 * Salva su filesystem sotto reflct.media.upload-dir e serve i file staticamente
 * da /uploads/** (vedi WebConfig), esponendo un URL assoluto raggiungibile anche
 * da ai-service (processo separato sulla stessa macchina in sviluppo).
 *
 * Nota: infra/docker-compose.yml prevede gia' un servizio MinIO (S3-compatible)
 * per la produzione — non usato qui perche' Docker non e' disponibile in questo
 * ambiente di sviluppo. Migrare a MinIO in futuro significa sostituire solo
 * questa classe, l'interfaccia verso MediaController resta identica.
 */
@Service
public class MediaStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final long MAX_SIZE_BYTES = 10L * 1024 * 1024;
    private static final Map<String, String> EXTENSION_BY_CONTENT_TYPE = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp"
    );

    private final Path uploadDir;
    private final String publicBaseUrl;

    public MediaStorageService(
            @Value("${reflct.media.upload-dir}") String uploadDir,
            @Value("${reflct.media.public-base-url}") String publicBaseUrl) {
        this.uploadDir = Paths.get(uploadDir);
        this.publicBaseUrl = publicBaseUrl.replaceAll("/$", "");
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException ex) {
            throw new IllegalStateException("impossibile creare la directory di upload: " + this.uploadDir, ex);
        }
    }

    public String store(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("file vuoto");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new BadRequestException("file troppo grande: massimo 10MB");
        }
        String contentType = file.getContentType();
        String extension = contentType != null ? EXTENSION_BY_CONTENT_TYPE.get(contentType) : null;
        if (extension == null) {
            throw new BadRequestException(
                    "tipo file non supportato: " + contentType + " (consentiti: jpeg, png, webp)");
        }

        String filename = UUID.randomUUID() + extension;
        Path target = uploadDir.resolve(filename);
        try {
            file.transferTo(target);
        } catch (IOException ex) {
            throw new IllegalStateException("salvataggio file fallito", ex);
        }
        return publicBaseUrl + "/uploads/" + filename;
    }
}
