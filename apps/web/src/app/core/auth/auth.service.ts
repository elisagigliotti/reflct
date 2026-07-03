import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateUserRequest,
  UserResponse,
} from './models';

const TOKEN_KEY = 'reflct_token';

/**
 * Auth reale contro backend/api (com.reflct.api.auth / com.reflct.api.user).
 * Token JWT persistito in localStorage; `currentUser` alimenta la schermata Io.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly currentUser = signal<UserResponse | null>(null);
  readonly isAuthenticated = computed(() => !!this.token());
  /** true dopo il primo tentativo di ripristino sessione (vedi provideAppInitializer in app.config.ts). */
  readonly ready = signal(false);

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, request).pipe(
      tap((res) => this.setToken(res.token)),
      switchMap((res) => this.loadMe().pipe(map(() => res))),
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap((res) => this.setToken(res.token)),
      switchMap((res) => this.loadMe().pipe(map(() => res))),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
    this.currentUser.set(null);
  }

  loadMe(): Observable<UserResponse> {
    return this.http
      .get<UserResponse>(`${environment.apiUrl}/users/me`)
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  updateMe(request: UpdateUserRequest): Observable<UserResponse> {
    return this.http
      .patch<UserResponse>(`${environment.apiUrl}/users/me`, request)
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  /** Chiamato una volta al bootstrap (vedi provideAppInitializer): se c'e' un token salvato,
   *  prova a caricare il profilo; se il token non e' piu' valido, effettua il logout. */
  restoreSession(): Observable<unknown> {
    if (!this.token()) {
      this.ready.set(true);
      return of(null);
    }
    return this.loadMe().pipe(
      catchError(() => {
        this.logout();
        return of(null);
      }),
      tap(() => this.ready.set(true)),
    );
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.token.set(token);
  }
}
