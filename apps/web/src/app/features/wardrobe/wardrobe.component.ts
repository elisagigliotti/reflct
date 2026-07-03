import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FeedStateService } from '../../core/state/feed-state.service';
import { WardrobeStateService } from '../../core/state/wardrobe-state.service';
import { FeedCardComponent } from '../../shared/ui/feed-card/feed-card.component';
import { FolderComponent } from '../../shared/ui/folder/folder.component';
import { MasonryComponent } from '../../shared/ui/masonry/masonry.component';
import { WinTitleComponent } from '../../shared/ui/win-title/win-title.component';

/**
 * Armadio (wardrobe.dat — il mio armadio) — HIFI, vedi
 * docs/design-reference/README.md sezione "3 · Armadio" + screenshot 03-armadio.png.
 */
@Component({
  selector: 'app-wardrobe',
  standalone: true,
  imports: [CommonModule, WinTitleComponent, FolderComponent, MasonryComponent, FeedCardComponent],
  templateUrl: './wardrobe.component.html',
  styleUrl: './wardrobe.component.scss',
})
export class WardrobeComponent {
  constructor(
    readonly feed: FeedStateService,
    readonly wardrobe: WardrobeStateService,
    private readonly router: Router,
  ) {}

  openItem(id: string | number): void {
    this.router.navigate(['/prova', id]);
  }
}
