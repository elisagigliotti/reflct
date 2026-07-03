import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Riga bigliettino ".row" (+ __k, __v) — usata in settings.ini, shop popolari (Import),
 * opzioni link (Share), riga alert (Price Tracker). Specchio di apps/mobile/src/ui/Row.tsx.
 */
@Component({
  selector: 'app-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './row.component.html',
  styleUrl: './row.component.scss',
})
export class RowComponent {
  @Input({ required: true }) keyLabel = '';
  @Input() valueLabel = '';
  @Input() icon = '';
  @Input() highlighted = false;
  @Input() showChevron = false;
  @Output() rowClick = new EventEmitter<void>();
}
