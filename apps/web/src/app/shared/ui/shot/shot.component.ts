import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/** Placeholder scatto prodotto dithered ".shot" (+ .shot__tag). */
@Component({
  selector: 'app-shot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shot.component.html',
  styleUrl: './shot.component.scss',
})
export class ShotComponent {
  @Input() color = '#4FD3E6';
  @Input() label = '';
  @Input() height: number | null = null;
  /** rotazione fissa opzionale (es. Import preview --rot:-0.5deg) */
  @Input() rot: number | null = null;
}
