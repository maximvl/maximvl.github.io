<script lang="ts">
  import { projects } from './lib/projects';
</script>

<div class="relative min-h-dvh overflow-hidden">
  <!-- Ambient background -->
  <div class="pointer-events-none absolute inset-0" aria-hidden="true">
    <div
      class="absolute -left-40 -top-48 size-[38rem] rounded-full bg-gold/10 blur-3xl motion-safe:animate-[drift_18s_ease-in-out_infinite]"
    ></div>
    <div
      class="absolute -right-48 -top-32 size-[34rem] rounded-full bg-eater/10 blur-3xl motion-safe:animate-[drift_24s_ease-in-out_infinite_reverse]"
    ></div>
    <div
      class="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.045)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_72%)]"
    ></div>
  </div>

  <div class="relative mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-5 py-16 sm:px-8 sm:py-24">
    <header class="mb-14">
      <p
        class="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[0.7rem] font-semibold tracking-[0.24em] text-gold uppercase"
      >
        <span class="relative flex size-1.5" aria-hidden="true">
          <span
            class="absolute inline-flex size-full rounded-full bg-gold opacity-70 motion-safe:animate-ping"
          ></span>
          <span class="relative inline-flex size-1.5 rounded-full bg-gold"></span>
        </span>
        mapcar
      </p>

      <h1
        class="mt-6 bg-[linear-gradient(105deg,#eef3fa_8%,#c8a24a_45%,#38b6a6_88%)] bg-clip-text text-6xl font-black tracking-[-0.045em] text-transparent [background-size:200%_auto] motion-safe:animate-[shimmer_12s_linear_infinite] sm:text-8xl"
      >
        Projects
      </h1>

      <p class="mt-5 max-w-xl text-base text-pretty text-muted sm:text-lg">
        Apps, tools and experiments I build and maintain. Pick a card to dive in.
      </p>
    </header>

    <main class="grid gap-4 sm:grid-cols-2" aria-label="Projects">
      {#each projects as project, i (project.href)}
        <a
          class="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-panel/70 p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--accent)_55%,transparent)] hover:shadow-[0_26px_65px_-24px_color-mix(in_srgb,var(--accent)_75%,transparent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-base focus-visible:outline-none motion-safe:animate-[rise_0.65s_cubic-bezier(0.22,1,0.36,1)_both] {project.external
            ? ''
            : 'sm:col-span-2'}"
          href={project.href}
          style="--accent: {project.accent}; animation-delay: {140 + i * 75}ms"
          target={project.external ? '_blank' : undefined}
          rel={project.external ? 'noreferrer' : undefined}
        >
          <span
            class="pointer-events-none absolute inset-0 bg-[radial-gradient(130%_130%_at_0%_0%,color-mix(in_srgb,var(--accent)_17%,transparent),transparent_58%)] opacity-60 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden="true"
          ></span>
          <span
            class="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-[var(--accent)] opacity-70 transition-all duration-300 group-hover:w-1"
            aria-hidden="true"
          ></span>

          <span
            class="relative grid size-14 flex-none place-items-center rounded-xl border border-[color-mix(in_srgb,var(--accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[0.8rem] font-black tracking-[0.08em] text-[var(--accent)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
            aria-hidden="true"
          >
            {project.mark}
          </span>

          <span class="relative min-w-0 flex-1">
            <span class="block text-lg font-semibold tracking-tight text-bright">
              {project.name}
            </span>
            <span class="mt-0.5 block truncate text-sm text-muted">{project.location}</span>
          </span>

          <span
            class="relative grid size-8 flex-none place-items-center text-muted transition-all duration-300 group-hover:text-[var(--accent)] {project.external
              ? 'group-hover:-translate-y-1 group-hover:translate-x-1'
              : 'group-hover:translate-x-1.5'}"
            aria-hidden="true"
          >
            {#if project.external}
              <svg
                class="size-5 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
                viewBox="0 0 24 24"
              >
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            {:else}
              <svg
                class="size-5 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
                viewBox="0 0 24 24"
              >
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

    <footer class="mt-auto flex items-center justify-end gap-2 pt-16 text-xs text-muted">
      <span
        class="size-1.5 rounded-full bg-[linear-gradient(90deg,var(--gold),var(--eater))]"
        aria-hidden="true"
      ></span>
      mapcar
    </footer>
  </div>
</div>
