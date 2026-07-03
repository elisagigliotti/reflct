import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/**
 * Finestra base ".win" (+ --mint, --pop). Contenitore generico: usare <ng-content>
 * per title bar + body, oppure comporre con app-win-title dentro il default slot.
 */
@Component({
  selector: 'app-ui-window',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-window.component.html',
  styleUrl: './ui-window.component.scss',
})
export class UiWindowComponent {
  /** variante menta (--mint) */
  @Input() mint = false;
  /** variante "pop" — hover che salta (card cliccabili) */
  @Input() pop = false;
}
