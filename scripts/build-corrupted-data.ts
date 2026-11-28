/**
 * Scrapes the Vaal Orb corrupted implicit table from poedb and writes
 * src/lib/data/corrupted.json.
 *
 * Usage: node scripts/build-corrupted-data.ts [--from-file path/to/page.html]
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CATEGORIES,
  ITEM_CLASS_BY_KEY,
  ITEM_CLASS_ORDER,
  CATEGORY_ORDER,
  type CategoryKey
} from '../src/lib/item-classes.ts';
import type {
  CorruptedDataset,
  CorruptedModGroup,
  CorruptedTierEntry
} from '../src/lib/types.ts';

const URL = 'https://poedb.tw/us/Sacrifice_of_the_Vaal';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'src/lib/data/corrupted.json');

const NUM = /\d+(?:\.\d+)?(?:—\d+(?:\.\d+)?)?/g;

interface RawRow {
  level: number;
  text: string;
  weights: Record<string, number>;
}

interface GroupBuilder {
  key: string;
  name: string;
  classes: Set<string>;
  tiers: Map<string, CorruptedTierEntry>;
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
    .replace(/&#39;|&apos;/g, "'");
}

function stripTags(s: string): string {
  return unescapeHtml(s.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, ''))
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeName(text: string): string {
  return text.replace(NUM, '#').replace(/\s+/g, ' ').trim();
}

function classOrder(key: string): number {
  return ITEM_CLASS_ORDER[key] ?? 999;
}

function categoryOrder(key: CategoryKey): number {
  return CATEGORY_ORDER[key] ?? 999;
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

/**
 * poedb appends map outcomes and passive-tree notables to this table and gives
 * them the same synthetic weight on 35 item classes. Those rows are not item
 * corruption implicits (they would incorrectly put Iron Will on gloves), so
 * drop the whole block. Real entries in this table have at most 16 classes.
 */
const SYNTHETIC_ALL_CLASSES = 20;

function parseRows(html: string): RawRow[] {
  const tabStart = html.indexOf('id="VaalOrbCorruptedImplicit"');
  if (tabStart === -1) throw new Error('Vaal implicit tab not found');

  const tableStart = html.indexOf('<table', tabStart);
  const tableEnd = html.indexOf('</table>', tableStart);
  if (tableStart === -1 || tableEnd === -1) throw new Error('Vaal implicit table not found');

  const table = html.slice(tableStart, tableEnd);
  const rowRe = /<tr><td>(\d+)<td>([\s\S]*?)<td>([\s\S]*?)(?=<tr>|$)/g;
  const classRe = /<a class="ItemClasses[^"]*" href="([^"]+)">[^<]+<\/a>\((\d+)\)/g;
  const rows: RawRow[] = [];

  let match: RegExpExecArray | null;
  while ((match = rowRe.exec(table))) {
    const [, levelHtml, modHtml, classHtml] = match;
    const text = stripTags(modHtml);
    if (!text) continue;

    const weights: Record<string, number> = {};
    for (const [, key, weight] of classHtml.matchAll(classRe)) {
      if (ITEM_CLASS_BY_KEY[key]) weights[key] = Number(weight);
    }

    const positiveClasses = Object.values(weights).filter((weight) => weight > 0);
    if (!positiveClasses.length || positiveClasses.length >= SYNTHETIC_ALL_CLASSES) continue;
    rows.push({ level: Number(levelHtml), text, weights });
  }

  return rows;
}

function tierSignature(row: RawRow): string {
  return [
    row.text,
    ...Object.entries(row.weights)
      .sort(([a], [b]) => classOrder(a) - classOrder(b))
      .map(([key, weight]) => `${key}:${weight}`)
  ].join('|');
}

const html = await loadHtml();
const rows = parseRows(html);
const groups = new Map<string, GroupBuilder>();

for (const row of rows) {
  const name = normalizeName(row.text);
  const positiveClasses = Object.entries(row.weights)
    .filter(([, weight]) => weight > 0)
    .map(([key]) => key)
    .sort((a, b) => classOrder(a) - classOrder(b));

  const classSignature = positiveClasses.join(',');
  const key = `${name}|${classSignature}`;
  let group = groups.get(key);

  if (!group) {
    group = {
      key,
      name,
      classes: new Set<string>(),
      tiers: new Map<string, CorruptedTierEntry>()
    };
    groups.set(key, group);
  }

  for (const itemClass of positiveClasses) group.classes.add(itemClass);
  group.tiers.set(tierSignature(row), {
    tier: 0,
    level: row.level,
    text: row.text,
    weights: row.weights
  });
}

const out: CorruptedModGroup[] = [...groups.values()]
  .map((group) => {
    const classes = [...group.classes].sort((a, b) => classOrder(a) - classOrder(b));
    const categories = [
      ...new Set(classes.map((itemClass) => ITEM_CLASS_BY_KEY[itemClass].category))
    ].sort((a, b) => categoryOrder(a) - categoryOrder(b));

    const tiers = [...group.tiers.values()]
      .sort((a, b) => b.level - a.level || a.text.localeCompare(b.text))
      .map((entry, index) => ({ ...entry, tier: index + 1 }));

    const levels = tiers.map((entry) => entry.level);

    return {
      key: group.key,
      name: group.name,
      categories,
      classes,
      tierCount: tiers.length,
      levelRange: [Math.min(...levels), Math.max(...levels)] as [number, number],
      tiers
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name) || a.classes.length - b.classes.length);

const presentClasses = [...new Set(out.flatMap((group) => group.classes))].sort(
  (a, b) => classOrder(a) - classOrder(b)
);
const presentCategories = CATEGORIES.map((category) => category.key).filter((category) =>
  out.some((group) => group.categories.includes(category))
);

const payload: CorruptedDataset = {
  generatedAt: new Date().toISOString(),
  source: URL,
  classes: presentClasses,
  categories: presentCategories,
  groups: out
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(payload));

const tierCount = out.reduce((sum, group) => sum + group.tierCount, 0);
console.log(
  `Wrote ${out.length} corrupted mod groups (${tierCount} variants) to ${OUT}\n` +
    `item classes: ${presentClasses.length}, categories: ${presentCategories.join(', ')}`
);
