/**
 * Reflct mobile — wrapper del design system condiviso.
 * Fonte di verita' unica: packages/design-tokens/rn/theme.ts
 * Qui si re-esportano i token grezzi e si aggiungono helper RN-only
 * (es. buildShadow per simulare box-shadow offset-solido con una View).
 */
import {
  colors,
  fonts,
  borders,
  shadowOffsets,
  motion,
  spacing,
  collage,
  nav,
} from '../../../../packages/design-tokens/rn/theme';

export { colors, fonts, borders, shadowOffsets, motion, spacing, collage, nav };
export type { ReflctColor } from '../../../../packages/design-tokens/rn/theme';

/**
 * Genera lo style per una "View ombra" posizionata assoluta dietro al
 * contenuto: bordo identico, traslata di (x,y) in basso a destra, colore
 * ink, z-index/elevation inferiore. Niente shadowOpacity/blur/elevation
 * sfumata: il design system vieta ombre sfumate.
 */
export function shadowLayerStyle(offset: { x: number; y: number } = shadowOffsets.window, radius = borders.radius.window) {
  return {
    position: 'absolute' as const,
    top: offset.y,
    left: offset.x,
    right: -offset.x,
    bottom: -offset.y,
    backgroundColor: colors.ink,
    borderRadius: radius,
  };
}
