import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Btn95Component } from '../../shared/ui/btn95/btn95.component';
import { PixelIconComponent } from '../../shared/ui/pixel-icon/pixel-icon.component';
import { ShotComponent } from '../../shared/ui/shot/shot.component';
import { WinTitleComponent } from '../../shared/ui/win-title/win-title.component';

interface OnboardingTile {
  color: string;
  label: string;
  rot: number;
}

const PALETTE = ['#4FD3E6', '#FF5FA2', '#C6A5F2', '#F5D14E', '#2FAF8E', '#F5A03D'];

/**
 * Onboarding (onboarding.exe) — NUOVA schermata, reskin retro-OS.
 * Vedi packages/design-tokens/README.md sezione "1. Onboarding". Prima route,
 * mostrata solo pre-login/prima volta: il CTA porta alla registrazione.
 */
@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, RouterLink, WinTitleComponent, Btn95Component, PixelIconComponent, ShotComponent],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
})
export class OnboardingComponent {
  readonly tiles: OnboardingTile[] = Array.from({ length: 9 }, (_, i) => ({
    color: PALETTE[i % PALETTE.length],
    label: `OOTD_0${i + 1}.BMP`,
    rot: i % 2 === 0 ? -1.2 : 1.2,
  }));

  constructor(private readonly router: Router) {}

  start(): void {
    this.router.navigate(['/register']);
  }
}
