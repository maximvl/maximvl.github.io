<script lang="ts">
  import ModCard from './lib/ModCard.svelte';
  import { dataset } from './lib/data';
  import { SLOT_LABELS, SOURCES } from './lib/labels';
  import type { ModGroup, SlotKey, SourceKey } from './lib/types';

  const groups: ModGroup[] = dataset.groups;
  const slots: SlotKey[] = dataset.slots.filter((s) => SLOT_LABELS[s]);

  let slot = $state<SlotKey | 'all'>('all');
  let source = $state<SourceKey | 'all'>('all');
  let query = $state('');
  let sort = $state<'name' | 'slot'>('name');
  let dense = $state(true);
  let searchEl = $state<HTMLInputElement | null>(null);
  let openKeys = $state<Set<string>>(new Set());

  const slotCounts = $derived.by(() => {
    const counts = { all: groups.length } as Record<SlotKey | 'all', number>;
    for (const s of slots) counts[s] = groups.filter((g) => g.slots.includes(s)).length;
    return counts;
  });

  const sourceCounts = $derived.by(() => {
    const counts = { all: groups.length, exarch: 0, eater: 0 } as Record<SourceKey | 'all', number>;
    for (const g of groups) counts[g.source] += 1;
    return counts;
  });

  const needle = $derived(query.trim().toLowerCase());

  const filtered = $derived.by(() => {
    const list = groups.filter((g) => {
      if (source !== 'all' && g.source !== source) return false;
      if (slot !== 'all' && !g.slots.includes(slot)) return false;
      if (needle) {
        const haystack = `${g.name} ${g.tags.join(' ')}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });

    if (sort === 'slot') {
      const first = (g: ModGroup): number => slots.findIndex((s) => g.slots.includes(s));
      list.sort((a, b) => first(a) - first(b) || a.name.localeCompare(b.name));
    }
    return list;
  });

  const filteredTiers = $derived(
    filtered.reduce(
      (n, g) => n + Object.values(g.tiers).reduce((sum, list) => sum + (list?.length ?? 0), 0),
      0
    )
  );

  const hasFilters = $derived(slot !== 'all' || source !== 'all' || needle !== '');

  const allOpen = $derived(filtered.length > 0 && filtered.every((g) => openKeys.has(g.key)));

  function toggle(key: string) {
    const next = new Set(openKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    openKeys = next;
  }

  function toggleAll() {
    openKeys = allOpen ? new Set() : new Set(filtered.map((g) => g.key));
  }

  function reset() {
    slot = 'all';
    source = 'all';
    query = '';
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === '/' && document.activeElement !== searchEl) {
      event.preventDefault();
      searchEl?.focus();
    } else if (event.key === 'Escape' && document.activeElement === searchEl) {
      query = '';
      searchEl?.blur();
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div class="page">
  <nav class="topnav">
    <a href="../">← All projects</a>
  </nav>

  <header class="masthead">
    <div class="titles">
      <h1>Eldritch Implicits</h1>
      <p>
        Implicit modifiers from the <strong class="exarch">Searing Exarch</strong> and
        <strong class="eater">Eater of Worlds</strong> eldritch currencies, grouped by modifier with
        every tier side by side. Click a modifier to expand its tiers.
      </p>
    </div>
    <div class="links">
      <a href="https://poedb.tw/us/Eldritch_implicit" target="_blank" rel="noreferrer">poedb source</a>
      <span class="dot">·</span>
      <span>item level 75</span>
    </div>
  </header>

  <div class="toolbar">
    <div class="row">
      <div class="search">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm-8 6a8 8 0 1 1 14.32 4.9l4.39 4.4-1.42 1.41-4.39-4.39A8 8 0 0 1 2 10Z"
          />
        </svg>
        <input
          bind:this={searchEl}
          bind:value={query}
          type="search"
          placeholder="Search modifiers or tags — e.g. attack speed, frenzy"
          aria-label="Search modifiers"
        />
        <kbd>/</kbd>
      </div>

      <label class="sort">
        Sort
        <select bind:value={sort}>
          <option value="name">Name</option>
          <option value="slot">Slot</option>
        </select>
      </label>

      <div class="segmented small" role="group" aria-label="Tier detail">
        <button class:active={dense} onclick={() => (dense = true)} title="Show only the rolled values">
          Values
        </button>
        <button class:active={!dense} onclick={() => (dense = false)} title="Show the full modifier text">
          Full text
        </button>
      </div>

      <button class="ghost" onclick={toggleAll} disabled={filtered.length === 0}>
        {allOpen ? 'Collapse all' : 'Expand all'}
      </button>

      {#if hasFilters}
        <button class="reset" onclick={reset}>Clear filters</button>
      {/if}
    </div>

    <div class="row">
      <div class="chips" role="group" aria-label="Equipment slot">
        <button class="chip" class:active={slot === 'all'} onclick={() => (slot = 'all')}>
          All slots
        </button>
        {#each slots as s (s)}
          <button
            class="chip"
            class:active={slot === s}
            onclick={() => (slot = s)}
            title={s === 'amulet'
              ? "Amulets get eldritch implicits from Ukatoa's Ducat (Deepwater crafting), not from Embers or Ichors"
              : undefined}
          >
            {SLOT_LABELS[s]}
            <span class="count">{slotCounts[s]}</span>
          </button>
        {/each}
      </div>

      <span class="divider" aria-hidden="true"></span>

      <div class="chips" role="group" aria-label="Eldritch source">
        <button class="chip" class:active={source === 'all'} onclick={() => (source = 'all')}>
          Both sources
          <span class="count">{sourceCounts.all}</span>
        </button>
        <button
          class="chip accent"
          class:active={source === 'exarch'}
          data-source="exarch"
          onclick={() => (source = 'exarch')}
        >
          Searing Exarch
          <span class="count">{sourceCounts.exarch}</span>
        </button>
        <button
          class="chip accent"
          class:active={source === 'eater'}
          data-source="eater"
          onclick={() => (source = 'eater')}
        >
          Eater of Worlds
          <span class="count">{sourceCounts.eater}</span>
        </button>
      </div>
    </div>
  </div>

  <main>
    <p class="summary">
      Showing <strong>{filtered.length}</strong> modifier{filtered.length === 1 ? '' : 's'}
      {#if slot !== 'all'}for <strong>{SLOT_LABELS[slot]}</strong>{/if}
      {#if source !== 'all'}from <strong class={source}>{SOURCES[source].label}</strong>{/if}
      <span class="tiers">· {filteredTiers} tiers total</span>
    </p>

    {#if filtered.length}
      <div class="grid">
        {#each filtered as group (group.key)}
          <ModCard
            {group}
            {slot}
            {dense}
            open={openKeys.has(group.key)}
            ontoggle={() => toggle(group.key)}
          />
        {/each}
      </div>
    {:else}
      <div class="empty">
        <p>No modifiers match those filters.</p>
        <button onclick={reset}>Clear filters</button>
      </div>
    {/if}
  </main>

  <footer>
    <p>
      Pick a slot to see spawn weights: the typical weight appears in each column header, and a
      badge marks any tier that differs (higher is more likely, <code>0</code> means that tier
      cannot roll there). Tier 1 is the strongest tier. Amulet entries come from
      <a href="https://poedb.tw/us/Ukatoas_Ducat" target="_blank" rel="noreferrer">Ukatoa's Ducat</a>,
      the Deepwater currency that grants an eldritch implicit to a non-unique amulet — Embers and
      Ichors themselves only work on body armour, boots, gloves and helmet. Data scraped from
      <a href={dataset.source} target="_blank" rel="noreferrer">poedb</a>.
    </p>
  </footer>
</div>

<style>
  .page {
    max-width: 1500px;
    margin: 0 auto;
    padding: 1.5rem clamp(0.75rem, 2.5vw, 2rem) 3rem;
  }

  .topnav {
    margin-bottom: 0.9rem;
    font-size: 0.78rem;
  }

  .topnav a {
    color: var(--muted);
  }

  .topnav a:hover {
    color: var(--gold);
    text-decoration: none;
  }

  .masthead {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 0.75rem 2rem;
    padding-bottom: 1.1rem;
    border-bottom: 1px solid var(--border);
    margin-bottom: 1rem;
  }

  h1 {
    margin: 0;
    font-size: clamp(1.5rem, 3vw, 2.1rem);
    font-weight: 700;
    letter-spacing: 0.01em;
    color: var(--text-bright);
  }

  .titles p {
    margin: 0.35rem 0 0;
    max-width: 62ch;
    color: var(--muted);
    font-size: 0.9rem;
  }

  .exarch {
    color: var(--exarch);
    font-weight: 600;
  }

  .eater {
    color: var(--eater);
    font-weight: 600;
  }

  .links {
    font-size: 0.78rem;
    color: var(--muted);
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .links a {
    color: var(--gold);
  }

  .toolbar {
    position: sticky;
    top: 0;
    z-index: 5;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 0.7rem 0;
    margin-bottom: 0.35rem;
    background: color-mix(in srgb, var(--bg) 88%, transparent);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border);
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.6rem;
  }

  .search {
    position: relative;
    flex: 1 1 320px;
    display: flex;
    align-items: center;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0 0.6rem;
    transition: border-color 0.15s;
  }

  .search:focus-within {
    border-color: var(--gold);
  }

  .search svg {
    width: 15px;
    height: 15px;
    fill: var(--muted);
    flex: none;
  }

  .search input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: var(--text-bright);
    font: inherit;
    font-size: 0.9rem;
    padding: 0.5rem 0.55rem;
  }

  .search input::-webkit-search-cancel-button {
    filter: invert(0.6);
  }

  kbd {
    font-size: 0.7rem;
    color: var(--muted);
    border: 1px solid var(--border);
    border-bottom-width: 2px;
    border-radius: 4px;
    padding: 0 0.3rem;
    font-family: inherit;
  }

  .segmented {
    display: flex;
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
    background: var(--surface);
  }

  .segmented button,
  .chip,
  .ghost,
  .reset,
  .empty button {
    font: inherit;
    font-size: 0.82rem;
    color: var(--muted);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.45rem 0.7rem;
    transition:
      color 0.15s,
      background 0.15s;
  }

  .segmented button + button {
    border-left: 1px solid var(--border);
  }

  .segmented button:hover,
  .chip:hover {
    color: var(--text-bright);
    background: color-mix(in srgb, var(--text-bright) 6%, transparent);
  }

  .segmented button.active {
    color: var(--text-bright);
    background: color-mix(in srgb, var(--gold) 16%, transparent);
    box-shadow: inset 0 -2px 0 var(--gold);
  }

  .segmented.small button {
    font-size: 0.76rem;
    padding: 0.3rem 0.55rem;
  }

  .count {
    color: var(--muted);
    font-size: 0.72rem;
    font-variant-numeric: tabular-nums;
    margin-left: 0.25rem;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .chip {
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--surface);
    padding: 0.3rem 0.7rem;
  }

  .chip.active {
    color: #14181d;
    background: var(--gold);
    border-color: var(--gold);
    font-weight: 600;
  }

  .chip.active .count {
    color: color-mix(in srgb, #14181d 65%, transparent);
  }

  .chip.accent[data-source='exarch'] {
    --chip-accent: var(--exarch);
  }

  .chip.accent[data-source='eater'] {
    --chip-accent: var(--eater);
  }

  .chip.accent {
    border-color: color-mix(in srgb, var(--chip-accent) 45%, var(--border));
  }

  .chip.accent:hover {
    color: var(--chip-accent);
  }

  .chip.accent.active {
    color: #14181d;
    background: var(--chip-accent);
    border-color: var(--chip-accent);
    font-weight: 600;
  }

  .divider {
    width: 1px;
    align-self: stretch;
    min-height: 1.5rem;
    margin: 0 0.15rem;
    background: var(--border);
  }

  .sort {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.78rem;
    color: var(--muted);
  }

  .sort select {
    font: inherit;
    font-size: 0.8rem;
    color: var(--text-bright);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.28rem 0.4rem;
  }

  .ghost {
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.3rem 0.6rem;
    background: var(--surface);
  }

  .ghost:hover:not(:disabled) {
    color: var(--gold);
    border-color: color-mix(in srgb, var(--gold) 55%, transparent);
  }

  .ghost:disabled {
    opacity: 0.45;
    cursor: default;
  }

  .reset {
    border: 1px dashed var(--border);
    border-radius: 6px;
    padding: 0.3rem 0.6rem;
  }

  .reset:hover {
    color: var(--text-bright);
    border-color: var(--muted);
  }

  .summary {
    margin: 0.5rem 0 0.75rem;
    font-size: 0.82rem;
    color: var(--muted);
  }

  .summary strong {
    color: var(--text-bright);
    font-weight: 600;
  }

  .summary strong.exarch {
    color: var(--exarch);
  }

  .summary strong.eater {
    color: var(--eater);
  }

  .tiers {
    opacity: 0.75;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 390px), 1fr));
    gap: 0.75rem;
    align-items: start;
  }

  .empty {
    text-align: center;
    padding: 4rem 1rem;
    color: var(--muted);
    border: 1px dashed var(--border);
    border-radius: 12px;
  }

  .empty button {
    margin-top: 0.75rem;
    border: 1px solid var(--gold);
    color: var(--gold);
    border-radius: 6px;
  }

  footer {
    margin-top: 2.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
    color: var(--muted);
    font-size: 0.76rem;
    line-height: 1.6;
  }

  footer p {
    margin: 0;
    max-width: 80ch;
  }

  footer a {
    color: var(--gold);
  }

  code {
    font-size: 0.72rem;
    padding: 0 0.2rem;
    border-radius: 3px;
    background: var(--surface);
  }

  @media (max-width: 1100px) {
    .divider {
      display: none;
    }
  }

  @media (max-width: 640px) {
    .toolbar {
      position: static;
    }

    .segmented {
      flex: 1 1 100%;
    }

    .segmented button {
      flex: 1;
    }
  }
</style>
