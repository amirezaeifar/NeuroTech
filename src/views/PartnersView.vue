<script setup>
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useReveal } from '../composables/useReveal.js'

const { t, tm } = useI18n()
const route = useRoute()

const people = computed(() => tm('partners.people'))

const initials = (name) => name
  .replace(/^(Dr\.|د\.|دکتر|Dr|Prof\.?)\s*/i, '')
  .trim()
  .split(/\s+/)
  .map((w) => w[0])
  .slice(0, 2)
  .join('')
  .toUpperCase()

// ── Deep-link focus: /partners?focus=<index> (e.g. from an event speaker card)
//    scrolls to the matching profile and briefly highlights it. ──────────────
const highlightIndex = ref(null)
const focusProfile = async (raw) => {
  const idx = Number(raw)
  if (!Number.isInteger(idx) || idx < 0 || idx >= people.value.length) return
  await nextTick()
  const el = document.getElementById('partner-' + idx)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  highlightIndex.value = idx
  window.setTimeout(() => { if (highlightIndex.value === idx) highlightIndex.value = null }, 2800)
}
onMounted(() => { if (route.query.focus != null) focusProfile(route.query.focus) })
watch(() => route.query.focus, (v) => { if (v != null) focusProfile(v) })

useReveal()
</script>

<template>
  <div class="partners-page">
    <!-- ───────────────────────── Hero ───────────────────────── -->
    <section class="relative overflow-hidden bg-ink py-28 md:py-40">
      <div class="partners-hero-glow pointer-events-none absolute inset-0" aria-hidden="true"></div>
      <div class="relative max-w-5xl mx-auto px-8 text-center">
        <p class="text-[11px] uppercase tracking-[0.4em] text-gold/80 font-light mb-7">
          {{ t('partners.hero.eyebrow') }}
        </p>
        <h1 class="font-serif font-light text-parchment-light text-5xl md:text-7xl tracking-wide leading-[1.05]">
          {{ t('partners.hero.title') }}
        </h1>
        <div class="mx-auto mt-10 h-px w-24 bg-gold"></div>
      </div>
    </section>

    <!-- ───────────────────────── Intro ───────────────────────── -->
    <section class="bg-parchment-light pt-20 md:pt-28">
      <p class="reveal max-w-2xl mx-auto px-8 text-center font-serif italic font-light text-2xl md:text-[2rem] text-ink-soft leading-relaxed">
        {{ t('partners.intro') }}
      </p>
    </section>

    <!-- ───────────────────────── Profiles ───────────────────────── -->
    <section class="py-20 md:py-28 bg-parchment-light">
      <div class="max-w-6xl mx-auto px-8">
        <div class="grid lg:grid-cols-2 gap-6 lg:gap-8">
          <article
            v-for="(p, i) in people" :key="p.name + i"
            :id="`partner-${i}`"
            class="reveal partner-card group relative scroll-mt-28 overflow-hidden rounded-xl border border-parchment-deep/70 bg-parchment p-8 md:p-10 lux-card flex flex-col sm:flex-row gap-7"
            :class="{ 'is-focused': highlightIndex === i }"
            :style="{ transitionDelay: `${(i % 6) * 60}ms` }"
          >
            <div class="relative shrink-0 mx-auto sm:mx-0">
              <div class="w-20 h-20 rounded-full border border-gold/40 bg-gold/5 flex items-center justify-center">
                <span class="font-serif font-light text-2xl text-gold-dark">{{ initials(p.name) }}</span>
              </div>
            </div>

            <div class="relative flex-1 text-center sm:text-start">
              <h3 class="font-serif font-light text-2xl text-ink leading-snug group-hover:text-gold-dark transition-colors">{{ p.name }}</h3>

              <dl class="mt-4 space-y-3">
                <div class="flex flex-col gap-0.5">
                  <dt class="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-light">{{ t('partners.labels.qualification') }}</dt>
                  <dd class="text-sm text-ink-soft font-light leading-snug">{{ p.qualification }}</dd>
                </div>
                <div class="flex flex-col gap-0.5">
                  <dt class="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-light">{{ t('partners.labels.council') }}</dt>
                  <dd class="text-sm text-ink-soft font-light tracking-wide tabular-nums">{{ p.councilNumber }}</dd>
                </div>
              </dl>

              <div class="mt-4">
                <span class="text-[10px] uppercase tracking-[0.25em] text-ink-muted font-light">{{ t('partners.labels.collaborations') }}</span>
                <div class="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                  <span
                    v-for="(c, j) in p.collaborations" :key="j"
                    class="text-[11px] px-3 py-1 rounded-full border border-parchment-deep text-ink-soft font-light tracking-wide"
                  >{{ c }}</span>
                </div>
              </div>

              <p class="mt-5 text-sm text-ink-soft font-light leading-relaxed">{{ p.bio }}</p>
            </div>
          </article>
        </div>

        <!-- CTA -->
        <div class="reveal mt-24 max-w-2xl mx-auto rounded-2xl border border-parchment-deep/70 bg-parchment p-12 md:p-16 text-center lux-card">
          <span class="text-gold text-sm">&#9670;</span>
          <h2 class="mt-4 font-serif font-light text-3xl md:text-4xl text-ink tracking-wide">{{ t('partners.cta.title') }}</h2>
          <p class="mt-4 text-sm text-ink-soft font-light leading-relaxed">{{ t('partners.cta.desc') }}</p>
          <router-link to="/contact" class="btn-ghost-gold mt-9 inline-flex">
            {{ t('partners.cta.button') }} <span aria-hidden="true">→</span>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.partners-hero-glow { background: radial-gradient(60% 80% at 50% 0%, rgba(237, 192, 113, 0.12), transparent 70%); }

/* Deep-link highlight — a gold ring + gentle pulse when arriving via
   /partners?focus=<index>. */
.partner-card.is-focused {
  border-color: rgb(var(--c-gold));
  box-shadow: 0 0 0 2px rgb(var(--c-gold) / 0.55), 0 30px 60px -24px rgb(2 6 12 / 0.5);
  animation: partner-pulse 2.6s ease-out;
}
@keyframes partner-pulse {
  0% { box-shadow: 0 0 0 0 rgb(var(--c-gold) / 0.5), 0 30px 60px -24px rgb(2 6 12 / 0.5); }
  18% { box-shadow: 0 0 0 6px rgb(var(--c-gold) / 0.28), 0 30px 60px -24px rgb(2 6 12 / 0.5); }
  100% { box-shadow: 0 0 0 2px rgb(var(--c-gold) / 0.45), 0 30px 60px -24px rgb(2 6 12 / 0.5); }
}
@media (prefers-reduced-motion: reduce) {
  .partner-card.is-focused { animation: none; }
}
</style>
