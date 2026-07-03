import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ApiError } from '../../core/auth/models';
import { Btn95Component } from '../../shared/ui/btn95/btn95.component';
import { WinTitleComponent } from '../../shared/ui/win-title/win-title.component';

/** register.exe — crea account. Schermata nuova, reskin retro-OS. */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, WinTitleComponent, Btn95Component],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  nome = '';
  cognome = '';
  username = '';
  email = '';
  password = '';
  dataNascita = '';
  altezzaCm: number | null = null;
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  submit(): void {
    if (
      !this.nome.trim() ||
      !this.cognome.trim() ||
      !this.username.trim() ||
      !this.email.trim() ||
      !this.password ||
      !this.dataNascita
    ) {
      this.error.set('Compila nome, cognome, username, data di nascita, email e password');
      return;
    }
    if (this.password.length < 8) {
      this.error.set('La password deve avere almeno 8 caratteri');
      return;
    }
    if (!/^[a-zA-Z0-9._]+$/.test(this.username.trim())) {
      this.error.set('Username: solo lettere, numeri, punto e underscore');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.auth
      .register({
        nome: this.nome.trim(),
        cognome: this.cognome.trim(),
        username: this.username.trim(),
        email: this.email.trim(),
        password: this.password,
        dataNascita: this.dataNascita,
        altezzaCm: this.altezzaCm,
      })
      .subscribe({
        next: () => this.router.navigate(['/feed']),
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          const apiError = err.error as ApiError | undefined;
          this.error.set(apiError?.message ?? 'Registrazione non riuscita. Riprova.');
        },
      });
  }
}
