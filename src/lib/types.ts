import type { CategoryKey } from './item-classes.js';

export type SourceKey = 'exarch' | 'eater';

export type SlotKey = 'gloves' | 'boots' | 'helmet' | 'body_armour' | 'amulet';

export type VariantKey = 'base' | 'unique' | 'pinnacle';

/** One tier of a modifier in one of its presence variants. */
export interface TierEntry {
  tier: number;
  level: number;
  text: string;
  /** Spawn weight per equipment slot; absent slots cannot roll this tier. */
  weights: Partial<Record<SlotKey, number>>;
}

/** A modifier with all of its tiers, grouped across variants. */
export interface ModGroup {
  /** Unique key, `source:id`. */
  key: string;
  /** poedb/internal mod id without the tier suffix. */
  id: string;
  /** Display name with numeric values replaced by `#`. */
  name: string;
  source: SourceKey;
  tags: string[];
  slots: SlotKey[];
  tierCount: number;
  tierRange: [number, number];
  tiers: Partial<Record<VariantKey, TierEntry[]>>;
}

export interface Dataset {
  generatedAt: string;
  source: string;
  slots: SlotKey[];
  groups: ModGroup[];
}

/** One corruption outcome, ordered from the highest item level to the lowest. */
export interface CorruptedTierEntry {
  tier: number;
  level: number;
  text: string;
  /** Spawn weight per item class; absent classes cannot roll this entry. */
  weights: Record<string, number>;
}

/**
 * A corrupted modifier and the exact item classes it rolls on. PoEDB lists the
 * same wording several times with different class sets, so those are kept as
 * separate groups rather than merging their incompatible weight tables.
 */
export interface CorruptedModGroup {
  /** Unique key, based on the normalized text and its item-class set. */
  key: string;
  /** Display name with numeric values replaced by `#`. */
  name: string;
  categories: CategoryKey[];
  classes: string[];
  tierCount: number;
  levelRange: [number, number];
  tiers: CorruptedTierEntry[];
}

export interface CorruptedDataset {
  generatedAt: string;
  source: string;
  classes: string[];
  categories: CategoryKey[];
  groups: CorruptedModGroup[];
}
