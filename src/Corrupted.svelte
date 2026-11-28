<script lang="ts">
  import CorruptedCard from './lib/CorruptedCard.svelte';
  import { corruptedDataset as dataset } from './lib/corrupted-data';
  import {
    CATEGORIES,
    ITEM_CLASS_BY_KEY,
    ITEM_CLASS_ORDER,
    type CategoryKey
  } from './lib/item-classes';
  import type { CorruptedModGroup } from './lib/types';

  const groups: CorruptedModGroup[] = dataset.groups;
  const availableCategories = CATEGORIES.filter((category) =>
    dataset.categories.includes(category.key)
  );
  const itemClasses = [...dataset.classes].sort(
    (a, b) => (ITEM_CLASS_ORDER[a] ?? 999) - (ITEM_CLASS_ORDER[b] ?? 999)
  );
  const minLevel = Math.min(...groups.flatMap((group) => group.levelRange));
  const maxLevel = Math.max(...groups.flatMap((group) => group.levelRange));

  let category = $state<CategoryKey | 'all'>('all');
  let itemClass = $state('');
  let query = $state('');
  let sort = $state<'name' | 'level'>('name');
  let dense = $state(true);
  let searchEl = $state<HTMLInputElement | null>(null);
  let openKeys = $state<Set<string>>(new Set());

  const categoryCounts = $derived.by(() => {
    const counts = { all: groups.length } as Record<CategoryKey | 'all', number>;
    for (const item of availableCategories) {
      counts[item.key] = groups.filter((group) => group.categories.includes(item.key)).length;
    }
    return counts;
  });

  const classCounts = $derived.by(() => {
    const counts = new Map<string, number>();
    for (const group of groups) {
      for (const key of group.classes) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  });

  const needle = $derived(query.trim().toLowerCase());

  const filtered = $derived.by(() => {
    const list = groups.filter((group) => {
      if (category !== 'all' && !group.categories.includes(category)) return false;
      if (itemClass && !group.classes.includes(itemClass)) return false;
      if (needle) {
        const categoryLabels = group.categories.map(
          (key) => CATEGORIES.find((item) => item.key === key)?.label ?? key
        );
        const classLabels = group.classes.map(
          (key) => ITEM_CLASS_BY_KEY[key]?.label ?? key
        );
        const haystack = [
          group.name,
          ...group.tiers.map((tier) => tier.text),
          ...categoryLabels,
          ...classLabels
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });

    if (sort === 'level') {
      list.sort(
        (a, b) => (b.tiers[0]?.level ?? 0) - (a.tiers[0]?.level ?? 0) || a.name.localeCompare(b.name)
      );
    }
    return list;
  });

  const filteredTiers = $derived(
    filtered.reduce((total, group) => total + group.tierCount, 0)
  );
  const hasFilters = $derived(category !== 'all' || itemClass !== '' || needle !== '');
  const allOpen = $derived(filtered.length > 0 && filtered.every((group) => openKeys.has(group.key)));
  const selectedClassLabel = $derived(
    itemClass ? (ITEM_CLASS_BY_KEY[itemClass]?.label ?? itemClass) : ''
  );

  function toggle(key: string) {
    const next = new Set(openKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    openKeys = next;
  }

  function toggleAll() {
    openKeys = allOpen ? new Set() : new Set(filtered.map((group) => group.key));
  }

  function chooseCategory(next: CategoryKey | 'all') {
    category = next;
    itemClass = '';
  }

  function onClassChange(event: Event) {
    itemClass = (event.currentTarget as HTMLSelectElement).value;
    category = itemClass ? ITEM_CLASS_BY_KEY[itemClass].category : 'all';
  }

  function reset() {
    category = 'all';
    itemClass = '';
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
    <span>·</span>
    <a href="../mods/">Eldritch implicits</a>
  </nav>

  <header class="masthead">
    <div class="titles">
      <h1>Corrupted Implicits</h1>
      <p>
        Implicit modifiers added when an item is corrupted. Grouped by modifier, with each
        item-level variant and its spawn weight across every equipment type. Click a modifier to
        inspect its corruption outcomes.
      </p>
    </div>
    <div class="links">
      <a href={dataset.source} target="_blank" rel="noreferrer">poedb source</a>
      <span class="dot">·</span>
      <span>item level {minLevel}–{maxLevel}</span>
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
          placeholder="Search modifiers or item classes — e.g. attack speed, gloves, keystone"
          aria-label="Search corrupted modifiers"
        />
        <kbd>/</kbd>
      </div>

      <label class="sort">
        Sort
        <select bind:value={sort}>
          <option value="name">Name</option>
          <option value="level">Item level</option>
        </select>
      </label>

      <div class="segmented small" role="group" aria-label="Modifier detail">
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
      <div class="chips" role="group" aria-label="Item category">
        <button class="chip" class:active={category === 'all'} onclick={() => chooseCategory('all')}>
          All items
          <span class="count">{categoryCounts.all}</span>
        </button>
        {#each availableCategories as item (item.key)}
          <button
            class="chip"
            class:active={category === item.key}
            onclick={() => chooseCategory(item.key)}
          >
            {item.label}
            <span class="count">{categoryCounts[item.key]}</span>
          </button>
        {/each}
      </div>

      <span class="divider" aria-hidden="true"></span>

      <label class="class-filter">
        Item class
        <select value={itemClass} onchange={onClassChange}>
          <option value="">All item classes</option>
          {#each availableCategories as item (item.key)}
            <optgroup label={item.label}>
              {#each itemClasses.filter((key) => ITEM_CLASS_BY_KEY[key]?.category === item.key) as key (key)}
                <option value={key}>
                  {ITEM_CLASS_BY_KEY[key]?.label ?? key} ({classCounts.get(key) ?? 0})
                </option>
              {/each}
            </optgroup>
          {/each}
        </select>
      </label>
    </div>
  </div>

  <main>
    <p class="summary">
      Showing <strong>{filtered.length}</strong> modifier{filtered.length === 1 ? '' : 's'}
      {#if itemClass}
        on <strong>{selectedClassLabel}</strong>
      {:else if category !== 'all'}
        for <strong>{CATEGORIES.find((item) => item.key === category)?.label}</strong>
      {/if}
      <span class="tiers">· {filteredTiers} variant{filteredTiers === 1 ? '' : 's'} total</span>
    </p>

    {#if filtered.length}
      <div class="grid">
        {#each filtered as group (group.key)}
          <CorruptedCard
            {group}
            {itemClass}
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
      Corrupted modifiers replace an existing implicit modifier when an item is corrupted.
      Variants are ordered by item level, so T1 is the highest item level rather than a formal
      in-game tier. Pick an item class to see its spawn weights; higher is more likely, and
      <code>0</code> means that variant cannot roll for the selected class. PoEDB's synthetic
      all-class block of map outcomes and passive-tree notables is excluded because it is not part
      of the item corruption pool. Data scraped from
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
    display: flex;
    gap: 0.45rem;
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
    max-width: 68ch;
    color: var(--muted);
    font-size: 0.9rem;
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

  .divider {
    width: 1px;
    align-self: stretch;
    min-height: 1.5rem;
    margin: 0 0.15rem;
    background: var(--border);
  }

  .sort,
  .class-filter {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.78rem;
    color: var(--muted);
  }

  .sort select,
  .class-filter select {
    font: inherit;
    font-size: 0.8rem;
    color: var(--text-bright);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.28rem 0.4rem;
  }

  .class-filter {
    margin-left: auto;
  }

  .class-filter select {
    max-width: min(19rem, 52vw);
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
    max-width: 84ch;
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

    .class-filter {
      flex: 1 1 100%;
      margin-left: 0;
    }

    .class-filter select {
      flex: 1;
      max-width: none;
    }
  }
</style>
