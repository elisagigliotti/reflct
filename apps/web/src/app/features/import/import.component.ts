import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ImportStateService } from '../../core/state/import-state.service';
import { Btn95Component } from '../../shared/ui/btn95/btn95.component';
import { FeedCardComponent } from '../../shared/ui/feed-card/feed-card.component';
import { RowComponent } from '../../shared/ui/row/row.component';
import { WinTitleComponent } from '../../shared/ui/win-title/win-title.component';

/**
 * Import Link (import.exe) — NUOVA schermata, reskin retro-OS.
 * Vedi packages/design-tokens/README.md sezione "4. Import Link". Dati REALI:
 * POST /api/v1/garments/import (delega a scraping-service).
 */
@Component({
  selector: 'app-import',
  standalone: true,
  imports: [CommonModule, WinTitleComponent, Btn95Component, FeedCardComponent, RowComponent],
  templateUrl: './import.component.html',
  styleUrl: './import.component.scss',
})
export class ImportComponent {
  constructor(readonly state: ImportStateService) {}

  onUrlChange(value: string): void {
    this.state.setUrl(value);
  }

  noop(): void {
    // apre nel Feed/Prova reale in prod; qui e' solo un placeholder di card non cliccabile.
  }
}
