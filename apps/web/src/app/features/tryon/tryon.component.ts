import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SizeAdvisorService } from '../../core/sizeadvisor/size-advisor.service';
import { SizeAdvisorResponse } from '../../core/sizeadvisor/models';
import { FeedStateService } from '../../core/state/feed-state.service';
import { TryonStateService } from '../../core/state/tryon-state.service';
import { Btn95Component } from '../../shared/ui/btn95/btn95.component';
import { FitbarComponent } from '../../shared/ui/fitbar/fitbar.component';
import { SwatchComponent } from '../../shared/ui/swatch/swatch.component';
import { TabComponent } from '../../shared/ui/tab/tab.component';
import { WinTitleComponent } from '../../shared/ui/win-title/win-title.component';

const MEASURE_LABELS: Record<string, string> = {
  busto_cm: 'busto',
  vita_cm: 'vita',
  fianchi_cm: 'fianchi',
  spalle_cm: 'spalle',
  torso_cm: 'torso',
  inseam_cm: 'cavallo',
  manica_cm: 'manica',
};

/**
 * Prova / Try-On AR (tryon.exe — cabina di prova) — HIFI, vedi
 * docs/design-reference/README.md sezione "2 · Prova" + screenshot 02-prova.png.
 * Il capo viene da FeedStateService (dati reali, vedi core/state/feed-state.service.ts):
 * se non arriva un id valido dalla route (:id) o il feed sta ancora caricando, si usa
 * il primo capo disponibile appena il feed e' pronto.
 * Aggiunta concettuale dal Concept v4.0: corner marker AR (placeholder, non funzionante).
 */
@Component({
  selector: 'app-tryon',
  standalone: true,
  imports: [CommonModule, WinTitleComponent, Btn95Component, SwatchComponent, FitbarComponent, TabComponent],
  templateUrl: './tryon.component.html',
  styleUrl: './tryon.component.scss',
})
export class TryonComponent {
  private readonly itemId = signal<string | null>(null);

  readonly item = computed(() => {
    const id = this.itemId();
    const found = id ? this.feed.getItem(id) : undefined;
    return found ?? this.feed.items()[0];
  });
  readonly liked = computed(() => {
    const it = this.item();
    return it ? this.feed.isLiked(it.id) : false;
  });

  /** Consiglio taglia/fit REALE da GET /api/v1/size-advisor/{id} (confronta corpo/taglia via ai-service). */
  readonly advice = signal<SizeAdvisorResponse | null>(null);
  readonly adviceLoading = signal(false);
  readonly adviceError = signal<string | null>(null);
  readonly fitPercent = computed(() => Math.round(this.advice()?.fitScore ?? 0));
  readonly measureRows = computed(() => {
    const dettaglio = this.advice()?.dettaglio ?? {};
    return Object.entries(MEASURE_LABELS)
      .filter(([key]) => key in dettaglio)
      .map(([key, label]) => [label, dettaglio[key]] as [string, string]);
  });

  constructor(
    readonly feed: FeedStateService,
    readonly tryon: TryonStateService,
    private readonly sizeAdvisorService: SizeAdvisorService,
    route: ActivatedRoute,
    private readonly router: Router,
  ) {
    route.paramMap.subscribe((params) => {
      this.itemId.set(params.get('id'));
    });

    let lastRequestedId: string | number | null = null;
    effect(() => {
      const it = this.item();
      const id = it ? String(it.id) : null;
      if (!id || id === lastRequestedId) {
        return;
      }
      lastRequestedId = id;
      this.advice.set(null);
      this.adviceError.set(null);
      this.adviceLoading.set(true);
      this.sizeAdvisorService.adviseSize(id).subscribe({
        next: (res) => {
          this.advice.set(res);
          this.adviceLoading.set(false);
          if (this.tryon.sizes.includes(res.consigliata)) {
            this.tryon.setSize(res.consigliata);
          }
        },
        error: (err) => {
          this.adviceLoading.set(false);
          this.adviceError.set(
            err.status === 400
              ? 'Fai prima il body-scan per vedere il fit su di te.'
              : 'Impossibile calcolare il fit per questo capo.',
          );
        },
      });
    }, { allowSignalWrites: true });
  }

  toggleLike(): void {
    const it = this.item();
    if (it) {
      this.feed.toggleLike(it.id);
    }
  }

  addToCart(): void {
    // Mock: nessun carrello/checkout reale in questo scaffold. In prod: POST /api/v1/tryon/{id}/purchase.
    const it = this.item();
    this.router.navigate(it ? ['/share', String(it.id)] : ['/share']);
  }
}
