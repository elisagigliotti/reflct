import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

/** Barra del titolo finestra ".win-title" (+ --teal). Icona opzionale a sinistra, close opzionale. */
@Component({
  selector: 'app-win-title',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './win-title.component.html',
  styleUrl: './win-title.component.scss',
})
export class WinTitleComponent {
  @Input() label = '';
  @Input() teal = false;
  @Input() icon = '';
  /** mostra la "x" cliccabile al posto dei 3 pulsantini decorativi */
  @Input() closable = false;
  @Output() close = new EventEmitter<void>();
}
