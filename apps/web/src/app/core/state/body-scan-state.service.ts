import { Injectable, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { BodyScanService } from '../bodyscan/body-scan.service';
import { BodyMeasures, BodyScanResponse } from '../bodyscan/models';

/**
 * Stato scan.exe — dati REALI: POST /api/v1/body-scan (delega ad ai-service
 * /bodyscan/estimate) e GET /api/v1/body-scan/me. Nessun upload foto reale in
 * questo scaffold (richiederebbe MinIO/storage): l'utente incolla l'URL della
 * foto, come gia' fatto per Import Link.
 */
@Injectable({ providedIn: 'root' })
export class BodyScanStateService {
  private readonly bodyScanService = inject(BodyScanService);
  private readonly authService = inject(AuthService);

  readonly fotoFrontUrl = signal<string>('');
  readonly fotoSideUrl = signal<string>('');
  readonly altezzaCm = signal<number | null>(null);

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly lastScan = signal<BodyScanResponse | null>(null);
  readonly checkingExisting = signal<boolean>(true);

  constructor() {
    this.altezzaCm.set(this.authService.currentUser()?.altezzaCm ?? null);
    this.bodyScanService.getMine().pipe(catchError(() => of(null))).subscribe((scan) => {
      this.lastScan.set(scan);
      this.checkingExisting.set(false);
    });
  }

  measures(): BodyMeasures | null {
    const scan = this.lastScan();
    if (!scan?.misureJson) {
      return null;
    }
    try {
      return JSON.parse(scan.misureJson) as BodyMeasures;
    } catch {
      return null;
    }
  }

  start(): void {
    const fotoFrontUrl = this.fotoFrontUrl().trim();
    const altezzaCm = this.altezzaCm();
    if (!fotoFrontUrl || !altezzaCm) {
      this.error.set('Inserisci la foto frontale e la tua altezza.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);

    this.bodyScanService
      .start({
        fotoFrontUrl,
        fotoSideUrl: this.fotoSideUrl().trim() || null,
        altezzaCm,
      })
      .subscribe({
        next: (scan) => {
          this.lastScan.set(scan);
          this.loading.set(false);
          this.authService.loadMe().subscribe();
        },
        error: () => {
          this.error.set('Scan non riuscito: il servizio AI non è raggiungibile o ha rifiutato la richiesta.');
          this.loading.set(false);
        },
      });
  }
}
