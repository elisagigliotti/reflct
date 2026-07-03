import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/** Linguetta filtro/tab ".tab" (+ is-active). Renderizzata come <button>. */
@Component({
  selector: 'app-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.scss',
})
export class TabComponent {
  @Input() active = false;
}
