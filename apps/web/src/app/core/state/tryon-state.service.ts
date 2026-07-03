import { Injectable, signal } from '@angular/core';

/** Stato schermata Prova: taglia/colore selezionati, rotazione avatar (placeholder). */
@Injectable({ providedIn: 'root' })
export class TryonStateService {
  readonly trySize = signal<string>('M');
  readonly tryColor = signal<number>(0);
  readonly rotated = signal<boolean>(false);

  readonly sizes: string[] = ['XS', 'S', 'M', 'L', 'XL'];
  readonly colors: string[] = ['#FF5FA2', '#4FD3E6', '#2FAF8E', '#F5D14E', '#C6A5F2'];

  setSize(size: string): void {
    this.trySize.set(size);
  }

  setColor(index: number): void {
    this.tryColor.set(index);
  }

  toggleRotate(): void {
    this.rotated.update((v) => !v);
  }
}
