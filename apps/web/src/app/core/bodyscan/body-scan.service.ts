import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BodyScanRequest, BodyScanResponse } from './models';

/** Client verso com.reflct.api.bodyscan (che a sua volta delega ad ai-service). */
@Injectable({ providedIn: 'root' })
export class BodyScanService {
  private readonly http = inject(HttpClient);

  start(request: BodyScanRequest): Observable<BodyScanResponse> {
    return this.http.post<BodyScanResponse>(`${environment.apiUrl}/body-scan`, request);
  }

  getMine(): Observable<BodyScanResponse> {
    return this.http.get<BodyScanResponse>(`${environment.apiUrl}/body-scan/me`);
  }
}
