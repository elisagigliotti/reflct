import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BodyScanStateService } from '../../core/state/body-scan-state.service';
import { Btn95Component } from '../../shared/ui/btn95/btn95.component';
import { PixelIconComponent } from '../../shared/ui/pixel-icon/pixel-icon.component';
import { WinTitleComponent } from '../../shared/ui/win-title/win-title.component';
import { CameraCaptureComponent } from '../../shared/ui/camera-capture/camera-capture.component';

/**
 * Body Scan (scan.exe) — reskin retro-OS (Concept v4.0 sez. 5.3). Dati REALI:
 * upload foto via com.reflct.api.media, poi POST /api/v1/body-scan → ai-service.
 * Flusso principale: fotocamera (getUserMedia). Resta un fallback a incollare
 * un URL manualmente, per debug o browser senza supporto webcam.
 */
@Component({
  selector: 'app-scan',
  standalone: true,
  imports: [CommonModule, WinTitleComponent, Btn95Component, PixelIconComponent, CameraCaptureComponent],
  templateUrl: './scan.component.html',
  styleUrl: './scan.component.scss',
})
export class ScanComponent {
  readonly showCamera = signal(false);
  readonly showManual = signal(false);
  readonly capturedPreviewUrl = signal<string | null>(null);
  private capturedBlob: Blob | null = null;

  constructor(
    readonly state: BodyScanStateService,
    private readonly router: Router,
  ) {}

  onFrontUrlChange(value: string): void {
    this.state.fotoFrontUrl.set(value);
  }

  onSideUrlChange(value: string): void {
    this.state.fotoSideUrl.set(value);
  }

  onAltezzaChange(value: string): void {
    const parsed = Number(value);
    this.state.altezzaCm.set(Number.isFinite(parsed) && parsed > 0 ? parsed : null);
  }

  openCamera(): void {
    if (!this.state.altezzaCm()) {
      this.state.error.set('Inserisci prima la tua altezza.');
      return;
    }
    this.showCamera.set(true);
  }

  onCaptured(blob: Blob): void {
    this.capturedBlob = blob;
    if (this.capturedPreviewUrl()) {
      URL.revokeObjectURL(this.capturedPreviewUrl()!);
    }
    this.capturedPreviewUrl.set(URL.createObjectURL(blob));
    this.showCamera.set(false);
  }

  retake(): void {
    this.capturedBlob = null;
    if (this.capturedPreviewUrl()) {
      URL.revokeObjectURL(this.capturedPreviewUrl()!);
    }
    this.capturedPreviewUrl.set(null);
    this.showCamera.set(true);
  }

  confirmAndAnalyze(): void {
    if (!this.capturedBlob) {
      return;
    }
    this.state.startWithBlob(this.capturedBlob);
  }

  goToFeed(): void {
    this.router.navigate(['/feed']);
  }
}
