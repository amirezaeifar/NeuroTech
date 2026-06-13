<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import LuxeCard from '../components/LuxeCard.vue'
import BrandMark from '../components/BrandMark.vue'
import AtlasLayout from '../components/AtlasLayout.vue'
import SpecimenPlate from '../components/SpecimenPlate.vue'
import FieldMap from '../components/FieldMap.vue'
import { courseCode } from '../utils/catalog.js'
import { useReveal } from '../composables/useReveal.js'

const { t, tm } = useI18n()

const statusFilters = [
  { key: 'all', label: 'academy.filters.all' },
  { key: 'free', label: 'academy.filters.free' },
  { key: 'premium', label: 'academy.filters.premium' },
]
const fieldFilters = [
  { key: 'all', label: 'academy.fields.all' },
  { key: 'neurology', label: 'academy.fields.neurology' },
  { key: 'psychEmergency', label: 'academy.fields.psychEmergency' },
  { key: 'general', label: 'academy.fields.general' },
]

const activeStatus = ref('all')
const activeField = ref('all')

// Tier CTAs filter the library to the matching tier and scroll to it.
const scrollToCourses = (tier) => {
  activeStatus.value = tier
  const el = document.getElementById('library')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const courses = computed(() => tm('academy.courses'))
const courseIndex = (course) => courses.value.indexOf(course)
const filtered = computed(() => courses.value.filter((c) =>
  (activeStatus.value === 'all' || c.tier === activeStatus.value) &&
  (activeField.value === 'all' || c.field === activeField.value)
))

// The Index Spine indexes the live (filtered) plate stack. Ids are keyed to the
// stable course index so they survive filtering; labels are the course titles.
// Treasure-map waypoints, keyed to the live (filtered) plate stack so the map
// mirrors what's on the right. Mock progress: free courses are partway through,
// premium courses are not started.
const lessonsOf = (c) => {
  const m = (c.duration || '').match(/(\d+)\s*lesson/i)
  return m ? Number(m[1]) : 6
}
const mapSections = computed(() => filtered.value.map((c) => {
  const i = courseIndex(c)
  const lessons = lessonsOf(c)
  // Demo progress: first course fully charted (X marks the spot), other free
  // courses partway, premium courses uncharted.
  const done = c.tier === 'free' ? (i === 0 ? lessons : Math.min(2, lessons)) : 0
  return {
    id: `plate-${i}`,
    code: courseCode(courses.value, i),
    field: c.field,
    title: c.title,
    progress: done / Math.max(lessons, 1),
    // Direct course redirection — the map waypoint links straight to the detail page.
    to: `/academy/course/${i}`,
  }
}))

useReveal()
</script>

<template>
  <div class="academy-page">
    <!-- ───────────────────────── Hero ───────────────────────── -->
    <section class="academy-hero relative overflow-hidden py-24 md:py-32">
      <!-- Depth layers: faint hairline grid, amber light-pool, brand watermark -->
      <div class="academy-hero-grid pointer-events-none absolute inset-0"></div>
      <div class="academy-hero-glow pointer-events-none absolute inset-0"></div>
      <BrandMark
        :size="420"
        tone="mono"
        class="pointer-events-none absolute -top-16 text-[#F4D791]/[0.04] hidden md:block"
        style="inset-inline-end: -3rem;"
      />

      <div class="relative max-w-5xl mx-auto px-8 text-center">
        <p class="text-[11px] uppercase tracking-[0.35em] text-[#EDC071] font-light mb-6">
          {{ t('academy.hero.eyebrow') }}
        </p>
        <h1 class="font-serif font-light text-[#F6F3EC] text-5xl md:text-6xl tracking-wide">
          {{ t('academy.hero.title') }}
        </h1>

        <!-- Diamond rule — a touch more crafted than a plain line -->
        <div class="mt-10 flex items-center justify-center gap-4">
          <span class="h-px w-16 bg-gradient-to-r from-transparent to-[#EDC071]/70"></span>
          <span class="text-[#EDC071] text-[9px] tracking-widest">◆</span>
          <span class="h-px w-16 bg-gradient-to-l from-transparent to-[#EDC071]/70"></span>
        </div>
      </div>
    </section>

    <!-- ─────────────── Preamble: pull-quote + access tiers ─────────────── -->
    <section class="py-16 md:py-24 bg-parchment-light">
      <div class="max-w-5xl mx-auto px-8">
        <figure class="reveal relative max-w-2xl mx-auto text-center">
          <span aria-hidden="true" class="block font-serif text-gold/30 text-6xl leading-none mb-2 select-none">&ldquo;</span>
          <p class="font-serif italic font-light text-2xl text-ink-soft leading-relaxed">
            {{ t('academy.intro') }}
          </p>
        </figure>

        <!-- Tiers -->
        <div class="mt-16 grid md:grid-cols-2 gap-8">
          <!-- Free -->
          <LuxeCard class="reveal group relative overflow-hidden lux-card hover:-translate-y-0.5 hover:border-gold/50">
            <span class="pointer-events-none absolute top-0 inset-inline-start-0 h-12 w-12 border-t border-gold/40" style="border-inline-start:1px solid rgb(var(--c-gold)/0.4);"></span>
            <div class="flex items-center gap-3">
              <span class="grid place-items-center h-9 w-9 rounded-full border border-gold/40 text-gold-dark">
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6.5A2 2 0 0 1 5 5h5a2 2 0 0 1 2 2v12a1.5 1.5 0 0 0-1.5-1.5H5A2 2 0 0 1 3 15.5z"/><path d="M21 6.5A2 2 0 0 0 19 5h-5a2 2 0 0 0-2 2v12a1.5 1.5 0 0 1 1.5-1.5H19a2 2 0 0 0 2-1.5z"/></svg>
              </span>
              <span class="text-[10px] uppercase tracking-[0.3em] text-gold-dark font-light">{{ t('academy.tiers.free.name') }}</span>
            </div>
            <p class="mt-5 text-sm text-ink-soft font-light leading-relaxed">{{ t('academy.tiers.free.desc') }}</p>
            <button
              type="button"
              class="mt-7 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-ink hover:text-gold-dark transition-colors border-b border-gold/50 pb-1"
              @click="scrollToCourses('free')"
            >
              {{ t('academy.tiers.free.cta') }}
              <span aria-hidden="true" class="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
            </button>
          </LuxeCard>

          <!-- Premium -->
          <LuxeCard class="reveal group relative overflow-hidden lux-card hover:-translate-y-0.5 hover:border-gold/50" style="transition-delay: 80ms;">
            <span class="pointer-events-none absolute top-0 inset-inline-end-0 h-12 w-12 border-t border-gold/40" style="border-inline-end:1px solid rgb(var(--c-gold)/0.4);"></span>
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <span class="grid place-items-center h-9 w-9 rounded-full border border-gold/40 text-gold-dark">
                  <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6.5v5c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9v-5z"/><path d="m9 12 2 2 4-4.5"/></svg>
                </span>
                <span class="text-[10px] uppercase tracking-[0.3em] text-gold-dark font-light">{{ t('academy.tiers.premium.name') }}</span>
              </div>
              <span class="text-[10px] uppercase tracking-[0.22em] text-gold border border-gold/50 px-2.5 py-1 font-light whitespace-nowrap">{{ t('academy.tiers.premium.badge') }}</span>
            </div>
            <p class="mt-5 text-sm text-ink-soft font-light leading-relaxed">{{ t('academy.tiers.premium.desc') }}</p>
            <button
              type="button"
              class="mt-7 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-ink hover:text-gold-dark transition-colors border-b border-gold/50 pb-1"
              @click="scrollToCourses('premium')"
            >
              {{ t('academy.tiers.premium.cta') }}
              <span aria-hidden="true" class="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
            </button>
          </LuxeCard>
        </div>
      </div>
    </section>

    <!-- ───────────── Course library — Atlas substrate + plates ───────────── -->
    <section class="bg-parchment border-t border-parchment-deep">
      <AtlasLayout max-width="84rem">
        <!-- Spine: the index of the live plate stack -->
        <template #spine>
          <FieldMap
            v-if="filtered.length"
            :sections="mapSections"
            :label="t('academy.filterTitle')"
          />
        </template>

        <!-- Field: editorial control header, then the specimen plates -->
        <header id="library" class="scroll-mt-24">
          <h2 class="font-serif font-light text-3xl md:text-4xl text-ink">{{ t('academy.filterTitle') }}</h2>
          <div class="mt-5 h-px w-16 bg-gold/50"></div>

          <!-- Two-level filters: status, then field (start-aligned, editorial) -->
          <div class="mt-9 flex flex-wrap gap-x-9 gap-y-3">
            <button
              v-for="f in statusFilters"
              :key="f.key"
              @click="activeStatus = f.key"
              :class="[
                'relative text-[11px] uppercase tracking-[0.25em] font-light pb-1 transition-colors',
                activeStatus === f.key ? 'text-ink' : 'text-ink-muted hover:text-ink'
              ]"
            >
              {{ t(f.label) }}
              <span
                class="absolute inset-inline-0 -bottom-px h-px bg-gold transition-transform duration-200"
                :class="activeStatus === f.key ? 'scale-x-100' : 'scale-x-0'"
                style="inset-inline-start:0; inset-inline-end:0;"
              ></span>
            </button>
          </div>

          <div class="mt-4 flex flex-wrap gap-x-6 gap-y-2.5">
            <button
              v-for="f in fieldFilters"
              :key="f.key"
              @click="activeField = f.key"
              :class="[
                'text-[10px] uppercase tracking-[0.2em] font-light px-3 py-1.5 border rounded-full transition-colors whitespace-nowrap',
                activeField === f.key ? 'text-gold-dark border-gold/60 bg-gold/5' : 'text-ink-muted border-parchment-deep hover:text-ink hover:border-gold/40'
              ]"
            >{{ t(f.label) }}</button>
          </div>
        </header>

        <!-- The editorial plate stack -->
        <div class="mt-12 md:mt-16">
          <SpecimenPlate
            v-for="(c, i) in filtered"
            :key="courseIndex(c)"
            :section-id="`plate-${courseIndex(c)}`"
            :code="courseCode(courses, courseIndex(c))"
            :course="c"
            :to="`/academy/course/${courseIndex(c)}`"
            :field-label="t(`academy.fields.${c.field}`)"
            :tier-label="t(`academy.filters.${c.tier}`)"
            :flip="i % 2 === 1"
          />
        </div>

        <p v-if="!filtered.length" class="mt-16 text-sm text-ink-muted font-light italic">
          {{ t('academy.fields.all') }} — {{ t('academy.filters.all') }}
        </p>
      </AtlasLayout>
    </section>
  </div>
</template>
