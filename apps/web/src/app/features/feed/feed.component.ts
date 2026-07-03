import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { FeedStateService } from '../../core/state/feed-state.service';
import { FILTERS } from '../../shared/data/mock-feed';
import { Btn95Component } from '../../shared/ui/btn95/btn95.component';
import { FeedCardComponent } from '../../shared/ui/feed-card/feed-card.component';
import { MasonryComponent } from '../../shared/ui/masonry/masonry.component';
import { StampComponent } from '../../shared/ui/stamp/stamp.component';
import { TabComponent } from '../../shared/ui/tab/tab.component';
import { WinTitleComponent } from '../../shared/ui/win-title/win-title.component';

/**
 * Feed — home.exe / wardrobe.exe. Schermata HIFI, vedi docs/design-reference/README.md
 * sezione "1 · Feed" + screenshot 01-feed.png. Nessuna modifica rispetto al prototipo
 * Reflct App.dc.html (solo traduzione in Angular standalone + signals).
 */
@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
    CommonModule,
    WinTitleComponent,
    Btn95Component,
    StampComponent,
    TabComponent,
    MasonryComponent,
    FeedCardComponent,
  ],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss',
})
export class FeedComponent {
  readonly filters = FILTERS;
  readonly user = this.auth.currentUser;

  constructor(
    readonly state: FeedStateService,
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  openItem(id: string | number): void {
    this.router.navigate(['/prova', id]);
  }

  goScan(): void {
    this.router.navigate(['/scan']);
  }
}
