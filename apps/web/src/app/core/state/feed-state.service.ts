import { Injectable, computed, inject, signal } from '@angular/core';
import { GarmentsService } from '../garments/garments.service';
import { toFeedItem } from '../../shared/data/garment-visuals';
import { FeedItem } from '../../shared/data/models';

/**
 * Single source of truth per il feed capi e i "like" (cuore), condivisa tra
 * Feed / Prova / Armadio — dati REALI da GET /api/v1/garments e
 * POST /api/v1/gallery/{id}/toggle-favorite (com.reflct.api.garment/wardrobe),
 * non piu' mock. "like" attivo = capo salvato in guardaroba (WardrobeItem),
 * coerente con l'handoff di design ("SALVATI" in Armadio = capi con like).
 */
@Injectable({ providedIn: 'root' })
export class FeedStateService {
  private readonly garmentsService = inject(GarmentsService);

  readonly items = signal<FeedItem[]>([]);
  readonly liked = signal<Record<string, boolean>>({});
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  readonly filter = signal<string>('Per te');

  /** dialog body-scan (Feed) */
  readonly showScanBanner = signal<boolean>(true);

  readonly likedItems = computed(() => this.items().filter((it) => this.liked()[String(it.id)]));

  readonly savedCount = computed(() => this.likedItems().length);

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.garmentsService.listGarments().subscribe({
      next: (page) => {
        this.items.set(page.content.map(toFeedItem));
        const likedMap: Record<string, boolean> = {};
        page.content.forEach((g) => {
          likedMap[g.id] = g.preferito;
        });
        this.liked.set(likedMap);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossibile caricare il feed. Riprova più tardi.');
        this.loading.set(false);
      },
    });
  }

  isLiked(id: string | number): boolean {
    return !!this.liked()[String(id)];
  }

  toggleLike(id: string | number): void {
    const garmentId = String(id);
    const wasLiked = this.isLiked(garmentId);

    // Aggiornamento ottimistico: il cuore cambia subito, si annulla solo se la
    // chiamata fallisce davvero (rete/permessi), per un'interazione reattiva.
    this.liked.update((s) => ({ ...s, [garmentId]: !wasLiked }));

    this.garmentsService.toggleFavorite(garmentId).subscribe({
      error: () => {
        this.liked.update((s) => ({ ...s, [garmentId]: wasLiked }));
      },
    });
  }

  setFilter(label: string): void {
    this.filter.set(label);
  }

  dismissBanner(): void {
    this.showScanBanner.set(false);
  }

  getItem(id: string | number): FeedItem | undefined {
    const key = String(id);
    return this.items().find((it) => String(it.id) === key);
  }
}
