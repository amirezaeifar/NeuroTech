<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LuxeCard from '../components/LuxeCard.vue'
import SectionEyebrow from '../components/SectionEyebrow.vue'
import { useReveal } from '../composables/useReveal.js'

const { t, tm } = useI18n()
const route = useRoute()
const router = useRouter()

const items = computed(() => tm('globalTrade.caseStudies.items'))
const itemIndex = computed(() => Number(route.params.id))
const item = computed(() => items.value[itemIndex.value])

useReveal()
</script>

<template>
  <div v-if="item">
    <section class="bg-ink py-16 md:py-24">
      <div class="max-w-3xl mx-auto px-8">
        <router-link to="/global-trade" class="text-[11px] uppercase tracking-[0.25em] text-gold/80 hover:text-gold transition-colors inline-flex items-center gap-2">
          <span aria-hidden="true">←</span> {{ t('globalTrade.tradeDetail.back') }}
        </router-link>
        <p class="mt-8 text-[11px] uppercase tracking-[0.35em] text-gold/80 font-light">
          {{ t('globalTrade.tradeDetail.eyebrow') }} · {{ t(`globalTrade.tradeDetail.${item.type}`) }}
        </p>
        <h1 class="mt-3 font-serif font-light text-parchment-light text-4xl md:text-5xl tracking-wide leading-snug">{{ item.title }}</h1>
        <p class="mt-4 text-sm text-parchment-light/70 uppercase tracking-[0.2em] font-light">{{ item.company }} · {{ item.country }}</p>
      </div>
    </section>

    <section class="py-16 md:py-24 bg-parchment-light">
      <div class="max-w-3xl mx-auto px-8 grid md:grid-cols-5 gap-12">
        <div class="md:col-span-3">
          <SectionEyebrow :text="t('globalTrade.tradeDetail.overviewTitle')" />
          <p class="reveal mt-6 text-sm text-ink-soft font-light leading-relaxed">{{ item.summary }}</p>

          <div class="mt-12">
            <SectionEyebrow :text="t('globalTrade.tradeDetail.outcomeTitle')" />
            <p class="reveal mt-6 text-sm text-ink-soft font-light leading-relaxed">{{ item.outcome }}</p>
          </div>
        </div>

        <div class="md:col-span-2">
          <LuxeCard class="reveal" :title="t('globalTrade.tradeDetail.detailsTitle')">
            <dl class="space-y-4 text-sm">
              <div class="flex items-center justify-between gap-4">
                <dt class="text-ink-muted uppercase tracking-[0.15em] text-[11px] font-light">{{ t('globalTrade.tradeDetail.partnerLabel') }}</dt>
                <dd class="text-ink font-light text-right">{{ item.company }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="text-ink-muted uppercase tracking-[0.15em] text-[11px] font-light">{{ t('globalTrade.tradeDetail.countryLabel') }}</dt>
                <dd class="text-ink font-light">{{ item.country }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="text-ink-muted uppercase tracking-[0.15em] text-[11px] font-light">{{ t('globalTrade.tradeDetail.categoryLabel') }}</dt>
                <dd class="text-ink font-light text-right">{{ item.category }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="text-ink-muted uppercase tracking-[0.15em] text-[11px] font-light">{{ t('globalTrade.tradeDetail.typeLabel') }}</dt>
                <dd class="text-ink font-light">{{ t(`globalTrade.tradeDetail.${item.type}`) }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="text-ink-muted uppercase tracking-[0.15em] text-[11px] font-light">{{ t('globalTrade.tradeDetail.yearLabel') }}</dt>
                <dd class="text-ink font-light">{{ item.year }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4 pt-4 border-t border-parchment-deep">
                <dt class="text-ink-muted uppercase tracking-[0.15em] text-[11px] font-light">{{ t('globalTrade.tradeDetail.volumeLabel') }}</dt>
                <dd class="text-ink font-light text-right">{{ item.volume }}</dd>
              </div>
            </dl>
          </LuxeCard>
        </div>
      </div>
    </section>
  </div>

  <div v-else class="py-32 text-center">
    <button class="text-[11px] uppercase tracking-[0.25em] text-gold-dark border-b border-gold/50 pb-1" @click="router.push('/global-trade')">
      {{ t('globalTrade.tradeDetail.back') }}
    </button>
  </div>
</template>
