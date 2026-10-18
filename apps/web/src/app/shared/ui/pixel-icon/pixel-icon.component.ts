import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';

/**
 * Icone pixel-art 12x12 disegnate a griglia (una stringa per riga).
 * Legenda: '#' = ink (contorno), 'a' = accento primario, 'b' = accento secondario,
 * 'w' = riempimento finestra, '.' = trasparente.
 * Sostituiscono le emoji della taskbar/start menu, che cambiano aspetto da
 * sistema a sistema e rompono il look pixel dell'handoff.
 */
const ICONS = {
  feed: [
    '############',
    '#aaaaaaaaaa#',
    '#a........a#',
    '#a.ww..ww.a#',
    '#a.ww..ww.a#',
    '#a........a#',
    '#a.ww..ww.a#',
    '#aaaaaaaaaa#',
    '############',
    '....####....',
    '..########..',
    '............',
  ],
  prova: [
    '...######...',
    '..#wwwwww#..',
    '.#ww....bw#.',
    '.#w....b.w#.',
    '.#w...b..w#.',
    '.#w......w#.',
    '.#w......w#.',
    '.#ww....ww#.',
    '..#wwwwww#..',
    '...######...',
    '.....##.....',
    '...######...',
  ],
  armadio: [
    '############',
    '#aaaaa#aaaa#',
    '#a...a#a..a#',
    '#a...a#a..a#',
    '#a..#a#a#.a#',
    '#a...a#a..a#',
    '#a...a#a..a#',
    '#a...a#a..a#',
    '#aaaaa#aaaa#',
    '############',
    '.##......##.',
    '............',
  ],
  io: [
    '##########..',
    '#a#wwww#a##.',
    '#a#wwww#aa##',
    '#a#ww#w#aaa#',
    '#a######aaa#',
    '#aaaaaaaaaa#',
    '#a########a#',
    '#a#wwwwww#a#',
    '#a#w####w#a#',
    '#a#wwwwww#a#',
    '############',
    '............',
  ],
  scan: [
    '.....#......',
    '.....#......',
    '....#a#.....',
    '##.#aaa#.##.',
    '..#aaaaa#...',
    '...#aaa#....',
    '..#a#.#a#...',
    '..#.....#.b.',
    '.........bbb',
    '..........b.',
    '............',
    '............',
  ],
  import: [
    '............',
    '..####......',
    '.#aaaa#.....',
    '#aa##aa#....',
    '#a#..#a#....',
    '#aa#.##.....',
    '.#a####a#...',
    '.....#.#aa#.',
    '....#aa#.#a#',
    '....#aa##aa#',
    '.....#aaaa#.',
    '......####..',
  ],
  social: [
    '#.........#.',
    '#a#.....#a#.',
    '.#a#...#a#..',
    '..#a#.#a#...',
    '...#a#a#....',
    '....#b#.....',
    '...#a#a#....',
    '..#b#.#b#...',
    '.#b#...#b#..',
    '##.......##.',
    '............',
    '............',
  ],
  share: [
    '.....#......',
    '....#a#.....',
    '...#aaa#....',
    '..#aaaaa#...',
    '.####a####..',
    '....#a#.....',
    '....#a#.....',
    '#...#a#...#.',
    '#.........#.',
    '#wwwwwwwww#.',
    '###########.',
    '............',
  ],
  price: [
    '......#####.',
    '.....#aaaa#.',
    '....#aaa#a#.',
    '...#aaaaaa#.',
    '..#aaaaaa#..',
    '.#aaaaaa#...',
    '#aaaaaa#....',
    '#aaaaa#.....',
    '.#aaa#......',
    '..#a#.......',
    '...#........',
    '............',
  ],
  heart: [
    '............',
    '.###...###..',
    '#aaa#.#aaa#.',
    '#aaaa#aaaa#.',
    '#aaaaaaaaa#.',
    '#aaaaaaaaa#.',
    '.#aaaaaaa#..',
    '..#aaaaa#...',
    '...#aaa#....',
    '....#a#.....',
    '.....#......',
    '............',
  ],
  heartEmpty: [
    '............',
    '.###...###..',
    '#...#.#...#.',
    '#....#....#.',
    '#.........#.',
    '#.........#.',
    '.#.......#..',
    '..#.....#...',
    '...#...#....',
    '....#.#.....',
    '.....#......',
    '............',
  ],
  camera: [
    '............',
    '...####.....',
    '###wwww#####',
    '#aaaaaaaaaa#',
    '#aaa####aaa#',
    '#aa#bbbb#aa#',
    '#aa#bwbb#aa#',
    '#aa#bbbb#aa#',
    '#aaa####aaa#',
    '#aaaaaaaaaa#',
    '############',
    '............',
  ],
  rotate: [
    '....####....',
    '..##aaaa##..',
    '.#aa....aa#.',
    '.#a......#..',
    '#a..........',
    '#a.......#..',
    '#a......#a#.',
    '.#a....#aaa#',
    '.#aa.....#..',
    '..##aaaa#...',
    '....####....',
    '............',
  ],
  fire: [
    '.....#......',
    '....#a#.....',
    '....#aa#....',
    '...#aaa#.#..',
    '..#aaaaa#a#.',
    '.#aaabaaaa#.',
    '.#aabbbaaa#.',
    '#aabbwbbaaa#',
    '#aabwwwbaa#.',
    '.#abwwwba#..',
    '..#######...',
    '............',
  ],
  meh: [
    '...######...',
    '..#wwwwww#..',
    '.#wwwwwwww#.',
    '#ww#wwww#ww#',
    '#ww#wwww#ww#',
    '#wwwwwwwwww#',
    '#wwwwwwwwww#',
    '#ww######ww#',
    '.#wwwwwwww#.',
    '..#wwwwww#..',
    '...######...',
    '............',
  ],
  skip: [
    '............',
    '#....#....#.',
    '##...##...#.',
    '#a#..#a#..#.',
    '#aa#.#aa#.#.',
    '#aaa##aaa##.',
    '#aa#.#aa#.#.',
    '#a#..#a#..#.',
    '##...##...#.',
    '#....#....#.',
    '............',
    '............',
  ],
  power: [
    '.....##.....',
    '.....##.....',
    '..##.##.##..',
    '.##..##..##.',
    '##...##...##',
    '##........##',
    '##........##',
    '.##......##.',
    '..########..',
    '....####....',
    '............',
    '............',
  ],
} as const;

