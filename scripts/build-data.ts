/**
 * Scrapes the Eldritch implicit modifier tables from poedb and writes
 * src/lib/data/eldritch.json.
 *
 * Usage: node scripts/build-data.ts [--from-file path/to/page.html]
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Dataset, ModGroup, SlotKey, SourceKey, TierEntry, VariantKey } from '../src/lib/types.ts';

const URL = 'https://poedb.tw/us/Eldritch_implicit';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'src/lib/data/eldritch.json');

const TABS: Record<string, SourceKey> = {
  TheSearingExarchImplicit: 'exarch',
  TheEaterofWorldsImplicit: 'eater'
};

const SLOTS: SlotKey[] = ['gloves', 'boots', 'helmet', 'body_armour', 'amulet'];

const isSlotKey = (key: string): key is SlotKey => (SLOTS as string[]).includes(key);

interface RawRow {
  level: number;
  text: string;
  tags: string[];
  modId: string | null;
  weights: Record<string, number>;
}

interface ParsedRow {
  source: SourceKey;
  row: RawRow;
}

interface GroupBuilder {
  key: string;
  source: SourceKey;
  id: string;
  name: string | null;
  tiers: Record<VariantKey, TierEntry[]>;
  tags: Set<string>;
  slots: Set<SlotKey>;
}

function unescapeHtml(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(s: string): string {
  return unescapeHtml(s.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
}

function dec(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

async function loadHtml(): Promise<string> {
  const fromFileIdx = process.argv.indexOf('--from-file');
  if (fromFileIdx !== -1) {
    const path = process.argv[fromFileIdx + 1];
    if (!path) throw new Error('--from-file requires a path');
    return readFileSync(path, 'utf8');
  }

  const res = await fetch(URL, {
    headers: {
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
    }
  });
  if (!res.ok) throw new Error(`Failed to fetch ${URL}: ${res.status}`);
  return res.text();
}

function parseSection(html: string, tabId: string): RawRow[] {
  const start = html.indexOf(`id="${tabId}" class="tab-pane`);
  if (start === -1) throw new Error(`Tab ${tabId} not found`);
  const nextIds = Object.keys(TABS)
    .filter((id) => id !== tabId)
    .map((id) => html.indexOf(`id="${id}" class="tab-pane`, start + 1))
    .filter((i) => i !== -1);
  const otherTab = html.indexOf('id="EldritchImplicitModifiers"', start + 1);
  const end = Math.min(...[...nextIds, otherTab].filter((i) => i !== -1));
  const section = html.slice(start, end === Infinity ? undefined : end);

  const rows: RawRow[] = [];
  const rowRe = /<tr><td>(\d+)<\/td><td>([\s\S]*?)<\/td><td>([\s\S]*?)<\/td><\/tr>/g;
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(section))) {
    const [, level, descHtml, weightHtml] = m;

    // The mod text lives inside span.implicitMod; badges/icons follow it.
    const modTextHtml = descHtml
      .replace(/<span class="badge[\s\S]*?<\/span>/g, '')
      .replace(/<i class="fas fa-info-circle"[^>]*><\/i>/g, '');
    const text = stripTags(modTextHtml);

    const tags = [...descHtml.matchAll(/data-tag="([^"]+)"/g)].map((x) => x[1]);

    const modIdMatch = descHtml.match(/Data%5CMods%2F([A-Za-z0-9_.%]+)/);
    const modId = modIdMatch ? dec(modIdMatch[1]) : null;

    const weights: Record<string, number> = {};
    for (const [, key, value] of weightHtml.matchAll(/<i>(.*?)<\/i>\s*(\d+)/g)) {
      weights[key] = Number(value);
    }

    rows.push({ level: Number(level), text, tags, modId, weights });
  }
  return rows;
}

function splitModId(
  modId: string | null,
  text: string
): { base: string; variant: VariantKey; tier: number | null } {
  const raw = modId ?? '';
  let variant: VariantKey = 'base';
  if (/UniquePresence/.test(raw)) variant = 'unique';
  else if (/PinnaclePresence/.test(raw)) variant = 'pinnacle';

  let base = raw.replace(/EldritchImplicit/g, '').replace(/(Unique|Pinnacle)Presence/g, '');

  let tier: number | null = null;
  const tierMatch = base.match(/(\d+)$/);
  if (tierMatch) {
    tier = Number(tierMatch[1]);
    base = base.slice(0, -tierMatch[1].length);
  }
  // Fall back to a name derived from the text if poedb gave us nothing usable.
  if (!base) base = normalizeName(text);
  return { base, variant, tier };
}

function normalizeName(text: string): string {
  return text
    .replace(/^While a Unique Enemy is in your Presence, /, '')
    .replace(/^While a Pinnacle Atlas Boss is in your Presence, /, '')
    .replace(/\d+(?:—\d+)?/g, '#');
}

function presencePrefix(text: string): { variant: VariantKey; text: string } {
  if (text.startsWith('While a Unique Enemy is in your Presence, ')) {
    return {
      variant: 'unique',
      text: text.slice('While a Unique Enemy is in your Presence, '.length)
    };
  }
  if (text.startsWith('While a Pinnacle Atlas Boss is in your Presence, ')) {
    return {
      variant: 'pinnacle',
      text: text.slice('While a Pinnacle Atlas Boss is in your Presence, '.length)
    };
  }
  return { variant: 'base', text };
}

function slotSetOrder(slot: SlotKey): number {
  const idx = SLOTS.indexOf(slot);
  return idx === -1 ? 99 : idx;
}

const html = await loadHtml();

const groups = new Map<string, GroupBuilder>();
const slotSet = new Set<SlotKey>(SLOTS);
const allRows: ParsedRow[] = [];

for (const [tabId, source] of Object.entries(TABS)) {
  for (const row of parseSection(html, tabId)) allRows.push({ source, row });
}

// poedb occasionally renders a row without the mod-id tooltip. Deal with the
// well-formed rows first so those stragglers can be attached to their group.
const ordered: ParsedRow[] = [
  ...allRows.filter(({ row }) => row.modId),
  ...allRows.filter(({ row }) => !row.modId)
];

for (const { source, row } of ordered) {
  const { base, variant: idVariant, tier: idTier } = splitModId(row.modId, row.text);
  const prefixed = presencePrefix(row.text);
  const variant: VariantKey = idVariant === 'base' ? prefixed.variant : idVariant;

  const tierTag = Object.keys(row.weights).find((k) => /^no_tier_\d+_eldritch_implicit$/.test(k));
  const tier = tierTag ? Number(tierTag.match(/\d+/)![0]) : (idTier ?? 0);

  const weights: Partial<Record<SlotKey, number>> = {};
  for (const [key, value] of Object.entries(row.weights)) {
    if (key === 'default' || key.startsWith('no_tier_')) continue;
    if (!isSlotKey(key)) continue;
    slotSet.add(key);
    weights[key] = value;
  }

  let key = `${source}:${base}`;
  let group = groups.get(key);

  if (!row.modId) {
    // Identify the orphan by its normalised text + slots.
    const wanted = normalizeName(row.text);
    const slots = Object.keys(weights).sort().join(',');
    const match = [...groups.values()].find(
      (g) =>
        g.source === source &&
        normalizeName(g.tiers[variant][0]?.text ?? '') === wanted &&
        Object.keys(g.tiers[variant][0]?.weights ?? {})
          .sort()
          .join(',') === slots
    );
    if (match) {
      key = match.key;
      group = match;
    }
  }

  if (!group) {
    group = {
      key,
      source,
      id: base,
      name: null,
      tiers: { base: [], unique: [], pinnacle: [] },
      tags: new Set(),
      slots: new Set()
    };
    groups.set(key, group);
  }
  for (const t of row.tags) group.tags.add(t);
  for (const [slot, w] of Object.entries(weights)) {
    if (w > 0 && isSlotKey(slot)) group.slots.add(slot);
  }

  const list = group.tiers[variant];
  if (!list.some((t) => t.tier === tier)) {
    list.push({ tier, level: row.level, text: prefixed.text, weights });
  }
}

const out: ModGroup[] = [...groups.values()]
  .map((g) => {
    const tiers: Partial<Record<VariantKey, TierEntry[]>> = {};
    for (const [variant, list] of Object.entries(g.tiers) as [VariantKey, TierEntry[]][]) {
      if (!list.length) continue;
      list.sort((a, b) => a.tier - b.tier);
      tiers[variant] = list;
    }
    const all = Object.values(tiers).flatMap((list) => list ?? []);
    const name = normalizeName((tiers.base?.[0] ?? all[0]).text) || g.id;
    const tierRange: [number, number] = [
      Math.min(...all.map((t) => t.tier)),
      Math.max(...all.map((t) => t.tier))
    ];
    return {
      key: g.key,
      id: g.id,
      name,
      source: g.source,
      tags: [...g.tags].sort(),
      slots: [...g.slots].sort((a, b) => slotSetOrder(a) - slotSetOrder(b)),
      tierCount: all.length,
      tierRange,
      tiers
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name) || a.source.localeCompare(b.source));

const payload: Dataset = {
  generatedAt: new Date().toISOString(),
  source: URL,
  slots: [...slotSet].sort((a, b) => slotSetOrder(a) - slotSetOrder(b)),
  groups: out
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(payload));

const rows = out.reduce((n, g) => n + g.tierCount, 0);
console.log(
  `Wrote ${out.length} mod groups (${rows} tiers) to ${OUT}\nslots: ${payload.slots.join(', ')}`
);
