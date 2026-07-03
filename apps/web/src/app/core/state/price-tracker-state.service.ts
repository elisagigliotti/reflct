import { Injectable, inject, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { GarmentsService } from '../garments/garments.service';
import { PriceAlertsService } from '../garments/price-alerts.service';
import { GarmentItemResponse } from '../garments/models';
import { toFeedItem } from '../../shared/data/garment-visuals';
import { PriceTrackedItem } from '../../shared/data/models';

/**
 * Stato pricewatch.sys — dati REALI (GET /api/v1/garments + GET .../price-history +
 * GET/POST /api/v1/price-alerts), non piu' mock. "Monitorati" = i capi che hanno
 * almeno uno storico prezzo (price_history), cosi' la sparkline mostra dati veri.
 */
@Injectable({ providedIn: 'root' })
export class PriceTrackerStateService {
  private readonly garmentsService = inject(GarmentsService);
  private readonly priceAlertsService = inject(PriceAlertsService);

  readonly items = signal<PriceTrackedItem[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);

    this.garmentsService.listGarments().pipe(
      map((page) => page.content.filter((g) => g.prezzoPrecedente != null)),
      switchMap((tracked) => {
        if (tracked.length === 0) {
          return of([] as PriceTrackedItem[]);
        }
        return forkJoin({
          garments: of(tracked),
          histories: forkJoin(tracked.map((g) => this.garmentsService.getPriceHistory(g.id))),
          alerts: this.priceAlertsService.listMine().pipe(catchError(() => of([]))),
        }).pipe(
          map(({ garments, histories, alerts }) =>
            garments.map((g, i) => this.toTrackedItem(g, histories[i].map((h) => h.prezzo), alerts)),
          ),
        );
      }),
    ).subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossibile caricare i capi monitorati. Riprova più tardi.');
        this.loading.set(false);
      },
    });
  }

  private toTrackedItem(
    garment: GarmentItemResponse,
    historyPrices: number[],
    alerts: { garmentId: string; soglia: number }[],
  ): PriceTrackedItem {
    const history = [...historyPrices, garment.prezzoAttuale ?? 0];
    const isAllTimeLow = (garment.prezzoAttuale ?? Infinity) <= Math.min(...history);
    const alert = alerts.find((a) => a.garmentId === garment.id);
    return {
      ...toFeedItem(garment),
      history,
      isAllTimeLow,
      alertThreshold: alert ? alert.soglia : null,
    };
  }

  setThreshold(id: string | number, value: number | null): void {
    if (value == null) {
      this.items.update((list) => list.map((it) => (it.id === id ? { ...it, alertThreshold: null } : it)));
      return;
    }
    this.priceAlertsService.create(String(id), value).subscribe({
      next: (alert) => {
        this.items.update((list) =>
          list.map((it) => (it.id === id ? { ...it, alertThreshold: alert.soglia } : it)),
        );
      },
    });
  }
}
