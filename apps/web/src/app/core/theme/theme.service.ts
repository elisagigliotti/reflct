import { Injectable, effect, signal } from '@angular/core';

const THEME_KEY = 'reflct_theme';

export type ThemeId = 'y2k' | 'dark' | 'sunset' | 'mono';

export interface ThemeOption {
  id: ThemeId;
  label: string;
  icon: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'y2k', label: 'Y2K Dream', icon: '🩷' },
  { id: 'dark', label: 'Notte Neon', icon: '🌙' },
  { id: 'sunset', label: 'Sunset Arcade', icon: '🌅' },
  { id: 'mono', label: 'Mono CRT', icon: '🟢' },
];

const THEME_IDS = THEME_OPTIONS.map((t) => t.id);

/**
 * Tema grafico attivo (palette colore). Applica l'attributo `data-theme`
 * su <html>, letto dalle CSS custom properties --c-* in
 * packages/design-tokens/scss/_themes.scss. Persistito in localStorage.
 * Stesse 4 palette del mobile (rn/theme.ts) — tenerle allineate.
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
