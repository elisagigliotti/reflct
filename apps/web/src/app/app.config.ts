import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { AuthService } from './core/auth/auth.service';
import { ThemeService } from './core/theme/theme.service';
import { isDevMode } from '@angular/core';

function restoreSessionInitializer(auth: AuthService) {
  return () => firstValueFrom(auth.restoreSession());
}

// L'iniezione da sola basta a innescare l'effect() del costruttore di
// ThemeService, che applica subito l'attributo data-theme salvato
// (evita un flash del tema y2k prima che l'utente visiti il profilo).
function themeInitializer(theme: ThemeService) {
  return () => {
    void theme;
  };
}

export const appConfig: ApplicationConfig = {
  // eventCoalescing:false (default): la CD scatta subito dopo ogni task zone-patchato
  // via microtask, invece di essere raggruppata su requestAnimationFrame. Con
  // eventCoalescing:true, i tick sono schedulati su rAF, che i browser sospendono
  // quando la tab e' in background (document.visibilityState === 'hidden') — su
  // una tab non focalizzata la UI resta "congelata" alla sola creazione iniziale
  // delle view, senza mai applicare gli aggiornamenti (interpolazioni, @if, @for).
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: restoreSessionInitializer,
      deps: [AuthService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: themeInitializer,
      deps: [ThemeService],
      multi: true,
    },
  ],
};
