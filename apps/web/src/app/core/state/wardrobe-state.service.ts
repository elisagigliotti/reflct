import { Injectable, signal } from '@angular/core';
import { WARDROBE_FOLDERS } from '../../shared/data/mock-feed';
import { WardrobeFolder } from '../../shared/data/models';

/** Stato Armadio: cartelle + statistiche look/provati (i "salvati" arrivano da FeedStateService). */
@Injectable({ providedIn: 'root' })
export class WardrobeStateService {
  readonly folders = signal<WardrobeFolder[]>(WARDROBE_FOLDERS);
  readonly lookCount = signal<number>(7);
  readonly triedCount = signal<number>(42);
}
