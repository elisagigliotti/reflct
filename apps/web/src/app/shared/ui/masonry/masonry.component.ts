import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

/** Wrapper griglia masonry 2 colonne ".masonry-2". Contenuto libero via ng-content. */
@Component({
  selector: 'app-masonry',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './masonry.component.html',
  styleUrl: './masonry.component.scss',
})
export class MasonryComponent {}
