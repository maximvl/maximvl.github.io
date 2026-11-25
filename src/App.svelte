<script lang="ts">
  import { projects } from './lib/projects';
</script>

<div class="page">
  <header class="masthead">
    <p class="handle">mapcar</p>
    <h1>Projects</h1>
    <p class="lede">Apps, tools and experiments I build and maintain.</p>
  </header>

  <main class="grid" aria-label="Projects">
    {#each projects as project (project.href)}
      <a
        class="project"
        class:internal={!project.external}
        href={project.href}
        style="--accent: {project.accent}"
        target={project.external ? '_blank' : undefined}
        rel={project.external ? 'noreferrer' : undefined}
      >
        <span class="mark" aria-hidden="true">{project.mark}</span>

        <span class="body">
          <span class="name">{project.name}</span>
          <span class="location">{project.location}</span>
        </span>

        <span class="arrow" aria-hidden="true">
          {#if project.external}
            <svg viewBox="0 0 24 24">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          {:else}
            <svg viewBox="0 0 24 24">
              <path d="M4 12h15M13 6l6 6-6 6" />
            </svg>
          {/if}
        </span>

        {#if project.external}
          <span class="sr-only">(opens in a new tab)</span>
        {/if}
      </a>
    {/each}
  </main>

  <footer>
    <span>mapcar</span>
  </footer>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    max-width: 940px;
    margin: 0 auto;
    padding: clamp(2.5rem, 8vh, 6rem) clamp(1rem, 4vw, 2rem) 2.5rem;
  }

  .masthead {
    margin-bottom: clamp(1.75rem, 5vw, 3rem);
  }

  .handle {
    margin: 0 0 0.85rem;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--gold);
  }

  h1 {
    margin: 0;
    font-size: clamp(2.3rem, 6vw, 3.6rem);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--text-bright);
  }

  .lede {
    margin: 0.9rem 0 0;
    max-width: 52ch;
    color: var(--muted);
    font-size: 1rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.7rem;
  }

  .project {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.9rem;
    padding: 1rem 1.1rem;
    color: inherit;
    text-decoration: none;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    transition:
      transform 0.16s ease,
      border-color 0.16s ease,
      background 0.16s ease;
  }

  /* Accent rail on the leading edge. */
  .project::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 2px;
    background: var(--accent);
    opacity: 0.55;
    transition: opacity 0.16s ease;
  }

  .project:hover {
    text-decoration: none;
    transform: translateY(-2px);
    background: color-mix(in srgb, var(--accent) 7%, var(--surface));
    border-color: color-mix(in srgb, var(--accent) 55%, var(--border));
  }

  .project:hover::before {
    opacity: 1;
  }

  .project:focus-visible {
    outline-color: var(--accent);
  }

  .project.internal {
    grid-column: 1 / -1;
    border-color: color-mix(in srgb, var(--gold) 32%, var(--border));
  }

  .mark {
    flex: none;
    display: grid;
    place-items: center;
    width: 2.6rem;
    height: 2.6rem;
    border-radius: 9px;
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    background: color-mix(in srgb, var(--accent) 16%, transparent);
    color: var(--accent);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.06em;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
    flex: 1 1 auto;
  }

  .name {
    color: var(--text-bright);
    font-size: 1.02rem;
    font-weight: 600;
  }

  .location {
    overflow: hidden;
    color: var(--muted);
    font-size: 0.78rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .arrow {
    flex: none;
    display: grid;
    place-items: center;
    width: 1.4rem;
    height: 1.4rem;
    color: var(--muted);
    transition:
      transform 0.16s ease,
      color 0.16s ease;
  }

  .arrow svg {
    width: 100%;
    height: 100%;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .project:hover .arrow {
    color: var(--accent);
  }

  .project:not(.internal):hover .arrow {
    transform: translate(2px, -2px);
  }

  .project.internal:hover .arrow {
    transform: translateX(3px);
  }

  footer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: auto;
    padding-top: 2.5rem;
    color: var(--muted);
    font-size: 0.78rem;
  }

  @media (max-width: 640px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
