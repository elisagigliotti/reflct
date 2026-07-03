import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'feed', pathMatch: 'full' },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./features/onboarding/onboarding.component').then((m) => m.OnboardingComponent),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'feed',
    canActivate: [authGuard],
    loadComponent: () => import('./features/feed/feed.component').then((m) => m.FeedComponent),
  },
  {
    path: 'prova',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tryon/tryon.component').then((m) => m.TryonComponent),
  },
  {
    path: 'prova/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tryon/tryon.component').then((m) => m.TryonComponent),
  },
  {
    path: 'armadio',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/wardrobe/wardrobe.component').then((m) => m.WardrobeComponent),
  },
  {
    path: 'io',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'import',
    canActivate: [authGuard],
    loadComponent: () => import('./features/import/import.component').then((m) => m.ImportComponent),
  },
  {
    path: 'social',
    canActivate: [authGuard],
    loadComponent: () => import('./features/social/social.component').then((m) => m.SocialComponent),
  },
  {
    path: 'share',
    canActivate: [authGuard],
    loadComponent: () => import('./features/share/share.component').then((m) => m.ShareComponent),
  },
  {
    path: 'share/:itemId',
    canActivate: [authGuard],
    loadComponent: () => import('./features/share/share.component').then((m) => m.ShareComponent),
  },
  {
    path: 'scan',
    canActivate: [authGuard],
    loadComponent: () => import('./features/scan/scan.component').then((m) => m.ScanComponent),
  },
  {
    path: 'price-tracker',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/price-tracker/price-tracker.component').then(
        (m) => m.PriceTrackerComponent,
      ),
  },
  { path: '**', redirectTo: 'feed' },
];
