<script setup>
/**
 * ProductDetailView — a comprehensive, fully-responsive product detail page.
 *
 * Structurally inspired by major e-commerce detail pages (breadcrumbs → split
 * gallery/summary → sticky scrollspy tabs → long-form detail sections) but
 * dressed strictly in the house's flat 2D luxury system: parchment surfaces,
 * gold hairlines, serif/clinical typography — no drop shadows, no 3D. Everything
 * is token-based so it inverts cleanly in dark mode.
 *
 * The per-product copy (name / category / desc) comes from products.items; the
 * surrounding detail content (badges, features, specs, docs, reviews) is shared
 * maison-level content from products.detail, so the page reads as a complete,
 * premium listing for any item in the collection.
 *
 * Native RTL: logical Tailwind utilities (ms-/me-, text-start) + the shared
 * .dir-arrow glyph; the split grid reverses naturally under dir="rtl".
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useReveal } from '../composables/useReveal.js'

const { t, tm } = useI18n()
const route = useRoute()

const products = computed(() => tm('products.items'))
const index = computed(() => Number(route.params.id))
const product = computed(() => products.value[index.value])
const categoryLabel = (k) => t(`products.filters.${k}`)

// Shared maison-level detail content
const badges = computed(() => tm('products.detail.badges'))
const keyFeatures = computed(() => tm('products.detail.keyFeatures'))
const specs = computed(() => tm('products.detail.specs'))
const docs = computed(() => tm('products.detail.docs'))
const reviews = computed(() => tm('products.detail.reviews'))
const views = computed(() => tm('products.detail.views'))

// A pseudo reference/SKU derived from the catalogue position — stable + tidy.
const sku = computed(() => 'NT-' + String(index.value + 1).padStart(3, '0'))

// ── Image gallery ────────────────────────────────────────────────────────────
// No photography is shipped; each "view" is a clean flat line-art composition
// (front, console detail, interface, accessories) the user can switch between.
const viewPaths = [
  ['M3 5h18v12H3z', 'M8 21h8M12 17v4', 'M6 8h9M6 11h6'],
  ['M4 4h16v16H4z', 'M8 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z', 'M16 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z', 'M7 14h10M7 17h6'],
  ['M3 7h18v10H3z', 'M8 11h2v4H8zM14 11h2v4h-2z', 'M20 9v6'],
  ['M6 4a3 3 0 0 1 3 3v8', 'M18 4a3 3 0 0 0-3 3v8', 'M9 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0z', 'M21 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0z'],
]
const activeView = ref(0)

// ── Aggregate rating ─────────────────────────────────────────────────────────
const rating = computed(() => {
  const r = reviews.value
  if (!r || !r.length) return 0
  return r.reduce((s, x) => s + (x.rating || 0), 0) / r.length
})
const ratingText = computed(() => rating.value.toFixed(1))
const starFill = (i, value) => i < Math.round(value)

// ── Sticky scrollspy tabs ────────────────────────────────────────────────────
const tabs = computed(() => [
  { id: 'overview', label: t('products.detail.tabs.overview') },
  { id: 'specs', label: t('products.detail.tabs.specs') },
  { id: 'docs', label: t('products.detail.tabs.docs') },
  { id: 'reviews', label: t('products.detail.tabs.reviews') },
])
const activeTab = ref('overview')
const SCROLL_OFFSET = 150 // sticky navbar (80) + tabs bar (~58) + breathing room
let spy = null

function selectTab(id) {
  activeTab.value = id
  const el = document.getElementById('pd-' + id)
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

const docIcon = () => 'M7 3h7l4 4v14H7z M14 3v4h4 M9 13h6 M9 16h4'

useReveal()

onMounted(() => {
  spy = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) activeTab.value = e.target.id.replace('pd-', '')
      }
    },
    { rootMargin: '-150px 0px -62% 0px', threshold: 0 }
  )
  for (const tb of tabs.value) {
    const el = document.getElementById('pd-' + tb.id)
    if (el) spy.observe(el)
  }
})
onBeforeUnmount(() => spy?.disconnect())
</script>

<template>
  <div class="pd-page bg-parchment-light min-h-screen pb-24">
    <div class="max-w-6xl mx-auto px-6 md:px-8">
      <!-- a) Breadcrumbs -->
      <nav class="pt-6 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] uppercase tracking-[0.2em] font-light text-ink-muted" :aria-label="t('products.detail.tabs.overview')">
        <router-link to="/" class="hover:text-gold-dark transition-colors">{{ t('products.detail.home') }}</router-link>
        <span class="text-ink-hint">/</span>
        <router-link to="/products" class="hover:text-gold-dark transition-colors">{{ t('products.detail.products') }}</router-link>
        <span v-if="product" class="text-ink-hint">/</span>
        <span v-if="product" class="text-gold-dark normal-case tracking-[0.1em]">{{ product.name }}</span>
      </nav>

      <template v-if="product">
        <!-- b) Top split: gallery + summary -->
        <div class="mt-7 grid lg:grid-cols-2 gap-10 lg:gap-14">
          <!-- Image gallery -->
          <div class="reveal">
            <figure class="pd-stage relative rounded-xl border border-parchment-deep bg-parchment overflow-hidden aspect-square grid place-items-center">
              <span class="pd-stage-aura pointer-events-none absolute inset-0" aria-hidden="true"></span>
              <span class="absolute top-4 inset-inline-start-4 text-[10px] uppercase tracking-[0.3em] text-gold-dark font-light">{{ categoryLabel(product.category) }}</span>
              <svg class="pd-glyph relative w-2/5 h-2/5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.9" aria-hidden="true">
                <path v-for="(p, k) in viewPaths[activeView]" :key="k" :d="p" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <figcaption class="absolute bottom-4 inset-inline-start-4 font-serif font-light text-lg text-ink/70">{{ product.name }}</figcaption>
              <span class="absolute bottom-4 inset-inline-end-4 text-[10px] uppercase tracking-[0.25em] text-ink-hint font-light">{{ views[activeView] }}</span>
            </figure>

            <!-- Thumbnails -->
            <div class="mt-4 grid grid-cols-4 gap-3">
              <button
                v-for="(v, k) in views"
                :key="k"
                type="button"
                @click="activeView = k"
                :class="['pd-thumb grid place-items-center aspect-square rounded-lg border transition-colors', activeView === k ? 'border-gold bg-gold/10' : 'border-parchment-deep bg-parchment hover:border-gold/50']"
                :aria-label="v"
                :aria-pressed="activeView === k"
              >
                <svg class="w-1/2 h-1/2 text-gold-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">
                  <path v-for="(p, m) in viewPaths[k]" :key="m" :d="p" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Product summary -->
          <div class="reveal">
            <p class="text-[11px] uppercase tracking-[0.35em] text-gold-dark font-light">{{ t('products.detail.brand') }}</p>
            <h1 class="mt-3 font-serif font-light text-4xl md:text-5xl text-ink leading-[1.1]">{{ product.name }}</h1>

            <!-- Rating + reference -->
            <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span class="inline-flex items-center gap-2">
                <span class="inline-flex items-center gap-0.5" aria-hidden="true">
                  <svg v-for="i in 5" :key="i" width="15" height="15" viewBox="0 0 24 24" :class="starFill(i - 1, rating) ? 'text-gold' : 'text-parchment-deep'" :fill="starFill(i - 1, rating) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.4"><path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17l-6.2 3.9 1.6-6.8L2.2 8.9l6.9-.6z" stroke-linejoin="round"/></svg>
                </span>
                <span class="text-sm text-ink font-light tabular-nums">{{ ratingText }}</span>
              </span>
              <span class="text-[11px] uppercase tracking-[0.2em] text-ink-muted font-light">{{ t('products.detail.skuLabel') }} · {{ sku }}</span>
            </div>

            <!-- Badges -->
            <div class="mt-5 flex flex-wrap gap-2">
              <span v-for="(b, k) in badges" :key="k" class="pd-badge">{{ b }}</span>
            </div>

            <p class="mt-6 text-[15px] text-ink-soft font-light leading-relaxed">{{ product.desc }}</p>

            <!-- Key features -->
            <div class="mt-7">
              <p class="text-[10px] uppercase tracking-[0.3em] text-gold-dark font-light mb-3">{{ t('products.detail.featuresTitle') }}</p>
              <ul class="space-y-2.5">
                <li v-for="(f, k) in keyFeatures" :key="k" class="flex items-start gap-3 text-sm text-ink-soft font-light leading-snug">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="shrink-0 mt-0.5 text-gold-dark"><path d="M5 12l5 5L19 8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  {{ f }}
                </li>
              </ul>
            </div>

            <!-- Prominent pricing / CTA box -->
            <div class="pd-cta mt-8">
              <div class="flex items-end justify-between gap-4">
                <div>
                  <p class="text-[10px] uppercase tracking-[0.3em] text-gold-dark font-light">{{ t('products.detail.priceLabel') }}</p>
                  <p class="mt-1 font-serif font-light text-3xl text-ink leading-none">{{ t('products.detail.priceValue') }}</p>
                </div>
                <span class="inline-flex items-center gap-2 text-[11px] text-ink-muted font-light">
                  <span class="w-2 h-2 rounded-full bg-gold-dark"></span>{{ t('products.detail.availability') }}
                </span>
              </div>
              <p class="mt-2 text-[12px] text-ink-muted font-light leading-relaxed">{{ t('products.detail.priceNote') }}</p>
              <p class="mt-1 text-[11px] text-ink-hint font-light">{{ t('products.detail.leadTime') }}</p>

              <div class="mt-5 flex flex-col sm:flex-row gap-3">
                <router-link to="/contact" class="pd-btn-primary">
                  {{ t('products.detail.ctaPrimary') }} <span class="dir-arrow" aria-hidden="true"></span>
                </router-link>
                <a href="#" @click.prevent class="btn-ghost-gold justify-center">
                  {{ t('products.detail.ctaSecondary') }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- c) Sticky scrollspy tabs -->
        <div class="pd-tabs sticky top-20 z-30 mt-16">
          <div class="flex gap-x-8 gap-y-2 overflow-x-auto no-scrollbar">
            <button
              v-for="tb in tabs"
              :key="tb.id"
              type="button"
              @click="selectTab(tb.id)"
              class="pd-tab"
              :class="{ 'is-active': activeTab === tb.id }"
            >
              {{ tb.label }}
              <span class="pd-tab-rule" :class="activeTab === tb.id ? 'scale-x-100' : 'scale-x-0'"></span>
            </button>
          </div>
        </div>

        <!-- d) Detailed content -->
        <!-- Overview -->
        <section id="pd-overview" class="pd-section scroll-mt-36">
          <h2 class="pd-section-title">{{ t('products.detail.overviewTitle') }}</h2>
          <span class="pd-rule" aria-hidden="true"></span>
          <p class="font-serif italic font-light text-xl md:text-2xl text-ink leading-relaxed">{{ t('products.detail.overviewLead') }}</p>
          <p class="mt-5 text-[15px] text-ink-soft font-light leading-relaxed max-w-3xl">{{ product.desc }}</p>
          <p class="mt-4 text-[15px] text-ink-soft font-light leading-relaxed max-w-3xl">{{ t('products.detail.overviewBody') }}</p>
        </section>

        <!-- Technical Specifications -->
        <section id="pd-specs" class="pd-section scroll-mt-36">
          <h2 class="pd-section-title">{{ t('products.detail.specsTitle') }}</h2>
          <span class="pd-rule" aria-hidden="true"></span>
          <div class="rounded-xl border border-parchment-deep overflow-hidden">
            <dl>
              <div
                v-for="(s, k) in specs"
                :key="k"
                class="pd-spec-row grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 px-5 py-3.5"
                :class="{ 'pd-spec-alt': k % 2 === 1 }"
              >
                <dt class="text-[11px] uppercase tracking-[0.18em] text-ink-muted font-light sm:col-span-1 self-center">{{ s.label }}</dt>
                <dd class="text-sm text-ink font-light sm:col-span-2 self-center">{{ s.value }}</dd>
              </div>
            </dl>
          </div>
        </section>

        <!-- Clinical Documentation -->
        <section id="pd-docs" class="pd-section scroll-mt-36">
          <h2 class="pd-section-title">{{ t('products.detail.docsTitle') }}</h2>
          <span class="pd-rule" aria-hidden="true"></span>
          <ul class="grid sm:grid-cols-2 gap-3">
            <li v-for="(doc, k) in docs" :key="k">
              <a href="#" @click.prevent class="group flex items-center gap-3 rounded-lg border border-parchment-deep bg-parchment px-4 py-3.5 hover:border-gold/50 transition-colors">
                <span class="shrink-0 w-10 h-10 rounded border border-gold/40 flex items-center justify-center text-gold-dark">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path :d="docIcon()" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-sm text-ink font-light leading-snug group-hover:text-gold-dark transition-colors">{{ doc.name }}</span>
                  <span class="block text-[10px] uppercase tracking-[0.15em] text-ink-hint font-light mt-0.5">{{ doc.type }} · {{ doc.size }}</span>
                </span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" class="shrink-0 text-ink-muted group-hover:text-gold-dark transition-colors"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </a>
            </li>
          </ul>
          <p class="mt-4 text-[11px] text-ink-hint font-light italic leading-relaxed">{{ t('products.detail.docsNote') }}</p>
        </section>

        <!-- Reviews / Testimonials -->
        <section id="pd-reviews" class="pd-section scroll-mt-36">
          <h2 class="pd-section-title">{{ t('products.detail.reviewsTitle') }}</h2>
          <span class="pd-rule" aria-hidden="true"></span>

          <div class="flex items-center gap-4 mb-7">
            <span class="font-serif font-light text-4xl text-ink leading-none tabular-nums">{{ ratingText }}</span>
            <div>
              <span class="inline-flex items-center gap-0.5" aria-hidden="true">
                <svg v-for="i in 5" :key="i" width="16" height="16" viewBox="0 0 24 24" :class="starFill(i - 1, rating) ? 'text-gold' : 'text-parchment-deep'" :fill="starFill(i - 1, rating) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.4"><path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17l-6.2 3.9 1.6-6.8L2.2 8.9l6.9-.6z" stroke-linejoin="round"/></svg>
              </span>
              <p class="text-[11px] text-ink-muted font-light mt-1">{{ t('products.detail.ratingSuffix') }}</p>
            </div>
          </div>

          <div class="grid md:grid-cols-3 gap-5">
            <figure v-for="(r, k) in reviews" :key="k" class="rounded-xl border border-parchment-deep bg-parchment p-6">
              <span class="inline-flex items-center gap-0.5 mb-3" aria-hidden="true">
                <svg v-for="i in 5" :key="i" width="13" height="13" viewBox="0 0 24 24" :class="starFill(i - 1, r.rating) ? 'text-gold' : 'text-parchment-deep'" :fill="starFill(i - 1, r.rating) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.4"><path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17l-6.2 3.9 1.6-6.8L2.2 8.9l6.9-.6z" stroke-linejoin="round"/></svg>
              </span>
              <blockquote class="text-sm text-ink-soft font-light leading-relaxed">“{{ r.text }}”</blockquote>
              <figcaption class="mt-4 pt-4 border-t border-parchment-deep/70">
                <span class="block text-sm text-ink font-light">{{ r.author }}</span>
                <span class="block text-[11px] uppercase tracking-[0.18em] text-gold-dark font-light mt-0.5">{{ r.role }}</span>
              </figcaption>
            </figure>
          </div>
        </section>
      </template>

      <!-- Unknown / out-of-range id -->
      <div v-else class="py-32 text-center">
        <p class="font-serif font-light text-2xl text-ink">{{ t('products.detail.notFound') }}</p>
        <router-link to="/products" class="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-gold-dark border-b border-gold/50 pb-1 hover:text-gold transition-colors">
          {{ t('products.detail.back') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Gallery stage — a flat framed panel with a soft warm vignette. ──────── */
