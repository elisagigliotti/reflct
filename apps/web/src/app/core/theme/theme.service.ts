import { Injectable, effect, signal } from '@angular/core';

const THEME_KEY = 'reflct_theme';

export type ThemeId = 'y2k' | 'dark' | 'sunset' | 'doodle';

export interface ThemeOption {
  id: ThemeId;
  label: string;
  icon: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'y2k', label: 'Y2K Dream', icon: '🩷' },
  { id: 'dark', label: 'Notte Neon', icon: '🌙' },
  { id: 'sunset', label: 'Sunset Arcade', icon: '🌅' },
  { id: 'doodle', label: 'Poster Doodle', icon: '✦' },
];

const THEME_IDS = THEME_OPTIONS.map((t) => t.id);

/**
 * Tema grafico attivo (palette, forme, font e sfondo). Applica l'attributo `data-theme`
 * su <html>, letto dalle CSS custom properties --c-* in
 * packages/design-tokens/scss/_themes.scss. Persistito in localStorage.
 * Il mobile (rn/theme.ts) ha per ora solo le palette di y2k, dark e sunset.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly themeId = signal<ThemeId>(this.readSaved());
  readonly options = THEME_OPTIONS;

  constructor() {
    effect(() => {
      const id = this.themeId();
      if (id === 'y2k') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', id);
      }
      localStorage.setItem(THEME_KEY, id);
    });
  }

  setTheme(id: ThemeId): void {
    this.themeId.set(id);
  }

  private readSaved(): ThemeId {
    const saved = localStorage.getItem(THEME_KEY);
    return (THEME_IDS as string[]).includes(saved ?? '') ? (saved as ThemeId) : 'y2k';
  }
}
