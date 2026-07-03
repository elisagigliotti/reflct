// Rispecchia i DTO reali di backend/api (com.reflct.api.bodyscan).

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

/** Forma di misureJson una volta parsato (7 misure corporee, Concept v4.0 sez. 5.3). */
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
