// Client verso com.reflct.api.tryon — usato da Prova (render fotorealistico
// reale) e da Social/Share, che referenziano entrambi un TryOnSession.
import { api } from './client';

export interface TryOnStartRequest {
  garmentId: string;
  fotoUrl: string;
  vista?: 'FRONTE' | 'RETRO';
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

export function startTryOn(request: TryOnStartRequest): Promise<TryOnSessionResponse> {
  return api.post<TryOnSessionResponse>('/tryon/start', request);
}