export type PixelIconName = keyof typeof ICONS;

const FILL: Record<string, string> = {
  '#': 'var(--px-ink, var(--c-ink, #2A2438))',
  a: 'var(--px-a, var(--c-pink, #FF5FA2))',
  b: 'var(--px-b, var(--c-cyan, #4FD3E6))',
  w: 'var(--px-w, var(--c-win, #FBDCE8))',
};

interface Px {
  x: number;
  y: number;
  fill: string;
}

@Component({
  selector: 'app-pixel-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 12 12"
      shape-rendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      @for (p of pixels(); track $index) {
        <rect [attr.x]="p.x" [attr.y]="p.y" width="1" height="1" [attr.fill]="p.fill" />
      }
    </svg>
  `,
  styles: [':host { display: inline-flex; line-height: 0; } svg { display: block; }'],
})
export class PixelIconComponent {
  private readonly iconName = signal<PixelIconName>('feed');

  @Input({ required: true }) set name(value: PixelIconName) {
    this.iconName.set(value);
  }

  /** Lato in px: multipli di 12 tengono i pixel netti. */
  @Input() size = 24;

  readonly pixels = computed<Px[]>(() => {
    const out: Px[] = [];
    ICONS[this.iconName()].forEach((row, y) => {
      [...row].forEach((ch, x) => {
        const fill = FILL[ch];
        if (fill) out.push({ x, y, fill });
      });
    });
    return out;
  });
}