.pd-stage-aura {
  background: radial-gradient(70% 70% at 50% 40%, rgb(var(--c-gold) / 0.07), transparent 70%);
}
.pd-glyph { color: rgb(var(--c-gold-dark)); }

/* Badges + thumbnails */
.pd-badge {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-weight: 300;
  color: rgb(var(--c-gold-dark));
  border: 1px solid rgb(var(--c-gold) / 0.45);
  background: rgb(var(--c-gold) / 0.06);
  border-radius: 9999px;
  padding-block: 0.3rem;
  padding-inline: 0.75rem;
}

/* ── Prominent CTA / pricing box — flat, gold-hairline framed. ──────────── */
.pd-cta {
  border: 1px solid rgb(var(--c-gold) / 0.35);
  background: rgb(var(--c-gold) / 0.05);
  border-radius: 0.9rem;
  padding: 1.5rem 1.6rem 1.6rem;
}
.pd-btn-primary {
  flex: 1 1 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding-block: 0.85rem;
  padding-inline: 1.5rem;
  border-radius: 4px;
  background: rgb(var(--c-ink));
  color: rgb(var(--c-parchment-light));
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  font-weight: 300;
  transition: background-color 240ms ease;
}
.pd-btn-primary:hover { background: rgb(var(--c-gold-dark)); }

