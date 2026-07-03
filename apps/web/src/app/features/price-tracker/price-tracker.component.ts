import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PriceTrackerStateService } from '../../core/state/price-tracker-state.service';
import { Btn95Component } from '../../shared/ui/btn95/btn95.component';
import { ShotComponent } from '../../shared/ui/shot/shot.component';
import { StampComponent } from '../../shared/ui/stamp/stamp.component';
import { WinTitleComponent } from '../../shared/ui/win-title/win-title.component';

/**
 * Price Tracker (pricewatch.sys) — NUOVA schermata, reskin retro-OS.
 * Vedi packages/design-tokens/README.md sezione "8. Price Tracker" (Concept v4.0 sez 5.4).
 */
@Component({
  selector: 'app-price-tracker',
  standalone: true,
  imports: [CommonModule, WinTitleComponent, ShotComponent, StampComponent, Btn95Component],
  templateUrl: './price-tracker.component.html',
  styleUrl: './price-tracker.component.scss',
})
export class PriceTrackerComponent {
  constructor(readonly state: PriceTrackerStateService) {}

  maxHistory(history: number[]): number {
    return Math.max(...history, 1);
  }

  barColor(index: number): string {
    const palette = ['#FF5FA2', '#4FD3E6', '#2FAF8E', '#F5D14E', '#C6A5F2'];
    return palette[index % palette.length];
  }

  onThresholdInput(id: string | number, value: string): void {
    const parsed = Number(value);
    this.state.setThreshold(id, Number.isFinite(parsed) && parsed > 0 ? parsed : null);
  }
}
