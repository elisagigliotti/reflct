// Rispecchia com.reflct.api.tryon.

export interface TryOnStartRequest {
  garmentId: string;
  fotoUrl: string;
  vista?: string | null;
}

export interface TryOnSessionResponse {
  id: string;
  garmentId: string;
  fotoUrl: string;
  videoUrl: string | null;
  vista: string;
  tagliaConsigliata: string | null;
  fitScore: number | null;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}
