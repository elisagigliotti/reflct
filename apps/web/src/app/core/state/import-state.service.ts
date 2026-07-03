import { Injectable, inject, signal } from '@angular/core';
import { GarmentsService } from '../garments/garments.service';
import { toFeedItem } from '../../shared/data/garment-visuals';
import { SHOP_ENTRIES } from '../../shared/data/mock-feed';
import { FeedItem, ShopEntry } from '../../shared/data/models';

/**
 * Stato Import Link (import.exe) — dati REALI: POST /api/v1/garments/import
 * (com.reflct.api.garment.GarmentController), che a sua volta delega lo
 * scraping vero e proprio a scraping-service. Taglia consigliata/fit non
 * fabbricati (richiederebbero un body-scan + size-advisor, fuori scope qui,
 * stessa scelta gia' fatta in tryon.component.ts).
 */
@Injectable({ providedIn: 'root' })
export class ImportStateService {
  private readonly garmentsService = inject(GarmentsService);

  readonly url = signal<string>('');
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly imported = signal<FeedItem | null>(null);
  readonly addedToWardrobe = signal<boolean>(false);

  readonly shops: ShopEntry[] = SHOP_ENTRIES;

  setUrl(url: string): void {
    this.url.set(url);
  }

  pickShop(shop: ShopEntry): void {
    this.url.set(shop.url);
  }

  analyze(): void {
    const url = this.url().trim();
    if (!url) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.imported.set(null);
    this.addedToWardrobe.set(false);

    this.garmentsService.importGarment(url).subscribe({
      next: (garment) => {
        this.imported.set(toFeedItem(garment));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossibile importare questo link. Riprova con un altro URL.');
        this.loading.set(false);
      },
    });
  }

  addToWardrobe(): void {
    const item = this.imported();
    if (!item || this.addedToWardrobe()) {
      return;
    }
    this.garmentsService.toggleFavorite(String(item.id)).subscribe({
      next: () => this.addedToWardrobe.set(true),
    });
  }

  reset(): void {
    this.url.set('');
    this.imported.set(null);
    this.loading.set(false);
    this.error.set(null);
    this.addedToWardrobe.set(false);
  }
}
