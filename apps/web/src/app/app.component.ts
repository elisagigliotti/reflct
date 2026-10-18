import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './core/auth/auth.service';
import { NavItem } from './shared/data/models';
import { PixelIconComponent, PixelIconName } from './shared/ui/pixel-icon/pixel-icon.component';

const NAV: NavItem[] = [
  { key: 'Feed', icon: 'feed', label: 'Feed', path: '/feed' },
  { key: 'Prova', icon: 'prova', label: 'Prova', path: '/prova' },
  { key: 'Armadio', icon: 'armadio', label: 'Armadio', path: '/armadio' },
  { key: 'Io', icon: 'io', label: 'Io', path: '/io' },
];

/** Schermate raggiungibili solo dal menu Start (non nella taskbar principale). */
interface StartMenuItem {
  icon: PixelIconName;
  label: string;
  path: string;
}

const START_MENU: StartMenuItem[] = [
  { icon: 'scan', label: 'Body scan', path: '/scan' },
  { icon: 'import', label: 'Importa da link', path: '/import' },
  { icon: 'social', label: 'Battle', path: '/social' },
  { icon: 'share', label: 'Condividi look', path: '/share' },
  { icon: 'price', label: 'Prezzi', path: '/price-tracker' },
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
  imports: [CommonModule, RouterOutlet, RouterLink, PixelIconComponent],
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

  readonly clock = signal(formatClock(new Date()));
  readonly date = signal(formatDate(new Date()));

  private readonly content = viewChild<ElementRef<HTMLElement>>('content');

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
      this.playWindowOpen();
    });

    const tick = setInterval(() => {
      const now = new Date();
      this.clock.set(formatClock(now));
      this.date.set(formatDate(now));
    }, 15_000);
    inject(DestroyRef).onDestroy(() => clearInterval(tick));
  }

  isActive(path: string): boolean {
    return this.currentSegment() === path.replace('/', '');
  }

  /**
   * Unico momento "orchestrato" dell'app: a ogni cambio schermata la finestra
   * si apre a scatti (steps), come lo zoom-rect di Windows 9x. Web Animations
   * API invece di una classe CSS, cosi' si riavvia anche tra rotte consecutive.
   */
  private playWindowOpen(): void {
    const el = this.content()?.nativeElement;
    if (!el || typeof el.animate !== 'function') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const anim = el.animate(
      [
        { transform: 'scale(0.94) translateY(6px)', opacity: 0, clipPath: 'inset(0 0 60% 0)' },
        { transform: 'scale(1) translateY(0)', opacity: 1, clipPath: 'inset(0 0 0 0)' },
      ],
      { duration: 240, easing: 'steps(5, end)' },
    );
    // Se il browser sospende la timeline (tab in background, vedi nota su
    // eventCoalescing in app.config.ts) la finestra resterebbe a meta': un
    // timer la porta comunque allo stato finale.
    setTimeout(() => anim.finish(), 400);
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

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatClock(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
}
