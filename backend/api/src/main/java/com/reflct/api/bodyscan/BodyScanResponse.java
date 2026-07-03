package com.reflct.api.bodyscan;

import java.time.Instant;
import java.util.UUID;

public record BodyScanResponse(
        UUID id,
        String fotoFrontUrl,
        String fotoSideUrl,
        String videoUrl,
        String misureJson,
        String status,
        Instant createdAt
) {
    public static BodyScanResponse from(BodyScan scan) {
        return new BodyScanResponse(
                scan.getId(),
                scan.getFotoFrontUrl(),
                scan.getFotoSideUrl(),
                scan.getVideoUrl(),
                scan.getMisureJson(),
                scan.getStatus(),
                scan.getCreatedAt()
        );
    }
}
