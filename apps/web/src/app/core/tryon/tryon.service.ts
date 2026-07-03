import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TryOnSessionResponse, TryOnStartRequest } from './models';

/**
 * Client verso com.reflct.api.tryon. Serve da "ponte" reale verso Social/Share,
 * che referenziano entrambi un TryOnSession (sez. 5.5/5.6 del Concept): senza una
 * sessione reale non esiste nulla da condividere o postare, quindi Social e Share
 * creano una sessione al volo se non ne esiste gia' una per il capo corrente.
 */
@Injectable({ providedIn: 'root' })
export class TryOnService {
  private readonly http = inject(HttpClient);

  start(request: TryOnStartRequest): Observable<TryOnSessionResponse> {
    return this.http.post<TryOnSessionResponse>(`${environment.apiUrl}/tryon/start`, request);
  }
}
