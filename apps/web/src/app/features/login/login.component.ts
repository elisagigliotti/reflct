import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ApiError } from '../../core/auth/models';
import { Btn95Component } from '../../shared/ui/btn95/btn95.component';
import { WinTitleComponent } from '../../shared/ui/win-title/win-title.component';

/** login.exe — accedi. Schermata nuova, reskin retro-OS, non presente nell'handoff originale. */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, WinTitleComponent, Btn95Component],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  submit(): void {
    if (!this.email.trim() || !this.password) {
      this.error.set('Inserisci email e password');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.auth.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: () => this.router.navigate(['/feed']),
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const apiError = err.error as ApiError | undefined;
        this.error.set(apiError?.message ?? 'Credenziali non valide. Riprova.');
      },
    });
  }
}
