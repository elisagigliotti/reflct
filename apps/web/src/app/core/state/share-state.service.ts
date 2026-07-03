import { Injectable, inject, signal } from '@angular/core';
import { ShareService } from '../share/share.service';
import { TipoSharedLink } from '../share/models';
import { TryOnService } from '../tryon/tryon.service';
import { FeedStateService } from './feed-state.service';
import { FeedItem, ShareLinkOption } from '../../shared/data/models';

const OPTIONS: (ShareLinkOption & { tipo: TipoSharedLink })[] = [
  { id: 'permanent', label: 'Link permanente', tipo: 'PERMANENT' },
  { id: '24h', label: 'Link 24h', tipo: 'H24' },
  { id: '7d', label: 'Link 7gg', tipo: 'D7' },
  { id: '30d', label: 'Link 30gg', tipo: 'D30' },
  { id: 'pin', label: 'Link con PIN', tipo: 'PIN_PROTECTED' },
];

/**
 * Stato share.exe — dati REALI: crea una sessione try-on (POST /api/v1/tryon/start,
 * necessaria perche' SharedLink referenzia un TryOnSession, Concept v4.0 sez. 5.6)
 * per il capo corrente, poi genera un link reale (POST /api/v1/share). Nessuna
 * foto/AR reale in questo scaffold: la sessione usa un URL segnaposto, coerente
 * con l'assenza di camera reale gia' documentata in Prova.
 */
@Injectable({ providedIn: 'root' })
export class ShareStateService {
  private readonly shareService = inject(ShareService);
  private readonly tryOnService = inject(TryOnService);
  private readonly feed = inject(FeedStateService);

  readonly options = OPTIONS;
  readonly item = signal<FeedItem | null>(null);
  readonly selected = signal<string>('permanent');
  readonly copied = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly pin = signal<string | null>(null);
  readonly generatedUrl = signal<string | null>(null);

  private sessionId: string | null = null;

  init(itemId: string): void {
    const item = this.feed.getItem(itemId) ?? null;
    this.item.set(item);
    this.copied.set(false);

    if (!item) {
      this.error.set('Capo non trovato. Torna al feed e riprova da lì.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.tryOnService
      .start({ garmentId: String(item.id), fotoUrl: 'https://reflct.app/placeholder/avatar.jpg' })
      .subscribe({
        next: (session) => {
          this.sessionId = session.id;
          this.createLink();
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Impossibile avviare la sessione di prova per questo capo.');
        },
      });
  }

  select(id: string): void {
    this.selected.set(id);
    this.copied.set(false);
    this.createLink();
  }

  copy(): void {
    this.copied.set(true);
  }

  private createLink(): void {
    if (!this.sessionId) {
      return;
    }
    const tipo = this.options.find((o) => o.id === this.selected())?.tipo ?? 'PERMANENT';
    this.loading.set(true);
    this.error.set(null);
    this.shareService.createLink({ sessionId: this.sessionId, tipo }).subscribe({
      next: (link) => {
        this.generatedUrl.set(`reflct.app/l/${link.token}`);
        this.pin.set(link.pinInChiaro);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Impossibile generare il link di condivisione.');
      },
    });
  }
}
