import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, of, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { MediaService } from '../media/media.service';
import { BodyScanService } from '../bodyscan/body-scan.service';
import { BodyMeasures, BodyScanResponse } from '../bodyscan/models';

/**
 * Stato scan.exe — dati REALI: upload foto (com.reflct.api.media) poi
 * POST /api/v1/body-scan (delega ad ai-service /bodyscan/estimate) e
 * GET /api/v1/body-scan/me. Il flusso principale e' la fotocamera
 * (CameraCaptureComponent); l'URL manuale resta come fallback/debug.
 */
const MEASURE_LABELS: Record<string, string> = {
  busto_cm: 'busto',
  vita_cm: 'vita',
  fianchi_cm: 'fianchi',
  spalle_cm: 'spalle',
  torso_cm: 'torso',
  inseam_cm: 'cavallo',
  manica_cm: 'manica',
};

@Injectable({ providedIn: 'root' })
export class BodyScanStateService {
  private readonly bodyScanService = inject(BodyScanService);
  private readonly authService = inject(AuthService);
  private readonly mediaService = inject(MediaService);

  readonly fotoFrontUrl = signal<string>('');
  readonly fotoSideUrl = signal<string>('');
  readonly altezzaCm = signal<number | null>(null);

  readonly loading = signal<boolean>(false);
  readonly uploading = signal<boolean>(false);
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

  /** Misure dell'ultimo scan come coppie [etichetta, cm], nell'ordine in cui le mostriamo. */
  readonly measureEntries = computed<[string, number][]>(() => {
    const measures = this.measures() as Record<string, number> | null;
    if (!measures) {
      return [];
    }
    return Object.entries(MEASURE_LABELS)
      .filter(([key]) => typeof measures[key] === 'number')
      .map(([key, label]) => [label, Math.round(measures[key])]);
  });

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

  /** Carica la foto scattata con la fotocamera, poi avvia lo scan con l'URL ottenuto. */
  startWithBlob(blob: Blob): void {
    const altezzaCm = this.altezzaCm();
    if (!altezzaCm) {
      this.error.set('Inserisci la tua altezza prima di scattare la foto.');
      return;
    }
    this.loading.set(true);
    this.uploading.set(true);
    this.error.set(null);

    this.mediaService
      .uploadImage(blob)
      .pipe(
        switchMap((url) => {
          this.uploading.set(false);
          this.fotoFrontUrl.set(url);
          return this.bodyScanService.start({
            fotoFrontUrl: url,
            fotoSideUrl: this.fotoSideUrl().trim() || null,
            altezzaCm,
          });
        }),
        catchError((err) => {
          const failedDuringUpload = this.uploading();
          this.uploading.set(false);
          this.loading.set(false);
          this.error.set(
            failedDuringUpload
              ? 'Upload della foto non riuscito.'
              : 'Scan non riuscito: il servizio AI non è raggiungibile o ha rifiutato la richiesta.',
          );
          return throwError(() => err);
        }),
      )
      .subscribe({
        next: (scan) => {
          this.lastScan.set(scan);
          this.loading.set(false);
          this.authService.loadMe().subscribe();
        },
        error: () => {
          // gestito nel catchError sopra
        },
      });
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
