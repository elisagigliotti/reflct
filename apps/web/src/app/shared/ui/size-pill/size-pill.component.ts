import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/** Badge taglia ".size-pill" (usato come overlay sulle card capo). */
@Component({
  selector: 'app-size-pill',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './size-pill.component.html',
  styleUrl: './size-pill.component.scss',
})
export class SizePillComponent {
  @Input() size = '';
}
