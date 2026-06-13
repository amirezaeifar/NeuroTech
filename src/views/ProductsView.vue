<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import LuxeCard from '../components/LuxeCard.vue'
import { useReveal } from '../composables/useReveal.js'

const { t, tm } = useI18n()

const filters = [
  { key: 'all', label: 'products.filters.all' },
  { key: 'eeg', label: 'products.filters.eeg' },
  { key: 'emg', label: 'products.filters.emg' },
  { key: 'neurostim', label: 'products.filters.neurostim' },
  { key: 'monitoring', label: 'products.filters.monitoring' },
]

const active = ref('all')
const products = computed(() => tm('products.items'))
const filtered = computed(() =>
  active.value === 'all' ? products.value : products.value.filter((p) => p.category === active.value)
)
const categoryLabel = (k) => t(`products.filters.${k}`)

useReveal()
</script>

<template>
  <div>
    <!-- Short ink hero -->
    <section class="bg-ink py-20 md:py-28">
      <div class="max-w-5xl mx-auto px-8 text-center">
        <p class="text-[11px] uppercase tracking-[0.35em] text-gold/80 font-light mb-6">
          {{ t('products.hero.eyebrow') }}
        </p>
        <h1 class="font-serif font-light text-parchment-light text-5xl md:text-6xl tracking-wide">
          {{ t('products.hero.title') }}
        </h1>
        <div class="mx-auto mt-10 h-px w-24 bg-gold"></div>
      </div>
    </section>

    <section class="py-16 md:py-24 bg-parchment-light">
      <div class="max-w-5xl mx-auto px-8">
        <p class="reveal max-w-2xl mx-auto text-center font-serif italic font-light text-2xl text-ink-soft leading-relaxed">
          {{ t('products.intro') }}
        </p>

        <!-- Filter tabs — plain text -->
        <div class="mt-16 flex flex-wrap justify-center gap-x-10 gap-y-3">
          <button
            v-for="f in filters"
            :key="f.key"
            @click="active = f.key"
            :class="[
              'relative text-[11px] uppercase tracking-[0.25em] font-light pb-1 transition-colors',
              active === f.key ? 'text-ink' : 'text-ink-muted hover:text-ink'
            ]"
          >
            {{ t(f.label) }}
            <span
              class="absolute left-0 right-0 -bottom-px h-px bg-gold transition-transform duration-200"
              :class="active === f.key ? 'scale-x-100' : 'scale-x-0'"
            ></span>
          </button>
        </div>

        <!-- Grid -->
        <div class="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          <LuxeCard v-for="(p, i) in filtered" :key="p.name + i" class="reveal flex flex-col p-0 overflow-hidden"
                    :style="{ transitionDelay: `${(i % 6) * 60}ms` }">
            <div class="h-48 bg-parchment-dark flex items-center justify-center px-4">
              <span class="font-serif italic font-light text-2xl text-ink-hint text-center leading-tight">{{ p.name }}</span>
            </div>
            <div class="p-8 flex-1 flex flex-col">
              <span class="text-[10px] uppercase tracking-[0.3em] text-gold-dark font-light">
                {{ categoryLabel(p.category) }}
              </span>
              <h3 class="font-serif font-light text-2xl text-ink mt-3 mb-3">{{ p.name }}</h3>
              <p class="text-sm text-ink-soft font-light leading-relaxed flex-1">{{ p.desc }}</p>
              <router-link
                to="/contact"
                class="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-ink hover:text-gold-dark transition-colors border-b border-gold/50 pb-1 self-start"
              >
                {{ t('products.inquire') }} <span aria-hidden="true">→</span>
              </router-link>
            </div>
          </LuxeCard>
        </div>
      </div>
    </section>
  </div>
</template>
