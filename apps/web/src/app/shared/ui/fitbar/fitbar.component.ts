import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/** Barra fit a segmenti ".fitbar" — 10 tacche, riempite in proporzione a `percent`. */
@Component({
  selector: 'app-fitbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fitbar.component.html',
  styleUrl: './fitbar.component.scss',
})
export class FitbarComponent {
  @Input() percent = 0;
  @Input() segments = 10;

  get segmentArray(): number[] {
    return Array.from({ length: this.segments }, (_, i) => i);
  }

  get filledCount(): number {
    return Math.round((this.percent / 100) * this.segments);
  }
}
