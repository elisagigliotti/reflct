import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type Btn95Variant = 'default' | 'cta' | 'cyan' | 'yellow';

/** Bottone beveled retro ".btn-95" (+ --cta, --cyan, --yellow, --block). */
@Component({
  selector: 'app-btn95',
  // [block]: anche l'host deve occupare tutta la riga, non solo il <button> interno
  host: { '[class.is-block]': 'block' },
  standalone: true,
  imports: [CommonModule],
  templateUrl: './btn95.component.html',
  styleUrl: './btn95.component.scss',
})
export class Btn95Component {
  @Input() variant: Btn95Variant = 'default';
  @Input() block = false;
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' = 'button';
}
