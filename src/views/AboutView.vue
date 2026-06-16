<script setup>
import { useI18n } from 'vue-i18n'
import SectionEyebrow from '../components/SectionEyebrow.vue'
import { useReveal } from '../composables/useReveal.js'

const { t, tm } = useI18n()
const team = tm('about.team')
const timeline = tm('about.timeline')
const values = tm('about.values.items')
const collab = tm('about.collaborate.items')

// Distinct line-icons for the three principles.
const valueIcons = [
  'M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z',          // precision — star/compass
  'M8 12a4 4 0 1 0 0-0.01 M16 12a4 4 0 1 0 0-0.01 M9.5 12h5',        // partnership — linked rings
  'M4 6l8-3 8 3-8 3-8-3z M4 6v6a8 4 0 0 0 16 0V6',                   // pedagogy — mortarboard
]

// Distinct line-icons for the three collaboration tracks.
const collabIcons = [
  'M3 21V8l9-5 9 5v13 M9 21v-6h6v6 M3 21h18',                        // manufacturers — factory/building
  'M12 3l9 5-9 5-9-5 9-5z M5 11v5a7 4 0 0 0 14 0v-5',                // institutions — campus
  'M5 5h14v10H5z M9 19h6 M12 15v4',                                  // educators — board/screen
]

useReveal()
</script>

