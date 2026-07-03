import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateSocialPostRequest, SocialPostResponse, TipoSocialPost, VoteRequest } from './models';

/** Client verso com.reflct.api.social (Rate My Outfit / Outfit Battle). */
@Injectable({ providedIn: 'root' })
export class SocialService {
  private readonly http = inject(HttpClient);

  list(tipo: TipoSocialPost): Observable<SocialPostResponse[]> {
    return this.http.get<SocialPostResponse[]>(`${environment.apiUrl}/social/posts`, { params: { tipo } });
  }

  createPost(request: CreateSocialPostRequest): Observable<SocialPostResponse> {
    return this.http.post<SocialPostResponse>(`${environment.apiUrl}/social/post`, request);
  }

  vote(request: VoteRequest): Observable<SocialPostResponse> {
    return this.http.post<SocialPostResponse>(`${environment.apiUrl}/social/vote`, request);
  }
}
