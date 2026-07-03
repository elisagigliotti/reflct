import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SizeAdvisorResponse } from './models';

/** Client verso com.reflct.api.sizeadvisor (confronta corpo/taglia via ai-service). */
@Injectable({ providedIn: 'root' })
export class SizeAdvisorService {
  private readonly http = inject(HttpClient);

  adviseSize(garmentId: string): Observable<SizeAdvisorResponse> {
    return this.http.get<SizeAdvisorResponse>(`${environment.apiUrl}/size-advisor/${garmentId}`);
  }
}
