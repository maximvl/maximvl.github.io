# mapcar — projects

**Live: <https://maximvl.github.io/>**

Personal project index for mapcar, built with Svelte 5, TypeScript, Vite and Tailwind CSS.

## Site

- `/` — the project index: links to Loto, Turnir, Whenis, the EventLab team site and the PoE tools
  on this site.
- `/mods/` — the Eldritch implicit modifier browser described below.
- `/corrupted/` — the corrupted implicit modifier browser described below.

The pages are separate static HTML entries built by Vite (`index.html`, `mods/index.html` and
`corrupted/index.html`), so each has a real URL and no client-side router is needed. The project
list lives in [`src/lib/projects.ts`](src/lib/projects.ts); add an entry there to show another
project on the home page.

## Styling

[`src/app.css`](src/app.css) holds the shared theme: the `:root` custom properties used by the
modifier browsers plus Tailwind v4's `@theme` tokens (`base`, `panel`, `gold`, `exarch`, `eater`,
`corrupt`, …) and the keyframes used on the index page. The index page is styled with Tailwind
utility classes; each modifier browser keeps its scoped component CSS. Tailwind is wired up through
`@tailwindcss/vite` in [`vite.config.ts`](vite.config.ts).

## Eldritch Implicits

A browser for the Eldritch implicit modifiers from the **Searing Exarch** and **Eater of Worlds**
currencies, scraped from [poedb](https://poedb.tw/us/Eldritch_implicit).

Each modifier is a card that lines up every tier across its three forms: base, "while a Unique
Enemy is in your Presence" and "while a Pinnacle Atlas Boss is in your Presence". Filter by
equipment slot to see only the mods that can roll there.

### Features

- Filter by slot (Gloves, Boots, Helmet, Body Armour, Amulet), by source (Searing Exarch / Eater of
  Worlds), or free-text search (modifier names and tags such as `attack`, `speed`, `frenzy`).
- Tiers grouped per modifier, collapsed into one row per modifier and expanded on click; tier 1
  (best) stays at the top. **Expand all** / **Collapse all** is in the toolbar.
- Collapsed rows preview the tier 1 value so you can scan without opening every modifier.
- Compact "values only" view by default; toggle **Full text** to see the complete modifier line.
- Spawn weight for the selected slot: the typical weight sits in the column header, with a badge
  in any tier where it differs (e.g. a tier that cannot roll at that slot has weight `0`).
- The Amulet slot comes from the mod data's `amulet` spawn weights: since Embers/Ichors only apply
  to body armour, boots, gloves and helmet, those mods are reachable on amulets through
  [Ukatoa's Ducat](https://poedb.tw/us/Ukatoas_Ducat) (Deepwater crafting). One Eater mod,
  *increased Skill Effect Duration*, is amulet-only.
- `/` focuses the search box, `Esc` clears it.

## Corrupted Implicits

A browser for corrupted implicit modifiers, scraped from the Vaal Orb table on
[poedb](https://poedb.tw/us/Sacrifice_of_the_Vaal#VaalOrbCorruptedImplicit).

The table is row-based rather than tier-based: each row has an item level, modifier text and a
spawn weight for every item class it can roll on. The scraper groups rows by normalized text plus
their exact item-class set, so separate versions of the same wording (for example attack speed on
gloves, bows and wands) keep their own weights and item levels.

### Features

- Search modifier text, item classes and categories, or filter by category chips and an exact item
  class dropdown.
- Sort by name or highest item level.
- Expand a modifier to see every item-level variant; **Values** / **Full text** switches the
  compact numeric view.
- Pick an item class to show its spawn weight on every variant. T1 is the highest item level, not a
  formal in-game tier.
- A synthetic all-class block of map outcomes and passive-tree notables is excluded because those
  rows are not item corruption implicits.

## Development

```sh
pnpm install
pnpm dev      # http://localhost:5173
pnpm check    # svelte-check + tsc (app, configs and scrapers)
pnpm build
pnpm preview
```

The dev server serves the home page at `/`, the Eldritch browser at `/mods/`, and the corrupted
browser at `/corrupted/`.

## Deployment

Pushes to `master` are built and published to GitHub Pages by
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): the workflow installs with pnpm,
runs `pnpm check` and `pnpm build`, then uploads `dist` through `actions/deploy-pages`. This is a
user page (`maximvl.github.io`), so Vite's default `/` base is correct and `dist/mods/index.html`
and `dist/corrupted/index.html` are reachable at `/mods/` and `/corrupted/`.

The same repository also deploys to Cloudflare Pages. `wrangler.jsonc` is a Pages configuration
file (`name`, `pages_build_output_dir`, `compatibility_date`), so Pages serves `./dist`, not the
repository root. Pages does not read the build command from a Wrangler file, so the project must
have **Build command** `pnpm build` set in the dashboard (Settings → Build & deployments). Without
it the build step is skipped and the untranspiled `index.html` / `src/main.ts` is deployed, which
leaves the page blank.

## Data

The Eldritch dataset lives in `src/lib/data/eldritch.json`; the corrupted dataset lives in
`src/lib/data/corrupted.json`. Refresh either one with:

```sh
pnpm data:all                                        # scrape both poedb pages
pnpm data                                            # Eldritch only
pnpm data:corrupted                                  # corrupted implicits only
node scripts/build-data.ts --from-file page.html    # parse a saved Eldritch page
node scripts/build-corrupted-data.ts --from-file page.html
```

The scrapers are TypeScript and run directly through Node's native type stripping
(Node 23.6+; no build step).

The Eldritch scraper groups rows by their internal mod id (dropping the tier suffix), normalises
the modifier text into a display name, extracts tier / level / spawn weights, and repairs the
handful of rows where poedb omits the mod-id tooltip. The corrupted scraper groups rows by
normalized text and item-class set instead, because that table has no mod-id tooltips. Re-run them
when poedb updates for a new patch.

## Structure

```
index.html                       project index entry page
mods/index.html                  Eldritch browser entry page
corrupted/index.html             corrupted browser entry page
src/App.svelte                   project index (Tailwind utility classes)
src/app.css                      shared theme, Tailwind theme tokens and keyframes
src/Mods.svelte                  Eldritch filters, search and card grid
src/Corrupted.svelte             corrupted filters, search and card grid
src/main.ts                      mounts the project index
src/mods.ts                      mounts the Eldritch browser
src/corrupted.ts                 mounts the corrupted browser
src/lib/projects.ts              project index links
src/lib/ModCard.svelte           one Eldritch modifier group with its tier table
src/lib/CorruptedCard.svelte     one corrupted modifier with its item-level variants
src/lib/labels.ts                shared value-formatting helpers
src/lib/item-classes.ts          item classes and category metadata
src/lib/types.ts                 dataset interfaces (SourceKey, SlotKey, TierEntry…)
src/lib/data.ts                  typed import of the Eldritch JSON
src/lib/corrupted-data.ts        typed import of the corrupted JSON
src/lib/data/eldritch.json       generated Eldritch dataset
src/lib/data/corrupted.json      generated corrupted dataset
scripts/build-data.ts            Eldritch scraper + grouping logic
scripts/build-corrupted-data.ts  corrupted scraper + grouping logic
tsconfig.json                    project references (app + node)
tsconfig.app.json                app/component config
tsconfig.node.json               config files + scraper config
```
