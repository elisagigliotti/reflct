import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FeedStateService } from '../../core/state/feed-state.service';
import { FeedCardComponent } from '../../shared/ui/feed-card/feed-card.component';
import { MasonryComponent } from '../../shared/ui/masonry/masonry.component';
import { WinTitleComponent } from '../../shared/ui/win-title/win-title.component';

/** "€79" / "€ 1.299,50" -> 79 / 1299.5 (formato prezzi di toFeedItem). */
function parseEuro(price: string): number {
  const n = Number(price.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Armadio (wardrobe.dat) — HIFI, vedi docs/design-reference/README.md "3 · Armadio".
 * Le statistiche sono calcolate SOLO dai capi salvati reali: le vecchie cifre
 * fisse (7 look, 42 provati, cartelle Estate/Lavoro/Festa) erano inventate e
 * sono state tolte, come gia' fatto per le stats del profilo.
 */
@Component({
  selector: 'app-wardrobe',
  standalone: true,
  imports: [CommonModule, RouterLink, WinTitleComponent, MasonryComponent, FeedCardComponent],
  templateUrl: './wardrobe.component.html',
  styleUrl: './wardrobe.component.scss',
})
export class WardrobeComponent {
  readonly onSale = computed(() => this.feed.likedItems().filter((it) => !!it.old).length);
  readonly total = computed(() =>
    Math.round(this.feed.likedItems().reduce((sum, it) => sum + parseEuro(it.price), 0)),
  );

  constructor(
    readonly feed: FeedStateService,
    private readonly router: Router,
  ) {}

  openItem(id: string | number): void {
    this.router.navigate(['/prova', id]);
  }
}
