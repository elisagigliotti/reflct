// Rispecchia i DTO reali di backend/api (com.reflct.api.bodyscan).
// Stessa forma di apps/web/src/app/core/bodyscan/models.ts.
import { api } from './client';

export interface BodyScanRequest {
  fotoFrontUrl: string;
  fotoSideUrl?: string | null;
  videoUrl?: string | null;
  altezzaCm: number;
}

export interface BodyScanResponse {
  id: string;
  fotoFrontUrl: string;
  fotoSideUrl: string | null;
  videoUrl: string | null;
  misureJson: string | null;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface BodyMeasures {
  busto_cm?: number;
  vita_cm?: number;
  fianchi_cm?: number;
  spalle_cm?: number;
  torso_cm?: number;
  inseam_cm?: number;
  manica_cm?: number;
  confidence?: number;
}

export const bodyScanApi = {
  start: (request: BodyScanRequest) => api.post<BodyScanResponse>('/body-scan', request),
  getMine: () => api.get<BodyScanResponse>('/body-scan/me'),
};
