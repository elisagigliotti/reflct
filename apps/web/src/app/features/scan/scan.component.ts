import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BodyScanStateService } from '../../core/state/body-scan-state.service';
import { Btn95Component } from '../../shared/ui/btn95/btn95.component';
import { WinTitleComponent } from '../../shared/ui/win-title/win-title.component';

/**
 * Body Scan (scan.exe) — NUOVA schermata, reskin retro-OS (Concept v4.0 sez. 5.3).
 * Dati REALI: POST /api/v1/body-scan → ai-service. Nessun upload foto reale in
 * questo scaffold: l'utente incolla l'URL della foto (stesso pattern di Import Link).
 */
@Component({
  selector: 'app-scan',
  standalone: true,
  imports: [CommonModule, WinTitleComponent, Btn95Component],
  templateUrl: './scan.component.html',
  styleUrl: './scan.component.scss',
})
export class ScanComponent {
  readonly measureLabels: Record<string, string> = {
    busto_cm: 'busto',
    vita_cm: 'vita',
    fianchi_cm: 'fianchi',
    spalle_cm: 'spalle',
    torso_cm: 'torso',
    inseam_cm: 'cavallo',
    manica_cm: 'manica',
  };

  constructor(
    readonly state: BodyScanStateService,
    private readonly router: Router,
  ) {}

  onFrontUrlChange(value: string): void {
    this.state.fotoFrontUrl.set(value);
  }

  onSideUrlChange(value: string): void {
    this.state.fotoSideUrl.set(value);
  }

  onAltezzaChange(value: string): void {
    const parsed = Number(value);
    this.state.altezzaCm.set(Number.isFinite(parsed) && parsed > 0 ? parsed : null);
  }

  measureEntries(): [string, number][] {
    const measures = this.state.measures();
    if (!measures) {
      return [];
    }
    return Object.entries(this.measureLabels)
      .filter(([key]) => key in measures)
      .map(([key, label]) => [label, (measures as Record<string, number>)[key]]);
  }

  goToFeed(): void {
    this.router.navigate(['/feed']);
  }
}