/* ── Sticky scrollspy tabs ─────────────────────────────────────────────── */
.pd-tabs {
  background: rgb(var(--c-parchment-light) / 0.9);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border-block-end: 1px solid rgb(var(--c-parchment-deep));
  padding-block: 0.9rem;
}
.pd-tab {
  position: relative;
  flex: none;
  padding-block-end: 0.4rem;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  font-weight: 300;
  color: rgb(var(--c-ink-muted));
  white-space: nowrap;
  transition: color 200ms ease;
}
.pd-tab:hover,
.pd-tab.is-active { color: rgb(var(--c-ink)); }
.pd-tab-rule {
  position: absolute;
  inset-inline: 0;
  bottom: -0.9rem;
  height: 2px;
  background: rgb(var(--c-gold));
  transition: transform 220ms ease;
}
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }

/* ── Detail sections ───────────────────────────────────────────────────── */
.pd-section { padding-block: 3rem 0.5rem; }
.pd-section-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 300;
  font-size: 1.9rem;
  line-height: 1.15;
  color: rgb(var(--c-ink));
}
html[lang='fa'] .pd-section-title { font-family: inherit; font-weight: 700; }
.pd-rule {
  display: block;
  width: 34px;
  height: 1px;
  margin-block: 0.8rem 1.5rem;
  background: rgb(var(--c-gold) / 0.6);
}

/* Specs table — flat zebra via a faint gold-tinted alt row + hairline dividers. */
.pd-spec-row + .pd-spec-row { border-block-start: 1px solid rgb(var(--c-parchment-deep) / 0.7); }
.pd-spec-alt { background: rgb(var(--c-gold) / 0.035); }

/* Persian — drop Latin tracking on tabs/badges. */
html[lang='fa'] .pd-tab,
html[lang='fa'] .pd-badge,
html[lang='fa'] .pd-btn-primary { letter-spacing: 0; text-transform: none; }

@media (prefers-reduced-motion: reduce) {
  .pd-tab-rule { transition: none; }
}
</style>
