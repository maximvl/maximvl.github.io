import type { SourceKey, SlotKey, VariantKey } from './types';

export const SOURCES: Record<SourceKey, { label: string; short: string }> = {
  exarch: { label: 'The Searing Exarch', short: 'Exarch' },
  eater: { label: 'The Eater of Worlds', short: 'Eater' }
};

export const SLOT_LABELS: Record<SlotKey, string> = {
  gloves: 'Gloves',
  boots: 'Boots',
  helmet: 'Helmet',
  body_armour: 'Body Armour',
  amulet: 'Amulet'
};

export interface Variant {
  id: VariantKey;
  label: string;
  hint: string;
}

export const VARIANTS: Variant[] = [
  { id: 'base', label: 'Base', hint: 'Always active' },
  { id: 'unique', label: 'vs Unique', hint: 'While a Unique Enemy is in your Presence' },
  { id: 'pinnacle', label: 'vs Pinnacle', hint: 'While a Pinnacle Atlas Boss is in your Presence' }
];

export const VARIANT_BY_ID = Object.fromEntries(VARIANTS.map((v) => [v.id, v])) as Record<
  VariantKey,
  Variant
>;

// Note: use named entities only — numeric entities like &#39; would have their
// digits picked up by the number highlighting below.
const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;'
};

const NUM = /\d+(?:\.\d+)?(?:—\d+(?:\.\d+)?)?/g;
const PUNCT_START = /^[^A-Za-z0-9\s]*/;
const PUNCT_END = /[^A-Za-z0-9\s]*$/;

const punctEnd = (s: string): string => s.match(PUNCT_END)?.[0] ?? '';
const punctStart = (s: string): string => s.match(PUNCT_START)?.[0] ?? '';

/** Escape HTML and wrap numeric values so they can be highlighted with {@html}. */
export function highlight(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ESCAPES[c]).replace(NUM, (n) => `<span class="num">${n}</span>`);
}

export function numTokens(text: string): string[] {
  return text.match(NUM) ?? [];
}

/**
 * Which value positions actually change between tiers/variants. Numbers that
 * never change are just part of the wording ("... for 4 seconds"), so we can
 * leave them out of the compact value view.
 */
export function varyingMask(texts: string[]): boolean[] {
  const sets: Set<string>[] = [];
  for (const text of texts) {
    numTokens(text).forEach((n, i) => (sets[i] ??= new Set()).add(n));
  }
  return sets.map((set) => set.size > 1);
}

/**
 * Reduce a full modifier line to just its values, e.g.
 * "Adds (3—5) to (7—9) Physical Damage to Attacks" -> "(3—5) to (7—9)".
 * The generic wording lives in the card title and in the cell tooltip.
 */
export function valueOnly(text: string, keep: boolean[] | null = null): string {
  const nums = numTokens(text);
  if (!nums.length) return text;

  const parts = text.split(NUM);
  const kept = nums.map((_, i) => (keep ? keep[i] !== false : true));
  if (!kept.some(Boolean)) kept.fill(true);

  let out = '';
  let first = true;

  for (let i = 0; i < nums.length; i++) {
    if (!kept[i]) continue;

    const pre = punctEnd(parts[i]);
    const post = punctStart(parts[i + 1] ?? '');

    if (first) {
      out = pre + nums[i];
      first = false;
    } else {
      const word = parts[i].replace(/[^A-Za-z]/g, '').toLowerCase();
      out += word === 'to' ? ' to ' : ' · ';
      out += pre + nums[i];
    }
    out += post;
  }

  return out.replace(/\s+/g, ' ').trim();
}
