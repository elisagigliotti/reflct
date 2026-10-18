import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  signal,
} from '@angular/core';
import { Btn95Component } from '../btn95/btn95.component';

type FacingMode = 'user' | 'environment';

/**
 * Cattura foto da webcam via getUserMedia (body-scan, try-on). Stile retro-OS:
 * riquadro guida tratteggiato + scatto stile otturatore. Equivalente web di
 * apps/mobile/src/ui/CameraCapture.tsx (expo-camera).
 */
@Component({
  selector: 'app-camera-capture',
  standalone: true,
  imports: [CommonModule, Btn95Component],
  templateUrl: './camera-capture.component.html',
  styleUrl: './camera-capture.component.scss',
})
export class CameraCaptureComponent implements OnInit, OnDestroy {
  @Input() guideLabel = '';
  @Input() facingDefault: FacingMode = 'user';
  @Output() capture = new EventEmitter<Blob>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('video') videoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  readonly status = signal<'idle' | 'starting' | 'ready' | 'denied' | 'unavailable'>('idle');
  readonly taking = signal(false);
  private facing: FacingMode = this.facingDefault;
  private stream: MediaStream | null = null;

  ngOnInit(): void {
    this.facing = this.facingDefault;
    void this.startStream();
  }

  ngOnDestroy(): void {
    this.stopStream();
  }

  async startStream(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.status.set('unavailable');
      return;
    }
    this.status.set('starting');
    this.stopStream();
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: this.facing },
        audio: false,
      });
      if (this.videoRef) {
        this.videoRef.nativeElement.srcObject = this.stream;
        await this.videoRef.nativeElement.play();
      }
      this.status.set('ready');
    } catch {
      this.status.set('denied');
    }
  }

  toggleFacing(): void {
    this.facing = this.facing === 'user' ? 'environment' : 'user';
    void this.startStream();
  }

  takePicture(): void {
    if (this.taking() || !this.videoRef || !this.canvasRef || this.status() !== 'ready') {
      return;
    }
    this.taking.set(true);
    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.taking.set(false);
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        this.taking.set(false);
        if (blob) {
          this.capture.emit(blob);
        }
      },
      'image/jpeg',
      0.88,
    );
  }

  onCancel(): void {
    this.stopStream();
    this.cancel.emit();
  }

  private stopStream(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }
}
