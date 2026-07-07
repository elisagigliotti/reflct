// Client verso com.reflct.api.social (Rate My Outfit / Outfit Battle).
import { api } from './client';

export type TipoSocialPost = 'RATE' | 'BATTLE';

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

export interface CreateSocialPostRequest {
  sessionId: string;
  tipo: TipoSocialPost;
}

export interface VoteRequest {
  postId: string;
  opzione: string; // 'fire'|'meh'|'skip' per RATE, 'a'|'b' per BATTLE
}

export function listPosts(tipo: TipoSocialPost): Promise<SocialPostResponse[]> {
  return api.get<SocialPostResponse[]>(`/social/posts?tipo=${tipo}`);
}

export function createPost(request: CreateSocialPostRequest): Promise<SocialPostResponse> {
  return api.post<SocialPostResponse>('/social/post', request);
}

export function vote(request: VoteRequest): Promise<SocialPostResponse> {
  return api.post<SocialPostResponse>('/social/vote', request);
}
