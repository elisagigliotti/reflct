// Client verso com.reflct.api.pricetracker.
import { api } from './client';

export interface PriceAlertResponse {
  id: string;
  garmentId: string;
  soglia: number;
  active: boolean;
  triggeredAt: string | null;
  createdAt: string;
}

export interface CreatePriceAlertRequest {
  garmentId: string;
  soglia: number;
}

export function listMyAlerts(): Promise<PriceAlertResponse[]> {
  return api.get<PriceAlertResponse[]>('/price-alerts');
}

export function createAlert(request: CreatePriceAlertRequest): Promise<PriceAlertResponse> {
  return api.post<PriceAlertResponse>('/price-alerts', request);
}
