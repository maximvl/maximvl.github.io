<script lang="ts">
  import {
    SOURCES,
    SLOT_LABELS,
    VARIANTS,
    VARIANT_BY_ID,
    highlight,
    numTokens,
    valueOnly,
    varyingMask
  } from './labels';
  import type { ModGroup, SlotKey, TierEntry, VariantKey } from './types';

  interface Props {
    group: ModGroup;
    slot?: SlotKey | 'all';
    dense?: boolean;
    open?: boolean;
    ontoggle?: () => void;
  }

  let { group, slot = 'all', dense = true, open = false, ontoggle = () => {} }: Props = $props();

  const variantOrder: VariantKey[] = VARIANTS.map((v) => v.id).filter((id) => group.tiers[id]);

  const rows = $derived.by(() => {
    const tiers = new Set<number>();
    for (const list of Object.values(group.tiers)) {
      for (const t of list ?? []) tiers.add(t.tier);
    }
    return [...tiers].sort((a, b) => a - b);
  });

  const allEntries = $derived(Object.values(group.tiers).flatMap((list) => list ?? []));

  // Numbers that are identical in every tier/variant are just wording.
  const mask = $derived(varyingMask(allEntries.map((t) => t.text)));

  // poedb has a few rows with a missing value; keep those in full text so the
  // compact view cannot mis-align the remaining numbers.
  const tokenCount = $derived.by(() => {
    const counts = new Map<number, number>();
    for (const t of allEntries) {
      const n = numTokens(t.text).length;
      counts.set(n, (counts.get(n) ?? 0) + 1);
    }
    let best = 0;
    let bestCount = -1;
    for (const [n, count] of counts) {
      if (count > bestCount) {
        best = n;
        bestCount = count;
      }
    }
    return best;
  });

  // Typical spawn weight per variant for the selected slot; it goes in the
  // column header so the value cells stay narrow.
  const typicalWeight = $derived.by(() => {
    const out: Partial<Record<VariantKey, number | null>> = {};
    if (slot === 'all') return out;
    for (const variant of variantOrder) {
      const counts = new Map<number, number>();
      for (const t of group.tiers[variant] ?? []) {
        const w = t.weights[slot];
        if (w === undefined) continue;
        counts.set(w, (counts.get(w) ?? 0) + 1);
      }
      let best: number | null = null;
      let bestCount = -1;
      for (const [w, count] of counts) {
        if (count > bestCount) {
          best = w;
          bestCount = count;
        }
      }
      out[variant] = best;
    }
    return out;
  });

  const best = $derived(group.tiers.base?.find((t) => t.tier === 1) ?? allEntries[0] ?? null);

  const preview = $derived.by(() => {
    if (!best) return '';
    if (numTokens(best.text).length !== tokenCount) return best.text;
    return valueOnly(best.text, mask);
  });

  const panelId = $derived(`tiers-${group.key.replace(/[^\w-]/g, '_')}`);

  function tierEntry(variant: VariantKey, tier: number): TierEntry | null {
    return group.tiers[variant]?.find((t) => t.tier === tier) ?? null;
  }

  function weight(entry: TierEntry | null, variant: VariantKey): number | null {
    if (!entry || slot === 'all') return null;
    const w = entry.weights[slot];
    if (w === undefined) return null;
    return w === typicalWeight[variant] ? null : w;
  }

  function cell(entry: TierEntry): string {
    if (!dense) return entry.text;
    if (numTokens(entry.text).length !== tokenCount) return entry.text;
    return valueOnly(entry.text, mask);
  }
</script>

