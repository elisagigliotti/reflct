import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { BodyScanStateService } from '../../core/state/body-scan-state.service';
import { PixelIconComponent } from '../../shared/ui/pixel-icon/pixel-icon.component';
import { ThemeService } from '../../core/theme/theme.service';
import { Btn95Component } from '../../shared/ui/btn95/btn95.component';
import { StampComponent } from '../../shared/ui/stamp/stamp.component';
import { WinTitleComponent } from '../../shared/ui/win-title/win-title.component';

/**
 * Profilo / Io (profile.sys / measures.cfg / aspetto.cfg) — vedi
 * docs/design-reference/README.md sezione "4 · Io" + screenshot 04-io.png.
 * Dati REALI da GET/PATCH /api/v1/users/me (com.reflct.api.user), non piu' mock.
 * Le "stats" decorative del Concept v4.0 (provati/look/risparmiati) sono state
 * rimosse: non c'e' ancora un endpoint che le calcoli davvero.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, WinTitleComponent, StampComponent, Btn95Component, PixelIconComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  readonly user = this.auth.currentUser;
  readonly isPremium = computed(() => this.user()?.piano !== 'FREE');

  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);

  nomeDraft = '';
  cognomeDraft = '';
  usernameDraft = '';
  dataNascitaDraft = '';
  altezzaDraft: number | null = null;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    readonly theme: ThemeService,
    readonly scan: BodyScanStateService,
  ) {}

  startEdit(): void {
    const current = this.user();
    this.nomeDraft = current?.nome ?? '';
    this.cognomeDraft = current?.cognome ?? '';
    this.usernameDraft = current?.username ?? '';
    this.dataNascitaDraft = current?.dataNascita ?? '';
    this.altezzaDraft = current?.altezzaCm ?? null;
    this.saveError.set(null);
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  save(): void {
    this.saving.set(true);
    this.saveError.set(null);
    this.auth
      .updateMe({
        nome: this.nomeDraft.trim() || null,
        cognome: this.cognomeDraft.trim() || null,
        username: this.usernameDraft.trim() || null,
        dataNascita: this.dataNascitaDraft || null,
        altezzaCm: this.altezzaDraft,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.editing.set(false);
        },
        error: () => {
          this.saving.set(false);
          this.saveError.set('Salvataggio non riuscito. Riprova.');
        },
      });
  }

  toggleUnits(): void {
    const next = this.user()?.unitaMisura === 'cm' ? 'in' : 'cm';
    this.auth.updateMe({ unitaMisura: next }).subscribe();
  }

  redoScan(): void {
    this.router.navigate(['/scan']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
