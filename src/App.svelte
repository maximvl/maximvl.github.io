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
        Apps, tools and experiments I build and maintain. Choose a destination to explore.
      </p>
    </header>

    <div class="mb-4 flex items-center justify-between border-t border-line/80 pt-4">
      <p class="font-mono text-[0.65rem] tracking-[0.22em] text-muted uppercase">Project index</p>
      <p class="font-mono text-[0.65rem] tracking-[0.18em] text-muted/70 uppercase">
        {String(projects.length).padStart(2, '0')} entries
      </p>
    </div>

    <main aria-label="Projects">
      <ol class="border-b border-line/80">
        {#each projects as project, i (project.href)}
          <li
            class="border-t border-line/80 motion-safe:animate-[rise_0.65s_cubic-bezier(0.22,1,0.36,1)_both]"
            style="animation-delay: {140 + i * 75}ms"
          >
            <a
              class="group relative grid grid-cols-[1.5rem_2.75rem_minmax(0,1fr)_1.25rem] items-center gap-x-3 overflow-hidden px-1 py-5 transition-colors duration-300 hover:bg-white/[0.018] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-base sm:grid-cols-[2.5rem_3.5rem_minmax(0,1fr)_10rem_1.5rem] sm:gap-x-5 sm:px-3 sm:py-7"
              href={project.href}
              style="--accent: {project.accent}"
              target={project.external ? '_blank' : undefined}
              rel={project.external ? 'noreferrer' : undefined}
            >
              <span
                class="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_150%_at_0%_50%,color-mix(in_srgb,var(--accent)_16%,transparent),transparent_74%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                aria-hidden="true"
              ></span>
              <span
                class="pointer-events-none absolute inset-y-4 left-0 w-px origin-top scale-y-0 bg-[var(--accent)] transition-transform duration-500 group-hover:scale-y-100"
                aria-hidden="true"
              ></span>
              <span
                class="pointer-events-none absolute -right-2 -bottom-8 font-serif text-[7rem] leading-none text-[var(--accent)] opacity-[0.025] transition duration-500 select-none group-hover:translate-x-1 group-hover:opacity-[0.05] sm:text-[9rem]"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              <span
                class="relative font-mono text-[0.6rem] tracking-[0.14em] text-muted/60 transition-colors duration-300 group-hover:text-[var(--accent)] sm:text-xs"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              <span
                class="relative grid size-11 place-items-center rounded-full border border-[color-mix(in_srgb,var(--accent)_42%,transparent)] bg-[color-mix(in_srgb,var(--accent)_9%,transparent)] text-[0.65rem] font-bold tracking-[0.14em] text-[var(--accent)] transition duration-300 group-hover:-rotate-6 group-hover:scale-105 group-hover:border-[var(--accent)] sm:size-14"
                aria-hidden="true"
              >
                <span class="absolute inset-1 rounded-full border border-current opacity-15"></span>
                {project.mark}
              </span>

              <span class="relative min-w-0">
                <span
                  class="block truncate font-serif text-[1.35rem] leading-tight font-medium tracking-[-0.015em] text-bright transition-transform duration-300 group-hover:translate-x-1 sm:text-[1.65rem]"
                >
                  {project.name}
                </span>
                <span
                  class="mt-1.5 block truncate font-mono text-[0.65rem] text-muted sm:hidden"
                >
                  {project.location}
                </span>
              </span>

              <span
                class="relative hidden truncate text-right font-mono text-xs text-muted sm:block"
              >
                {project.location}
              </span>

              <span
                class="relative grid size-6 place-items-center text-muted transition duration-300 group-hover:translate-x-1 group-hover:text-[var(--accent)] {project.external
                  ? 'group-hover:-translate-y-0.5'
                  : ''}"
                aria-hidden="true"
              >
                {#if project.external}
                  <svg
                    class="size-4 fill-none stroke-current stroke-1.5 [stroke-linecap:round] [stroke-linejoin:round] sm:size-5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                {:else}
                  <svg
                    class="size-4 fill-none stroke-current stroke-1.5 [stroke-linecap:round] [stroke-linejoin:round] sm:size-5"
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
          </li>
        {/each}
      </ol>
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
