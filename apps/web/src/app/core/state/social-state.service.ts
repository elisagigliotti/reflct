import { Injectable, computed, inject, signal } from '@angular/core';
import { SocialService } from '../social/social.service';
import { SocialPostResponse, TipoSocialPost } from '../social/models';
import { TryOnService } from '../tryon/tryon.service';
import { FeedStateService } from './feed-state.service';
import { toFeedItem } from '../../shared/data/garment-visuals';

export type SocialTab = 'Rate' | 'Battle' | 'Trending';

interface RatePostView {
  post: SocialPostResponse;
  shotColor: string;
  shotLabel: string;
  voti: { fire: number; meh: number; skip: number };
}

interface BattlePostView {
  post: SocialPostResponse;
  shotColor: string;
  shotLabel: string;
  voti: { a: number; b: number };
  percentA: number;
  percentB: number;
}

/**
 * Stato battle.net — social: dati REALI da com.reflct.api.social (GET /social/posts,
 * POST /social/post, POST /social/vote). Ogni post referenzia una TryOnSession
 * (creata al volo, vedi ShareStateService per lo stesso pattern), quindi "postare"
 * un capo crea prima una sessione poi il post. Il modello dati backend rappresenta
 * un BATTLE come un singolo post con due opzioni di voto generiche "a"/"b" (non
 * due capi affiancati con foto separate) — la UI riflette questo invece di
 * inventare un secondo capo che il backend non traccia.
 */
@Injectable({ providedIn: 'root' })
export class SocialStateService {
  private readonly socialService = inject(SocialService);
  private readonly tryOnService = inject(TryOnService);
  private readonly feed = inject(FeedStateService);

  readonly tab = signal<SocialTab>('Rate');

  readonly ratePosts = signal<RatePostView[]>([]);
  readonly battlePosts = signal<BattlePostView[]>([]);
  readonly votedPostIds = signal<Set<string>>(new Set());

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly posting = signal(false);

  readonly trending = computed(() => this.feed.items());

  constructor() {
    this.reload('RATE');
  }

  setTab(tab: SocialTab): void {
    this.tab.set(tab);
    if (tab === 'Rate') {
      this.reload('RATE');
    } else if (tab === 'Battle') {
      this.reload('BATTLE');
    }
  }

  reload(tipo: TipoSocialPost): void {
    this.loading.set(true);
    this.error.set(null);
    this.socialService.list(tipo).subscribe({
      next: (posts) => {
        if (tipo === 'RATE') {
          this.ratePosts.set(posts.map((p) => this.toRateView(p)));
        } else {
          this.battlePosts.set(posts.map((p) => this.toBattleView(p)));
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossibile caricare i post. Riprova più tardi.');
        this.loading.set(false);
      },
    });
  }

  /** Posta un capo casuale del feed reale per il rating/battle corrente. */
  postRandomFromFeed(tipo: TipoSocialPost): void {
    const items = this.feed.items();
    if (items.length === 0) {
      this.error.set('Nessun capo disponibile da postare.');
      return;
    }
    const item = items[Math.floor(Math.random() * items.length)];
    this.posting.set(true);
    this.error.set(null);
    this.tryOnService
      .start({ garmentId: String(item.id), fotoUrl: 'https://reflct.app/placeholder/avatar.jpg' })
      .subscribe({
        next: (session) => {
          this.socialService.createPost({ sessionId: session.id, tipo }).subscribe({
            next: () => {
              this.posting.set(false);
              this.reload(tipo);
            },
            error: () => {
              this.posting.set(false);
              this.error.set('Impossibile creare il post.');
            },
          });
        },
        error: () => {
          this.posting.set(false);
          this.error.set('Impossibile avviare la sessione di prova per questo capo.');
        },
      });
  }

  rate(postId: string, kind: 'fire' | 'meh' | 'skip'): void {
    if (this.votedPostIds().has(postId)) {
      return;
    }
    this.socialService.vote({ postId, opzione: kind }).subscribe({
      next: (updated) => {
        this.votedPostIds.update((s) => new Set(s).add(postId));
        this.ratePosts.update((list) => list.map((v) => (v.post.id === postId ? this.toRateView(updated) : v)));
      },
    });
  }

  vote(postId: string, side: 'a' | 'b'): void {
    if (this.votedPostIds().has(postId)) {
      return;
    }
    this.socialService.vote({ postId, opzione: side }).subscribe({
      next: (updated) => {
        this.votedPostIds.update((s) => new Set(s).add(postId));
        this.battlePosts.update((list) => list.map((v) => (v.post.id === postId ? this.toBattleView(updated) : v)));
      },
    });
  }

  hasVoted(postId: string): boolean {
    return this.votedPostIds().has(postId);
  }

  private toRateView(post: SocialPostResponse): RatePostView {
    const feedItem = toFeedItem({
      id: post.garmentId,
      nome: post.garmentNome,
      brand: '',
      urlOriginale: '',
      categoria: null,
      prezzoAttuale: null,
      prezzoStoricoJson: null,
      fotoFrontUrl: null,
      fotoBackUrl: null,
      misureTaglieJson: null,
      sourceDomain: null,
      createdAt: post.createdAt,
      prezzoPrecedente: null,
      preferito: false,
    });
    const voti = this.parseVoti(post.votiJson);
    return {
      post,
      shotColor: feedItem.shotColor,
      shotLabel: feedItem.shotLabel,
      voti: { fire: voti['fire'] ?? 0, meh: voti['meh'] ?? 0, skip: voti['skip'] ?? 0 },
    };
  }

  private toBattleView(post: SocialPostResponse): BattlePostView {
    const feedItem = toFeedItem({
      id: post.garmentId,
      nome: post.garmentNome,
      brand: '',
      urlOriginale: '',
      categoria: null,
      prezzoAttuale: null,
      prezzoStoricoJson: null,
      fotoFrontUrl: null,
      fotoBackUrl: null,
      misureTaglieJson: null,
      sourceDomain: null,
      createdAt: post.createdAt,
      prezzoPrecedente: null,
      preferito: false,
    });
    const voti = this.parseVoti(post.votiJson);
    const a = voti['a'] ?? 0;
    const b = voti['b'] ?? 0;
    const total = a + b || 1;
    return {
      post,
      shotColor: feedItem.shotColor,
      shotLabel: feedItem.shotLabel,
      voti: { a, b },
      percentA: Math.round((a / total) * 100),
      percentB: Math.round((b / total) * 100),
    };
  }

  private parseVoti(json: string): Record<string, number> {
    try {
      return JSON.parse(json);
    } catch {
      return {};
    }
  }
}
