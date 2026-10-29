import type { FeatResult } from '../types/profile'

/** Faits d'armes affichés sur le profil. */
export const FEATS_SHOWN = 5

export type FeatTone = 'gold' | 'silver' | 'bronze' | 'muted'

export const FEAT_LABELS: Record<FeatResult, { label: string; tone: FeatTone }> = {
  champion: { label: '1er', tone: 'gold' },
  final: { label: 'Finaliste', tone: 'silver' },
  semi: { label: 'Demi-finale', tone: 'bronze' },
  quarter: { label: 'Quart', tone: 'muted' },
}