<template>
  <div class="about-page">
    <!-- ───────────────────────── Hero ───────────────────────── -->
    <section class="relative overflow-hidden py-28 md:py-40 bg-parchment-light text-center">
      <div class="about-hero-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
      <div class="about-hero-pool pointer-events-none absolute inset-0" aria-hidden="true"></div>
      <div class="relative max-w-5xl mx-auto px-8">
        <SectionEyebrow :text="t('about.hero.eyebrow')" />
        <h1 class="font-serif font-light text-5xl md:text-7xl text-ink tracking-wide mt-8 leading-[1.05]">
          {{ t('about.hero.title') }}
        </h1>
        <p class="reveal mt-12 max-w-2xl mx-auto font-serif italic font-light text-2xl md:text-3xl text-ink-soft leading-snug tracking-wide">
          {{ t('about.pullquote') }}
        </p>
      </div>
    </section>

    <!-- ───────────────────────── Story ───────────────────────── -->
    <section class="py-20 md:py-32 bg-parchment">
      <div class="max-w-6xl mx-auto px-8 grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
        <div class="reveal">
          <p class="text-[11px] uppercase tracking-[0.35em] text-gold-dark font-light mb-4">{{ t('about.story.eyebrow') }}</p>
          <h2 class="font-serif font-light text-4xl md:text-5xl text-ink tracking-wide leading-tight">{{ t('about.story.title') }}</h2>
          <div class="h-px w-12 bg-gold my-8"></div>
          <p class="text-ink-soft font-light leading-loose text-[15px]">{{ t('about.story.body') }}</p>
        </div>
        <div class="reveal flex justify-center" style="transition-delay: 120ms">
          <div class="relative rounded-2xl border border-parchment-deep/70 bg-parchment-light p-10 lux-card">
            <svg viewBox="0 0 320 320" class="w-64 md:w-80 text-ink-hint" fill="none" stroke="currentColor" stroke-width="0.5">
              <circle cx="160" cy="160" r="120" />
              <circle cx="160" cy="160" r="80" />
              <circle cx="160" cy="160" r="40" />
              <path d="M40 160 L120 160 M200 160 L280 160 M160 40 L160 120 M160 200 L160 280" />
              <path d="M85 85 L135 135 M185 135 L235 85 M85 235 L135 185 M185 185 L235 235" />
              <circle cx="160" cy="160" r="3" fill="currentColor" />
              <circle cx="40" cy="160" r="2.5" fill="currentColor" />
              <circle cx="280" cy="160" r="2.5" fill="currentColor" />
              <circle cx="160" cy="40" r="2.5" fill="currentColor" />
              <circle cx="160" cy="280" r="2.5" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────────────────────── Principles ───────────────────────── -->
    <section class="py-20 md:py-32 bg-parchment-light">
      <div class="max-w-6xl mx-auto px-8">
        <div class="reveal text-center mb-16">
          <SectionEyebrow :text="t('about.values.title')" />
        </div>
        <div class="grid md:grid-cols-3 gap-6 lg:gap-8">
          <div
            v-for="(v, i) in values" :key="v.title"
            class="reveal group rounded-2xl border border-parchment-deep/70 bg-parchment p-9 md:p-10 lux-card hover:-translate-y-1"
            :style="{ transitionDelay: `${i * 90}ms` }"
          >
            <span class="grid place-items-center w-12 h-12 rounded-xl border border-gold/40 bg-gold/5 text-gold-dark transition-colors group-hover:border-gold/70">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path :d="valueIcons[i]" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <h3 class="mt-7 font-serif font-light text-2xl text-ink leading-snug">{{ v.title }}</h3>
            <div class="h-px w-9 bg-gold/50 my-5"></div>
            <p class="text-sm text-ink-soft font-light leading-relaxed">{{ v.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────────────────────── Mission & Vision ───────────────────────── -->
    <section class="py-20 md:py-32 bg-parchment">
      <div class="max-w-5xl mx-auto px-8">
        <div class="rounded-2xl border border-parchment-deep/70 bg-parchment-light p-10 md:p-16 lux-card grid md:grid-cols-2 gap-12 md:gap-0 md:divide-x divide-gold/30 rtl:md:divide-x-reverse">
          <div class="reveal md:pe-14">
            <p class="text-[11px] uppercase tracking-[0.35em] text-gold-dark font-light mb-5">{{ t('about.mission.title') }}</p>
            <h3 class="font-serif font-light text-2xl md:text-3xl text-ink leading-snug">{{ t('about.mission.desc') }}</h3>
          </div>
          <div class="reveal md:ps-14" style="transition-delay: 120ms">
            <p class="text-[11px] uppercase tracking-[0.35em] text-gold-dark font-light mb-5">{{ t('about.vision.title') }}</p>
            <h3 class="font-serif font-light text-2xl md:text-3xl text-ink leading-snug">{{ t('about.vision.desc') }}</h3>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────────────────────── Team ───────────────────────── -->
    <section class="py-20 md:py-32 bg-parchment-light">
      <div class="max-w-5xl mx-auto px-8">
        <div class="reveal text-center mb-16">
          <SectionEyebrow :text="t('about.teamTitle')" />
        </div>
        <div class="grid sm:grid-cols-3 gap-6 lg:gap-8">
          <div v-for="(m, i) in team" :key="m.name"
               class="reveal group rounded-xl border border-parchment-deep/70 bg-parchment p-10 text-center lux-card hover:-translate-y-1"
               :style="{ transitionDelay: `${i * 80}ms` }">
            <div class="w-24 h-24 mx-auto rounded-full border border-gold/40 bg-gold/5 flex items-center justify-center transition-colors group-hover:border-gold/70">
              <span class="font-serif font-light text-2xl text-gold-dark">{{ m.initials }}</span>
            </div>
            <h4 class="mt-7 font-serif font-light text-xl text-ink">{{ m.name }}</h4>
            <p class="mt-2 text-[11px] uppercase tracking-[0.3em] text-ink-muted font-light">{{ m.role }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────────────────────── Collaborate with us ─────────────────────────
         Premium dark editorial band: glassmorphic tracks over a charcoal slab
         with a soft gold/jade aura. -->
    <section class="py-20 md:py-32 bg-parchment">
      <div class="max-w-6xl mx-auto px-8">
        <div class="collab-panel reveal relative overflow-hidden rounded-[1.75rem] p-10 md:p-16">
          <div class="collab-aura pointer-events-none absolute inset-0" aria-hidden="true"></div>
          <div class="collab-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>

          <div class="relative text-center max-w-2xl mx-auto">
            <span class="inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.35em] text-gold-light/90 font-light">
              <span class="h-px w-8 bg-gold-light/60"></span>
              {{ t('about.collaborate.eyebrow') }}
              <span class="h-px w-8 bg-gold-light/60"></span>
            </span>
            <h2 class="mt-7 font-serif font-light text-4xl md:text-5xl text-[#F7F2E9] tracking-wide leading-[1.1]">
              {{ t('about.collaborate.title') }}
            </h2>
            <p class="mt-6 text-sm md:text-base text-[#D9D2C5]/75 font-light leading-relaxed">
              {{ t('about.collaborate.desc') }}
            </p>
          </div>

          <div class="relative mt-14 grid md:grid-cols-3 gap-5 lg:gap-6">
            <div
              v-for="(c, i) in collab" :key="c.title"
              class="collab-tile group rounded-2xl p-8 flex flex-col"
            >
              <span class="collab-tile-icon grid place-items-center w-12 h-12 rounded-xl">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path :d="collabIcons[i]" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              <h3 class="mt-6 font-serif font-light text-xl text-[#F4EFE6] leading-snug">{{ c.title }}</h3>
              <p class="mt-3 text-sm text-[#D9D2C5]/70 font-light leading-relaxed">{{ c.desc }}</p>
            </div>
          </div>

          <div class="relative mt-14 text-center">
            <router-link to="/contact" class="collab-cta group">
              <span>{{ t('about.collaborate.cta') }}</span>
              <span class="collab-cta-arrow" aria-hidden="true">→</span>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────────────────────── Timeline ───────────────────────── -->
    <section class="py-20 md:py-32 bg-parchment-light">
      <div class="max-w-3xl mx-auto px-8">
        <div class="reveal text-center mb-16">
          <SectionEyebrow :text="t('about.timelineTitle')" />
        </div>
        <div class="timeline-rail space-y-12">
          <div v-for="(item, i) in timeline" :key="i" class="relative reveal" :style="{ transitionDelay: `${i * 60}ms` }">
            <span class="timeline-dot"></span>
            <div class="font-serif font-light text-gold-dark text-2xl mb-1.5 tabular-nums">{{ item.year }}</div>
            <p class="text-ink-soft font-light leading-relaxed">{{ item.event }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-hero-grid {
  background-image: repeating-linear-gradient(90deg, transparent 0, transparent 119px, rgba(184, 146, 42, 0.035) 119px, rgba(184, 146, 42, 0.035) 120px);
}
.about-hero-pool {
  background: radial-gradient(50% 60% at 50% 0%, rgba(184, 146, 42, 0.06), transparent 70%);
}

/* ── Collaborate-with-us — premium dark editorial band ─────────────────────── */
.collab-panel {
  background: linear-gradient(160deg, #333b46 0%, #20242b 52%, #14110d 100%);
  border: 1px solid rgba(237, 192, 113, 0.18);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.05) inset, 0 44px 100px -45px rgba(0, 0, 0, 0.7);
}
.collab-aura {
  background: radial-gradient(55% 60% at 20% 0%, rgba(122, 196, 168, 0.1), transparent 60%),
              radial-gradient(60% 70% at 85% 10%, rgba(237, 192, 113, 0.12), transparent 62%);
}
.collab-grid {
  background-image: repeating-linear-gradient(90deg, transparent 0, transparent 79px, rgba(244, 215, 145, 0.03) 79px, rgba(244, 215, 145, 0.03) 80px);
  -webkit-mask-image: linear-gradient(180deg, #000, transparent 88%);
          mask-image: linear-gradient(180deg, #000, transparent 88%);
}

/* Glassmorphic collaboration tiles. */
.collab-tile {
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.08);
  -webkit-backdrop-filter: blur(6px);
          backdrop-filter: blur(6px);
  transition: background 300ms ease, border-color 300ms ease, transform 300ms ease;
}
.collab-tile:hover {
  background: rgba(237, 192, 113, 0.06);
  border-color: rgba(237, 192, 113, 0.3);
  transform: translateY(-3px);
}
.collab-tile-icon {
  color: #EAC079;
  background: rgba(237, 192, 113, 0.1);
  border: 1px solid rgba(237, 192, 113, 0.28);
  transition: background 300ms ease, color 300ms ease;
}
.collab-tile:hover .collab-tile-icon {
  background: rgba(237, 192, 113, 0.9);
  color: #14110d;
}

/* Gold CTA pill. */
.collab-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.95rem 2.25rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #EAC079 0%, #C79A3E 100%);
  color: #14110d;
  font-size: 0.72rem;
  font-weight: 400;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  box-shadow: 0 16px 36px -16px rgba(237, 192, 113, 0.6);
  transition: box-shadow 280ms ease, transform 280ms ease, filter 280ms ease;
}
.collab-cta:hover {
  filter: brightness(1.06);
  transform: translateY(-2px);
  box-shadow: 0 22px 48px -16px rgba(237, 192, 113, 0.72);
}
.collab-cta-arrow { transition: transform 280ms ease; }
.collab-cta:hover .collab-cta-arrow { transform: translateX(4px); }
html[lang='fa'] .collab-cta { letter-spacing: 0; font-family: 'YekanBakh', sans-serif; }
html[dir='rtl'] .collab-cta-arrow { transform: scaleX(-1); }
html[dir='rtl'] .collab-cta:hover .collab-cta-arrow { transform: scaleX(-1) translateX(4px); }
</style>
