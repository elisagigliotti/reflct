import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PriceAlertResponse } from './models';

/** Client verso com.reflct.api.pricetracker. */
@Injectable({ providedIn: 'root' })
export class PriceAlertsService {
  private readonly http = inject(HttpClient);

  listMine(): Observable<PriceAlertResponse[]> {
    return this.http.get<PriceAlertResponse[]>(`${environment.apiUrl}/price-alerts`);
  }

  create(garmentId: string, soglia: number): Observable<PriceAlertResponse> {
    return this.http.post<PriceAlertResponse>(`${environment.apiUrl}/price-alerts`, { garmentId, soglia });
  }
}