<article class="card" data-source={group.source} class:open={open}>
  <button class="head" aria-expanded={open} aria-controls={panelId} onclick={ontoggle}>
    <span class="line">
      <span class="chev" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M9 5.5 16.5 12 9 18.5 7.5 17l6-5-6-5Z" /></svg>
      </span>
      <span class="title" role="heading" aria-level="3">{@html highlight(group.name)}</span>
    </span>

    <span class="line line2">
      <span class="meta">
        <span class="source" data-source={group.source}>{SOURCES[group.source].short}</span>
        {#each group.slots as s (s)}
          <span
            class="slot"
            title={s === 'amulet'
              ? "Eldritch implicits on amulets come from Ukatoa's Ducat, not Embers/Ichors"
              : undefined}
          >{SLOT_LABELS[s] ?? s}</span>
        {/each}
      </span>
      {#if best}
        <span class="preview" title={best.text}>
          <span class="tag">T1</span>
          <span class="val">{@html highlight(preview)}</span>
        </span>
      {/if}
    </span>
  </button>

  {#if open}
    <div class="table-wrap" id={panelId}>
      <table>
        <thead>
          <tr>
            <th class="tier-col">Tier</th>
            {#each variantOrder as variant (variant)}
              <th title={VARIANT_BY_ID[variant].hint}>
                {VARIANT_BY_ID[variant].label}
                {#if typicalWeight[variant] !== null && typicalWeight[variant] !== undefined}
                  <span class="w" title="Spawn weight on {slot}">· {typicalWeight[variant]}</span>
                {/if}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each rows as tier (tier)}
            <tr>
              <th class="tier-col" class:best={tier === 1}>{tier}</th>
              {#each variantOrder as variant (variant)}
                {@const entry = tierEntry(variant, tier)}
                {@const w = weight(entry, variant)}
                <td
                  class:missing={!entry}
                  class:zero={entry !== null && slot !== 'all' && entry.weights[slot] === 0}
                  title={entry?.text}
                >
                  {#if entry}
                    <span class="text">{@html highlight(cell(entry))}</span>
                    {#if w !== null}
                      <span class="weight" class:off={w === 0} title="Spawn weight on {slot}">{w}</span>
                    {/if}
                  {:else}
                    &mdash;
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</article>

<style>
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 8px 20px rgb(0 0 0 / 0.25);
  }

  .card[data-source='exarch'] {
    --card-accent: var(--exarch);
  }

  .card[data-source='eater'] {
    --card-accent: var(--eater);
  }

  .head {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    width: 100%;
    padding: 0.55rem 0.8rem 0.6rem;
    font: inherit;
    color: inherit;
    text-align: left;
    cursor: pointer;
    border: none;
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--card-accent) 12%, transparent),
      transparent 60%
    );
    transition: background 0.15s;
  }

  .head:hover {
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--card-accent) 20%, transparent),
      color-mix(in srgb, var(--card-accent) 5%, transparent) 70%
    );
  }

  .head:focus-visible {
    outline: 2px solid var(--card-accent);
    outline-offset: -2px;
  }

  .card.open .head {
    border-bottom: 1px solid var(--border);
  }

  .line {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    min-width: 0;
  }

  .line2 {
    flex-wrap: wrap;
    padding-left: 1.4rem;
    gap: 0.4rem 0.6rem;
  }

  .chev {
    flex: none;
    display: grid;
    place-items: center;
    width: 0.95rem;
    height: 0.95rem;
    color: var(--card-accent);
    transition: transform 0.16s ease;
  }

  .chev svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }

  .head[aria-expanded='true'] .chev {
    transform: rotate(90deg);
  }

  .title {
    flex: 1 1 auto;
    min-width: 0;
    font-size: 0.92rem;
    font-weight: 600;
    line-height: 1.35;
    color: var(--text-bright);
  }

  .title :global(.num) {
    color: var(--card-accent);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.28rem;
    align-items: center;
  }

  .source,
  .slot {
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    padding: 0.1rem 0.38rem;
    border-radius: 999px;
    border: 1px solid var(--border);
    color: var(--muted);
    white-space: nowrap;
  }

  .source {
    border-color: color-mix(in srgb, var(--card-accent) 55%, transparent);
    color: var(--card-accent);
  }

  .preview {
    display: flex;
    align-items: baseline;
    gap: 0.3rem;
    margin-left: auto;
    font-size: 0.74rem;
    font-variant-numeric: tabular-nums;
    color: var(--muted);
    white-space: nowrap;
  }

  .preview .tag {
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.09em;
    color: var(--card-accent);
  }

  .preview :global(.num) {
    color: var(--text);
  }

  .table-wrap {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.83rem;
  }

  th,
  td {
    text-align: left;
    padding: 0.26rem 0.8rem;
    border-top: 1px solid color-mix(in srgb, var(--border) 55%, transparent);
    white-space: nowrap;
  }

  td {
    white-space: normal;
    overflow-wrap: break-word;
  }

  thead th {
    border-top: none;
    font-size: 0.63rem;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    font-weight: 600;
    color: var(--muted);
    padding-top: 0.4rem;
    padding-bottom: 0.4rem;
  }

  thead .w {
    text-transform: none;
    letter-spacing: 0;
    opacity: 0.65;
    font-weight: 400;
  }

  tbody tr:hover {
    background: color-mix(in srgb, var(--card-accent) 7%, transparent);
  }

  .tier-col {
    width: 1%;
    white-space: nowrap;
    color: var(--muted);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .tier-col.best {
    color: var(--gold);
  }

  td {
    color: var(--text);
    font-variant-numeric: tabular-nums;
  }

  td :global(.num) {
    color: var(--text-bright);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  td.zero {
    opacity: 0.42;
  }

  td.missing {
    color: var(--muted);
  }

  .weight {
    display: inline-block;
    margin-left: 0.45rem;
    padding: 0 0.28rem;
    border-radius: 4px;
    font-size: 0.62rem;
    font-variant-numeric: tabular-nums;
    color: var(--muted);
    background: color-mix(in srgb, var(--muted) 15%, transparent);
  }

  .weight.off {
    opacity: 0.65;
  }

  @media (max-width: 640px) {
    th,
    td {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }

    table {
      font-size: 0.78rem;
    }
  }
</style>
