<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import LuxeCard from '../components/LuxeCard.vue'
import { useReveal } from '../composables/useReveal.js'

const { t, tm } = useI18n()

const people = computed(() => tm('partners.people'))

const initials = (name) => name
  .replace(/^(Dr\.|د\.|دکتر|Dr|Prof\.?)\s*/i, '')
  .trim()
  .split(/\s+/)
  .map((w) => w[0])
  .slice(0, 2)
  .join('')
  .toUpperCase()

useReveal()
</script>

<template>
  <div>
    <section class="bg-ink py-20 md:py-28">
      <div class="max-w-5xl mx-auto px-8 text-center">
        <p class="text-[11px] uppercase tracking-[0.35em] text-gold/80 font-light mb-6">
          {{ t('partners.hero.eyebrow') }}
        </p>
        <h1 class="font-serif font-light text-parchment-light text-5xl md:text-6xl tracking-wide">
          {{ t('partners.hero.title') }}
        </h1>
        <div class="mx-auto mt-10 h-px w-24 bg-gold"></div>
      </div>
    </section>

    <section class="py-16 md:py-24 bg-parchment-light">
      <div class="max-w-5xl mx-auto px-8">
        <p class="reveal max-w-2xl mx-auto text-center font-serif italic font-light text-2xl text-ink-soft leading-relaxed">
          {{ t('partners.intro') }}
        </p>

        <!-- Flat grid of profiles -->
        <div class="mt-16 grid md:grid-cols-2 gap-8">
          <LuxeCard
            v-for="(p, i) in people" :key="p.name + i"
            class="reveal flex flex-col sm:flex-row gap-7"
            :style="{ transitionDelay: `${(i % 6) * 60}ms` }"
          >
            <div class="shrink-0 w-20 h-20 rounded-full border border-gold/40 flex items-center justify-center mx-auto sm:mx-0">
              <span class="font-serif font-light text-2xl text-gold-dark">{{ initials(p.name) }}</span>
            </div>
            <div class="flex-1 text-center sm:text-start">
              <h3 class="font-serif font-light text-xl text-ink">{{ p.name }}</h3>

              <dl class="mt-3 space-y-1.5">
                <div class="flex flex-col gap-0.5">
                  <dt class="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-light">{{ t('partners.labels.qualification') }}</dt>
                  <dd class="text-sm text-ink-soft font-light leading-snug">{{ p.qualification }}</dd>
                </div>
                <div class="flex flex-col gap-0.5">
                  <dt class="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-light">{{ t('partners.labels.council') }}</dt>
                  <dd class="text-sm text-ink-soft font-light tracking-wide">{{ p.councilNumber }}</dd>
                </div>
              </dl>

              <div class="mt-4">
                <span class="text-[10px] uppercase tracking-[0.25em] text-ink-muted font-light">{{ t('partners.labels.collaborations') }}</span>
                <div class="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                  <span
                    v-for="(c, j) in p.collaborations" :key="j"
                    class="text-xs px-3 py-1 bg-parchment-dark text-ink-soft font-light tracking-wide"
                  >{{ c }}</span>
                </div>
              </div>

              <p class="mt-4 text-sm text-ink-soft font-light leading-relaxed">{{ p.bio }}</p>
            </div>
          </LuxeCard>
        </div>

        <!-- CTA -->
        <div class="reveal mt-20 text-center max-w-xl mx-auto">
          <h2 class="font-serif font-light text-3xl text-ink tracking-wide">{{ t('partners.cta.title') }}</h2>
          <p class="mt-4 text-sm text-ink-soft font-light leading-relaxed">{{ t('partners.cta.desc') }}</p>
          <router-link to="/contact" class="btn-ghost-gold mt-8 inline-flex">
            {{ t('partners.cta.button') }} <span aria-hidden="true">→</span>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>
