import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ShareStateService } from '../../core/state/share-state.service';
import { Btn95Component } from '../../shared/ui/btn95/btn95.component';
import { RowComponent } from '../../shared/ui/row/row.component';
import { ShotComponent } from '../../shared/ui/shot/shot.component';
import { WinTitleComponent } from '../../shared/ui/win-title/win-title.component';

interface SocialShareButton {
  glyph: string;
  label: string;
}

const SOCIAL_BUTTONS: SocialShareButton[] = [
  { glyph: '✦', label: 'WhatsApp' },
  { glyph: '★', label: 'Instagram' },
  { glyph: '♥', label: 'TikTok' },
  { glyph: '◈', label: 'X' },
];

/**
 * Condivisione (share.exe) — NUOVA schermata, reskin retro-OS.
 * Vedi packages/design-tokens/README.md sezione "7. Condivisione" (Concept v4.0 sez 5.6).
 */
@Component({
  selector: 'app-share',
  standalone: true,
  imports: [CommonModule, WinTitleComponent, Btn95Component, RowComponent, ShotComponent],
  templateUrl: './share.component.html',
  styleUrl: './share.component.scss',
})
export class ShareComponent {
  readonly socialButtons = SOCIAL_BUTTONS;

  constructor(
    readonly state: ShareStateService,
    route: ActivatedRoute,
  ) {
    const itemId = route.snapshot.paramMap.get('itemId');
    if (itemId) {
      this.state.init(itemId);
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
}
