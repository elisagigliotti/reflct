// Client verso com.reflct.api.share.
import { api } from './client';

export type TipoSharedLink = 'PERMANENT' | 'H24' | 'D7' | 'D30' | 'PIN_PROTECTED';

export interface CreateShareRequest {
  sessionId: string;
  tipo: TipoSharedLink;
}

export interface SharedLinkResponse {
  id: string;
  token: string;
  tipo: TipoSharedLink;
  scadenza: string | null;
  pinInChiaro: string | null; // solo su tipo=PIN_PROTECTED, solo alla creazione
  viewCount: number;
  createdAt: string;
}

export function createShareLink(request: CreateShareRequest): Promise<SharedLinkResponse> {
  return api.post<SharedLinkResponse>('/share', request);
}
