<script setup>
import { useI18n } from 'vue-i18n'
import SectionEyebrow from '../components/SectionEyebrow.vue'
import { useReveal } from '../composables/useReveal.js'

const { t, tm } = useI18n()
const team = tm('about.team')
const timeline = tm('about.timeline')

useReveal()
</script>

<template>
  <div>
    <!-- Header -->
    <section class="py-20 md:py-28 bg-parchment-light text-center">
      <div class="max-w-5xl mx-auto px-8">
        <SectionEyebrow :text="t('about.hero.eyebrow')" />
        <h1 class="font-serif font-light text-5xl md:text-6xl text-ink tracking-wide mt-8">
          {{ t('about.hero.title') }}
        </h1>
      </div>
    </section>

    <!-- Pull quote -->
    <section class="bg-parchment-light pb-16 md:pb-24">
      <div class="reveal max-w-3xl mx-auto px-8">
        <p class="font-serif italic font-light text-3xl md:text-4xl text-ink-soft text-center leading-snug tracking-wide">
          {{ t('about.pullquote') }}
        </p>
      </div>
    </section>

    <!-- Story two-col -->
    <section class="py-16 md:py-24 bg-parchment">
      <div class="max-w-5xl mx-auto px-8 grid md:grid-cols-2 gap-16 items-center">
        <div class="reveal">
          <p class="text-[11px] uppercase tracking-[0.3em] text-ink-muted font-light mb-4">{{ t('about.story.eyebrow') }}</p>
          <h2 class="font-serif font-light text-4xl text-ink tracking-wide leading-tight">{{ t('about.story.title') }}</h2>
          <div class="h-px w-12 bg-gold my-7"></div>
          <p class="text-ink-soft font-light leading-loose">{{ t('about.story.body') }}</p>
        </div>
        <!-- Minimal abstract neural SVG -->
        <div class="reveal flex justify-center" style="transition-delay: 120ms">
          <svg viewBox="0 0 320 320" class="w-72 md:w-80 text-ink-hint" fill="none" stroke="currentColor" stroke-width="0.5">
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
    </section>

    <!-- Mission & Vision — two columns with vertical gold rule -->
    <section class="py-16 md:py-24 bg-parchment-light">
      <div class="max-w-5xl mx-auto px-8">
        <div class="grid md:grid-cols-2 gap-12 md:gap-0 md:divide-x divide-gold/40 rtl:md:divide-x-reverse">
          <div class="reveal md:pe-12">
            <p class="text-[11px] uppercase tracking-[0.3em] text-gold-dark font-light mb-4">{{ t('about.mission.title') }}</p>
            <h3 class="font-serif font-light text-3xl text-ink leading-snug mb-6">{{ t('about.mission.desc') }}</h3>
          </div>
          <div class="reveal md:ps-12" style="transition-delay: 120ms">
            <p class="text-[11px] uppercase tracking-[0.3em] text-gold-dark font-light mb-4">{{ t('about.vision.title') }}</p>
            <h3 class="font-serif font-light text-3xl text-ink leading-snug mb-6">{{ t('about.vision.desc') }}</h3>
          </div>
        </div>
      </div>
    </section>

    <!-- Team -->
    <section class="py-16 md:py-24 bg-parchment">
      <div class="max-w-5xl mx-auto px-8">
        <div class="reveal text-center mb-14">
          <SectionEyebrow :text="t('about.teamTitle')" />
        </div>
        <div class="grid md:grid-cols-3 gap-12">
          <div v-for="(m, i) in team" :key="m.name"
               class="reveal text-center" :style="{ transitionDelay: `${i * 80}ms` }">
            <div class="w-24 h-24 mx-auto rounded-full bg-parchment-dark flex items-center justify-center">
              <span class="font-serif font-light text-2xl text-ink">{{ m.initials }}</span>
            </div>
            <h4 class="mt-6 font-serif font-light text-xl text-ink">{{ m.name }}</h4>
            <p class="mt-2 text-[11px] uppercase tracking-[0.3em] text-ink-muted font-light">{{ m.role }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section class="py-16 md:py-24 bg-parchment-light">
      <div class="max-w-3xl mx-auto px-8">
        <div class="reveal text-center mb-14">
          <SectionEyebrow :text="t('about.timelineTitle')" />
        </div>
        <div class="timeline-rail space-y-10">
          <div v-for="(item, i) in timeline" :key="i" class="relative reveal" :style="{ transitionDelay: `${i * 60}ms` }">
            <span class="timeline-dot"></span>
            <div class="font-serif font-light text-gold-dark text-lg mb-1">{{ item.year }}</div>
            <p class="text-ink-soft font-light leading-relaxed">{{ item.event }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
