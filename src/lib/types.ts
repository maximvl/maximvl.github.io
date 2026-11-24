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
