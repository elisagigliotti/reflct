import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Btn95Component } from './shared/ui/btn95/btn95.component';
import { AuthService } from './core/auth/auth.service';
import { NavItem } from './shared/data/models';

const NAV: NavItem[] = [
  { key: 'Feed', icon: '🖥', label: 'FEED', path: '/feed' },
  { key: 'Prova', icon: '🪞', label: 'PROVA', path: '/prova' },
  { key: 'Armadio', icon: '🗄', label: 'ARMADIO', path: '/armadio' },
  { key: 'Io', icon: '💾', label: 'IO', path: '/io' },
];

/** Schermate raggiungibili solo dal menu Start (non nella taskbar principale). */
interface StartMenuItem {
  icon: string;
  label: string;
  path: string;
}

const START_MENU: StartMenuItem[] = [
  { icon: '✦', label: 'Body Scan', path: '/scan' },
  { icon: '🔗', label: 'Import Link', path: '/import' },
  { icon: '⚔', label: 'Battle / Social', path: '/social' },
  { icon: '↗', label: 'Condividi Look', path: '/share' },
  { icon: '💰', label: 'Price Tracker', path: '/price-tracker' },
];

/** Menu contestuale per schermata (voci decorative, come da handoff: "Feed: File Fit View"). */
const MENU_BY_SEGMENT: Record<string, string[]> = {
  feed: ['File', 'Fit', 'View'],
  prova: ['File', 'Cabina', 'AR'],
  armadio: ['File', 'Look', 'Ordina'],
  io: ['Profilo', 'Misure', 'Esci'],
  import: ['File', 'Analizza'],
  social: ['File', 'Vota'],
  share: ['File', 'Esporta'],
  'price-tracker': ['File', 'Alert'],
  onboarding: ['File'],
  login: ['File'],
  register: ['File'],
};

const TITLE_BY_SEGMENT: Record<string, string> = {
  feed: 'Home/Feed',
  prova: 'Cabina Avatar AR',
  armadio: 'Armadio Look Ordina',
  io: 'Profilo Misure Esci',
  import: 'Import Link',
  social: 'Battle.net Social',
  share: 'Condividi Look',
  'price-tracker': 'Pricewatch Alert',
  onboarding: 'Onboarding',
  login: 'Accedi',
  register: 'Crea Account',
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, Btn95Component],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly nav = NAV;
  readonly startMenu = START_MENU;
  readonly startMenuOpen = signal(false);
  readonly currentSegment = signal<string>('feed');

  readonly menuItems = computed(() => MENU_BY_SEGMENT[this.currentSegment()] ?? ['File']);
  readonly menuTitle = computed(() => TITLE_BY_SEGMENT[this.currentSegment()] ?? '');

  readonly clock = '23:59';
  readonly date = '▚ 1999/05/23';

  /** Nasconde menubar/taskbar OS nelle schermate "a sé stanti" (boot / auth, senza sessione). */
  private static readonly CHROME_LESS_SEGMENTS = new Set(['onboarding', 'login', 'register']);
  readonly hideChrome = computed(() => AppComponent.CHROME_LESS_SEGMENTS.has(this.currentSegment()));

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      const segment = this.router.url.split('/').filter(Boolean)[0] ?? 'feed';
      this.currentSegment.set(segment);
      this.startMenuOpen.set(false);
    });
  }

  isActive(path: string): boolean {
    return this.currentSegment() === path.replace('/', '');
  }

  toggleStartMenu(): void {
    this.startMenuOpen.update((v) => !v);
  }

  closeStartMenu(): void {
    this.startMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.startMenuOpen.set(false);
    this.router.navigate(['/login']);
  }
}
