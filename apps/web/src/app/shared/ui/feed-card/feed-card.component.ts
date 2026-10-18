import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FeedItem } from '../../data/models';
import { ShotComponent } from '../shot/shot.component';
import { SizePillComponent } from '../size-pill/size-pill.component';
import { PixelIconComponent } from '../pixel-icon/pixel-icon.component';

/**
 * Card capo riusata in Feed (masonry), Armadio (salvati.lst), Import (preview),
 * Price Tracker e Trending. Mini-finestra ".win win--pop" con title bar file,
 * scatto dithered, badge taglia + like sovrapposti, info prezzo/fit.
 * Rispecchia il markup di Reflct App.dc.html (sezione "FINESTRA GUARDAROBA / FEED").
 */
@Component({
  selector: 'app-feed-card',
  standalone: true,
  imports: [CommonModule, ShotComponent, SizePillComponent, PixelIconComponent],
  templateUrl: './feed-card.component.html',
  styleUrl: './feed-card.component.scss',
})
export class FeedCardComponent {
  @Input({ required: true }) item!: FeedItem;
  @Input() liked = false;
  /** mostra il badge taglia + prezzo scontato ecc. (disattivabile per varianti compatte) */
  @Input() showPriceDrop = true;
  @Output() open = new EventEmitter<string | number>();
  @Output() like = new EventEmitter<string | number>();

  get fileLabel(): string {
    return this.item.shotLabel.toLowerCase().replace('.bmp', '');
  }

  get isDropped(): boolean {
    return this.showPriceDrop && !!this.item.old;
  }

  get likeLabel(): string {
    return this.liked ? 'Rimuovi dai salvati' : "Salva nell'armadio";
  }

  /** Riavvia l'animazione "pop" del cuore solo quando l'utente mette like (non al caricamento). */
  popTick = 0;

  onOpen(): void {
    this.open.emit(this.item.id);
  }

  onLike(evt: Event): void {
    evt.stopPropagation();
    if (!this.liked) this.popTick++;
    this.like.emit(this.item.id);
  }
}
