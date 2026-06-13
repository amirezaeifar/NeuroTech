<script setup>
import { useI18n } from 'vue-i18n'
import SectionEyebrow from '../components/SectionEyebrow.vue'
import LuxeCard from '../components/LuxeCard.vue'
import GoldRule from '../components/GoldRule.vue'
import { useReveal } from '../composables/useReveal.js'

const { t, tm } = useI18n()
const regions = tm('globalTrade.regions')
const become = tm('globalTrade.become.items')
const importItems = tm('globalTrade.importExport.import.items')
const exportItems = tm('globalTrade.importExport.export.items')
const caseStudies = tm('globalTrade.caseStudies.items')

useReveal()
</script>

<template>
  <div>
    <!-- Page header -->
    <section class="py-20 md:py-28 bg-parchment-light text-center">
      <div class="max-w-5xl mx-auto px-8">
        <SectionEyebrow :text="t('globalTrade.hero.eyebrow')" />
        <h1 class="font-serif font-light text-5xl md:text-6xl text-ink tracking-wide mt-8">
          {{ t('globalTrade.hero.title') }}
        </h1>
      </div>
    </section>

    <section class="bg-parchment-light pb-8">
      <div class="reveal max-w-2xl mx-auto px-8 text-center font-serif italic font-light text-2xl text-ink-soft leading-relaxed">
        {{ t('globalTrade.intro') }}
      </div>
      <div class="max-w-5xl mx-auto px-8">
        <GoldRule diamond />
      </div>
    </section>

    <!-- Regions -->
    <section class="py-12 md:py-20 bg-parchment-light">
      <div class="max-w-5xl mx-auto px-8">
        <div class="reveal text-center mb-14">
          <SectionEyebrow :text="t('globalTrade.regionsTitle')" />
        </div>

        <div class="grid md:grid-cols-2 gap-12">
          <LuxeCard
            v-for="(r, i) in regions" :key="r.name"
            :title="r.name"
            class="reveal"
            :style="{ transitionDelay: `${i * 80}ms` }"
          >
            <div class="flex flex-wrap gap-2 mb-5">
              <span v-for="(c, j) in r.countries" :key="j"
                    class="text-xs px-3 py-1 bg-parchment-dark text-ink-soft font-light tracking-wide">
                {{ c }}
              </span>
            </div>
            <p class="text-sm text-ink-soft font-light leading-relaxed">{{ r.note }}</p>
          </LuxeCard>
        </div>
      </div>
    </section>

    <!-- Import & Export -->
    <section class="py-16 md:py-24 bg-ink">
      <div class="max-w-5xl mx-auto px-8">
        <div class="reveal text-center max-w-2xl mx-auto">
          <p class="text-[11px] uppercase tracking-[0.35em] text-gold/80 font-light mb-6">
            {{ t('globalTrade.importExport.eyebrow') }}
          </p>
          <h2 class="font-serif font-light text-3xl md:text-4xl text-parchment-light tracking-wide">
            {{ t('globalTrade.importExport.title') }}
          </h2>
          <p class="mt-6 text-sm text-parchment-deep/80 font-light leading-relaxed">
            {{ t('globalTrade.importExport.intro') }}
          </p>
        </div>

        <div class="mt-16 grid md:grid-cols-2 gap-8">
          <div class="reveal border border-gold/25 p-10">
            <h3 class="font-serif font-light text-2xl text-parchment-light mb-3">{{ t('globalTrade.importExport.import.title') }}</h3>
            <p class="text-sm text-parchment-deep/80 font-light leading-relaxed mb-6">{{ t('globalTrade.importExport.import.desc') }}</p>
            <ul class="space-y-3">
              <li v-for="(item, i) in importItems" :key="i" class="flex items-start gap-3 text-sm text-parchment-dark/90 font-light leading-relaxed">
                <span class="text-gold mt-1 text-xs">◆</span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
          <div class="reveal border border-gold/25 p-10" style="transition-delay: 100ms">
            <h3 class="font-serif font-light text-2xl text-parchment-light mb-3">{{ t('globalTrade.importExport.export.title') }}</h3>
            <p class="text-sm text-parchment-deep/80 font-light leading-relaxed mb-6">{{ t('globalTrade.importExport.export.desc') }}</p>
            <ul class="space-y-3">
              <li v-for="(item, i) in exportItems" :key="i" class="flex items-start gap-3 text-sm text-parchment-dark/90 font-light leading-relaxed">
                <span class="text-gold mt-1 text-xs">◆</span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Case studies & trade reports -->
    <section class="py-16 md:py-24 bg-parchment-light border-t border-parchment-deep">
      <div class="max-w-5xl mx-auto px-8">
        <div class="reveal text-center max-w-2xl mx-auto">
          <p class="text-[11px] uppercase tracking-[0.35em] text-gold/80 font-light mb-6">{{ t('globalTrade.caseStudies.eyebrow') }}</p>
          <h2 class="font-serif font-light text-3xl md:text-4xl text-ink tracking-wide">{{ t('globalTrade.caseStudies.title') }}</h2>
          <p class="mt-6 text-sm text-ink-soft font-light leading-relaxed">{{ t('globalTrade.caseStudies.subtitle') }}</p>
        </div>

        <div class="mt-16 grid md:grid-cols-2 gap-8">
          <router-link
            v-for="(cs, i) in caseStudies"
            :key="cs.company + i"
            :to="`/global-trade/report/${i}`"
            class="reveal group block"
            :style="{ transitionDelay: `${(i % 4) * 70}ms` }"
          >
            <article class="bg-parchment border border-parchment-deep p-10 h-full transition-colors group-hover:border-gold/50">
              <div class="flex items-baseline justify-between gap-4 flex-wrap">
                <span :class="['text-[10px] uppercase tracking-[0.25em] font-light px-2.5 py-1 border', cs.type === 'import' ? 'text-ink-soft border-parchment-deep' : 'text-gold-dark border-gold/50']">
                  {{ t(`globalTrade.tradeDetail.${cs.type}`) }}
                </span>
                <span class="text-[11px] uppercase tracking-[0.2em] text-ink-hint font-light">{{ cs.country }} · {{ cs.year }}</span>
              </div>
              <h3 class="font-serif font-light text-xl text-ink mt-4 mb-1.5 leading-snug group-hover:text-gold-dark transition-colors">{{ cs.title }}</h3>
              <p class="text-xs text-ink-muted font-light uppercase tracking-[0.15em]">{{ cs.company }} · {{ cs.category }}</p>
              <p class="mt-4 text-sm text-ink-soft font-light leading-relaxed">{{ cs.summary }}</p>
              <span class="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-ink group-hover:text-gold-dark transition-colors border-b border-gold/40 pb-1">
                {{ t('globalTrade.caseStudies.viewReport') }} <span aria-hidden="true">→</span>
              </span>
            </article>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Become a representative -->
    <section class="py-16 md:py-24 bg-parchment">
      <div class="max-w-5xl mx-auto px-8 grid md:grid-cols-5 gap-12 items-start">
        <div class="md:col-span-3 reveal">
          <h2 class="font-serif font-light text-4xl text-ink tracking-wide">
            {{ t('globalTrade.become.title') }}
          </h2>
          <p class="mt-2 font-serif italic font-light text-xl text-ink-muted">
            {{ t('globalTrade.become.italic') }}
          </p>
          <div class="h-px w-10 bg-gold mt-8 mb-8"></div>
          <ul class="space-y-4">
            <li v-for="(b, i) in become" :key="i" class="flex items-start gap-4 text-ink-soft font-light leading-relaxed">
              <span class="text-gold mt-1 text-xs">◆</span>
              <span>{{ b }}</span>
            </li>
          </ul>
        </div>
        <div class="md:col-span-2 md:text-end reveal" style="transition-delay: 120ms">
          <router-link to="/contact" class="btn-ghost-gold">
            {{ t('globalTrade.become.cta') }} <span aria-hidden="true">→</span>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>
