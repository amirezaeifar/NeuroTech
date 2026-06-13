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

const archiveItems = computed(() => tm('events.archive.items'))
const itemIndex = computed(() => Number(route.params.id))
const item = computed(() => archiveItems.value[itemIndex.value])

const archiveIcon = (type) => ({
  image: 'M4 5h16v14H4z M4 16l4-4 3 3 5-6 4 4',
  document: 'M7 3h7l4 4v14H7z M14 3v4h4',
  blog: 'M5 4h14v3H5z M5 10h14 M5 14h10 M5 18h7',
}[type] || '')

// Mock gallery — a row of toned plates standing in for event photography.
const galleryTones = [
  'from-gold/30 via-gold/10 to-transparent',
  'from-ink/65 via-ink/25 to-transparent',
  'from-gold-dark/25 via-gold/10 to-transparent',
  'from-ink-soft/45 via-ink/15 to-transparent',
]

const blogs = computed(() => archiveItems.value
  .map((it, i) => ({ ...it, i }))
  .filter((it) => it.type === 'blog' && it.i !== itemIndex.value))
const documents = computed(() => archiveItems.value
  .map((it, i) => ({ ...it, i }))
  .filter((it) => it.type === 'document' && it.i !== itemIndex.value))

useReveal()
</script>

<template>
  <div v-if="item">
    <section class="bg-ink py-16 md:py-24">
      <div class="max-w-4xl mx-auto px-8">
        <router-link to="/events" class="text-[11px] uppercase tracking-[0.25em] text-gold/80 hover:text-gold transition-colors inline-flex items-center gap-2">
          <span aria-hidden="true">←</span> {{ t('events.pastDetail.back') }}
        </router-link>
        <p class="mt-8 text-[11px] uppercase tracking-[0.35em] text-gold/80 font-light">{{ t('events.pastDetail.eyebrow') }} · {{ t(`events.archive.types.${item.type}`) }}</p>
        <h1 class="mt-3 font-serif font-light text-parchment-light text-4xl md:text-5xl tracking-wide leading-snug">{{ item.title }}</h1>
        <p class="mt-4 text-sm text-parchment-light/70 uppercase tracking-[0.2em] font-light">{{ item.date }}</p>
      </div>
    </section>

    <section class="py-16 md:py-24 bg-parchment-light">
      <div class="max-w-4xl mx-auto px-8">
        <p class="reveal text-sm text-ink-soft font-light leading-relaxed max-w-2xl">{{ item.summary }}</p>

        <!-- Event overview -->
        <div class="reveal mt-10 max-w-2xl">
          <p class="text-sm text-ink-soft font-light leading-loose">{{ t('events.pastDetail.overview') }}</p>
        </div>

        <!-- Gallery -->
        <div class="mt-14">
          <SectionEyebrow :text="t('events.pastDetail.galleryTitle')" />
          <div class="mt-7 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="(tone, i) in galleryTones" :key="i" class="reveal relative aspect-square overflow-hidden bg-ink" :style="{ transitionDelay: `${i * 60}ms` }">
              <div :class="['absolute inset-0 bg-gradient-to-br', tone]"></div>
              <span class="absolute inset-0 flex items-center justify-center font-serif font-light text-3xl text-parchment-light/20">{{ String(i + 1).padStart(2, '0') }}</span>
            </div>
          </div>
        </div>

        <!-- Related materials -->
        <div class="mt-16">
          <SectionEyebrow :text="t('events.pastDetail.relatedTitle')" />
          <div class="mt-7 grid md:grid-cols-2 gap-6">
            <LuxeCard v-for="b in blogs" :key="'blog-' + b.i" class="reveal flex gap-5">
              <div class="shrink-0 w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-gold">
                  <path :d="archiveIcon('blog')" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div>
                <span class="text-[10px] uppercase tracking-[0.3em] text-gold-dark font-light">{{ t('events.pastDetail.blogsLabel') }}</span>
                <h3 class="font-serif font-light text-base text-ink mt-1.5 leading-snug">{{ b.title }}</h3>
                <p class="mt-1.5 text-xs text-ink-muted font-light leading-relaxed">{{ b.summary }}</p>
              </div>
            </LuxeCard>
            <LuxeCard v-for="d in documents" :key="'doc-' + d.i" class="reveal flex gap-5" style="transition-delay: 80ms;">
              <div class="shrink-0 w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-gold">
                  <path :d="archiveIcon('document')" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div>
                <span class="text-[10px] uppercase tracking-[0.3em] text-gold-dark font-light">{{ t('events.pastDetail.documentsLabel') }}</span>
                <h3 class="font-serif font-light text-base text-ink mt-1.5 leading-snug">{{ d.title }}</h3>
                <p class="mt-1.5 text-xs text-ink-muted font-light leading-relaxed">{{ d.summary }}</p>
              </div>
            </LuxeCard>
          </div>

          <LuxeCard class="reveal mt-6">
            <span class="text-[10px] uppercase tracking-[0.3em] text-gold-dark font-light">{{ t('events.pastDetail.infoLabel') }}</span>
            <p class="mt-2.5 text-sm text-ink-soft font-light leading-relaxed">{{ t('events.pastDetail.infoBody') }}</p>
          </LuxeCard>
        </div>
      </div>
    </section>
  </div>

  <div v-else class="py-32 text-center">
    <button class="text-[11px] uppercase tracking-[0.25em] text-gold-dark border-b border-gold/50 pb-1" @click="router.push('/events')">
      {{ t('events.pastDetail.back') }}
    </button>
  </div>
</template>
