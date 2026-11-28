<script lang="ts">
  import { highlight, numTokens, valueOnly, varyingMask } from './labels';
  import { ITEM_CLASS_BY_KEY } from './item-classes';
  import type { CorruptedModGroup, CorruptedTierEntry } from './types';

  interface Props {
    group: CorruptedModGroup;
    itemClass?: string;
    dense?: boolean;
    open?: boolean;
    ontoggle?: () => void;
  }

  let { group, itemClass = '', dense = true, open = false, ontoggle = () => {} }: Props = $props();

  const entries = $derived(group.tiers);
  const mask = $derived(varyingMask(entries.map((entry) => entry.text)));

  // A few rows on poedb omit a value; keep those in full text so the compact
  // view cannot shift the remaining numbers out of place.
  const tokenCount = $derived.by(() => {
    const counts = new Map<number, number>();
    for (const entry of entries) {
      const count = numTokens(entry.text).length;
      counts.set(count, (counts.get(count) ?? 0) + 1);
    }

    let best = 0;
    let bestCount = -1;
    for (const [count, occurrences] of counts) {
      if (occurrences > bestCount) {
        best = count;
        bestCount = occurrences;
      }
    }
    return best;
  });

  const best = $derived(entries[0] ?? null);

  const preview = $derived.by(() => {
    if (!best) return '';
    if (numTokens(best.text).length !== tokenCount) return best.text;
    return valueOnly(best.text, mask);
  });

  const classLabels = $derived(group.classes.map((key) => ITEM_CLASS_BY_KEY[key]?.label ?? key));
  const visibleClasses = $derived(group.classes.length > 4 ? group.classes.slice(0, 2) : group.classes);
  const hiddenClassCount = $derived(group.classes.length - visibleClasses.length);
  const classTitle = $derived(classLabels.join(', '));
  const selectedClassLabel = $derived(
    itemClass ? (ITEM_CLASS_BY_KEY[itemClass]?.label ?? itemClass) : ''
  );

  const panelId = $derived(`corrupted-${group.key.replace(/[^\w-]/g, '_')}`);

  function cell(entry: CorruptedTierEntry): string {
    if (!dense) return entry.text;
    if (numTokens(entry.text).length !== tokenCount) return entry.text;
    return valueOnly(entry.text, mask);
  }

  function weight(entry: CorruptedTierEntry): number | null {
    if (!itemClass) return null;
    return entry.weights[itemClass] ?? null;
  }
</script>

<article class="card" class:open={open}>
  <button class="head" aria-expanded={open} aria-controls={panelId} onclick={ontoggle}>
    <span class="line">
      <span class="chev" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M9 5.5 16.5 12 9 18.5 7.5 17l6-5-6-5Z" /></svg>
      </span>
      <span class="title" role="heading" aria-level="3">{@html highlight(group.name)}</span>
    </span>

    <span class="line line2">
      <span class="meta">
        <span class="source">Corrupted</span>
        {#each visibleClasses as key (key)}
          <span class="slot">{ITEM_CLASS_BY_KEY[key]?.label ?? key}</span>
        {/each}
        {#if hiddenClassCount > 0}
          <span class="slot more" title={classTitle}>+{hiddenClassCount} item classes</span>
        {/if}
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
            <th class="level-col">iLvl</th>
            <th>Modifier</th>
            {#if itemClass}
              <th class="weight-col" title="Spawn weight on {selectedClassLabel}">
                Weight · {selectedClassLabel}
              </th>
            {/if}
          </tr>
        </thead>
        <tbody>
          {#each entries as entry (entry.tier)}
            {@const spawnWeight = weight(entry)}
            <tr>
              <th class="tier-col" class:best={entry.tier === 1}>T{entry.tier}</th>
              <td class="level-col">{entry.level}</td>
              <td title={entry.text}>
                <span class="text">{@html highlight(cell(entry))}</span>
              </td>
              {#if itemClass}
                <td class="weight-col">
                  {#if spawnWeight === null}
                    &mdash;
                  {:else}
                    <span class="weight" class:off={spawnWeight === 0}>{spawnWeight}</span>
                  {/if}
                </td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</article>

<style>
  .card {
    --card-accent: var(--corrupt);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 8px 20px rgb(0 0 0 / 0.25);
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

  .slot.more {
    text-transform: none;
    letter-spacing: 0;
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

  .level-col {
    width: 1%;
    white-space: nowrap;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
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

  .weight-col {
    width: 1%;
    white-space: nowrap;
  }

  .weight {
    display: inline-block;
    min-width: 2.2rem;
    text-align: right;
    font-size: 0.7rem;
    font-variant-numeric: tabular-nums;
    color: var(--muted);
  }

  .weight.off {
    opacity: 0.5;
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
