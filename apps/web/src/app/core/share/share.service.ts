import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateShareRequest, SharedLinkResponse } from './models';

/** Client verso com.reflct.api.share. */
@Injectable({ providedIn: 'root' })
export class ShareService {
  private readonly http = inject(HttpClient);

  createLink(request: CreateShareRequest): Observable<SharedLinkResponse> {
    return this.http.post<SharedLinkResponse>(`${environment.apiUrl}/share`, request);
  }
}
