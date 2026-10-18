import { CommonModule } from '@angular/common';
import { Component, effect, untracked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FeedStateService } from '../../core/state/feed-state.service';
import { ShareStateService } from '../../core/state/share-state.service';
import { PixelIconComponent } from '../../shared/ui/pixel-icon/pixel-icon.component';
import { Btn95Component } from '../../shared/ui/btn95/btn95.component';
import { RowComponent } from '../../shared/ui/row/row.component';
import { ShotComponent } from '../../shared/ui/shot/shot.component';
import { WinTitleComponent } from '../../shared/ui/win-title/win-title.component';

/**
 * Condivisione (share.exe) — NUOVA schermata, reskin retro-OS.
 * Vedi packages/design-tokens/README.md sezione "7. Condivisione" (Concept v4.0 sez 5.6).
 */
@Component({
  selector: 'app-share',
  standalone: true,
  imports: [CommonModule, WinTitleComponent, Btn95Component, PixelIconComponent, RowComponent, ShotComponent],
  templateUrl: './share.component.html',
  styleUrl: './share.component.scss',
})
export class ShareComponent {
  /** Il pannello di condivisione nativo (WhatsApp, Instagram, …) esiste solo su alcuni browser. */
  readonly canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  constructor(
    readonly state: ShareStateService,
    feed: FeedStateService,
    route: ActivatedRoute,
  ) {
    const itemId = route.snapshot.paramMap.get('itemId');
    if (itemId) {
      // Aperta da link diretto/reload il feed non e' ancora caricato: si aspetta
      // che arrivino i capi invece di dire subito "capo non trovato".
      let started = false;
      effect(
        () => {
          if (!started && feed.items().length > 0) {
            started = true;
            untracked(() => this.state.init(itemId));
          }
        },
        { allowSignalWrites: true },
      );
    }
  }

  copyUrl(): void {
    const url = this.state.generatedUrl();
    if (!url) {
      return;
    }
    this.state.copy();
    navigator.clipboard?.writeText(`https://${url}`).catch(() => {
      // Ambiente senza permessi clipboard (es. iframe): il feedback visivo "copiato" resta comunque.
    });
  }

  /**
   * Sostituisce la vecchia griglia WhatsApp/Instagram/TikTok/X e il bottone
   * "ESPORTA 9:16", che non facevano nulla: il foglio di condivisione del
   * sistema li offre tutti, con il link vero.
   */
  nativeShare(): void {
    const url = this.state.generatedUrl();
    const item = this.state.item();
    if (!url || !this.canNativeShare) {
      return;
    }
    navigator
      .share({ title: item ? `${item.name} su Reflct` : 'Il mio look su Reflct', url: `https://${url}` })
      .catch(() => {
        // Annullato dall'utente: nessun messaggio da mostrare.
      });
  }
}
