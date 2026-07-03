// Rispecchia com.reflct.api.share.

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
  pinInChiaro: string | null;
  viewCount: number;
  createdAt: string;
}
