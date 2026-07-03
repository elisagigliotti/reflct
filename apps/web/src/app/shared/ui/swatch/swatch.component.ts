import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/** Cerchio colore selezionabile ".swatch" (selettore colore in Prova). */
@Component({
  selector: 'app-swatch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './swatch.component.html',
  styleUrl: './swatch.component.scss',
})
export class SwatchComponent {
  @Input() color = '#FF5FA2';
  @Input() active = false;
}
