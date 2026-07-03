// Rispecchia com.reflct.api.social.

export type TipoSocialPost = 'RATE' | 'BATTLE';

export interface CreateSocialPostRequest {
  sessionId: string;
  tipo: TipoSocialPost;
}

export interface VoteRequest {
  postId: string;
  opzione: string;
}

export interface SocialPostResponse {
  id: string;
  sessionId: string;
  garmentId: string;
  garmentNome: string;
  tipo: TipoSocialPost;
  status: string;
  scadenza: string | null;
  votiJson: string; // JSON serializzato, es. {"fire":0,"meh":0,"skip":0} o {"a":0,"b":0}
  createdAt: string;
}
