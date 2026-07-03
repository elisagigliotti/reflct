import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/** Timbro/badge pixel ".stamp". Colore controllato dal parent via `color` (currentColor). */
@Component({
  selector: 'app-stamp',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stamp.component.html',
  styleUrl: './stamp.component.scss',
})
export class StampComponent {
  @Input() color = '#2A2438';
}
