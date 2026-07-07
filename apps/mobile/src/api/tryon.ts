// Client verso com.reflct.api.tryon — necessario per Social e Share,
// che referenziano entrambi un TryOnSession.
import { api } from './client';

export interface TryOnStartRequest {
  garmentId: string;
  fotoUrl: string;
}

export interface TryOnSessionResponse {
  id: string;
  garmentId: string;
  status: string;
  createdAt: string;
}

export function startTryOn(request: TryOnStartRequest): Promise<TryOnSessionResponse> {
  return api.post<TryOnSessionResponse>('/tryon/start', request);
}
