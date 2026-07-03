import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SocialStateService, SocialTab } from '../../core/state/social-state.service';
import { Btn95Component } from '../../shared/ui/btn95/btn95.component';
import { MasonryComponent } from '../../shared/ui/masonry/masonry.component';
import { ShotComponent } from '../../shared/ui/shot/shot.component';
import { StampComponent } from '../../shared/ui/stamp/stamp.component';
import { TabComponent } from '../../shared/ui/tab/tab.component';
import { UiWindowComponent } from '../../shared/ui/ui-window/ui-window.component';
import { WinTitleComponent } from '../../shared/ui/win-title/win-title.component';

/**
 * Battle / Social (battle.net — social) — Rate My Outfit + Outfit Battle + Trending
 * (Concept v4.0 sez 5.5), dati REALI da com.reflct.api.social (vedi SocialStateService).
 */
@Component({
  selector: 'app-social',
  standalone: true,
  imports: [
    CommonModule,
    WinTitleComponent,
    TabComponent,
    ShotComponent,
    StampComponent,
    Btn95Component,
    MasonryComponent,
    UiWindowComponent,
  ],
  templateUrl: './social.component.html',
  styleUrl: './social.component.scss',
})
export class SocialComponent {
  readonly tabs: SocialTab[] = ['Rate', 'Battle', 'Trending'];

  constructor(
    readonly state: SocialStateService,
    private readonly router: Router,
  ) {}

  openItem(id: string | number): void {
    this.router.navigate(['/prova', id]);
  }
}
