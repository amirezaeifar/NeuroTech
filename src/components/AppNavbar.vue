<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocale } from '../composables/useLocale.js'
import { useTheme } from '../composables/useTheme.js'
import BrandMark from './BrandMark.vue'

const { t } = useI18n()
const { locale, setLocale, locales } = useLocale()
const { isDark, toggle: toggleTheme } = useTheme()

const scrolled = ref(false)
const mobileOpen = ref(false)
const langOpen = ref(false)

const onScroll = () => { scrolled.value = window.scrollY > 60 }
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const closeMobile = () => { mobileOpen.value = false }

const links = [
  { to: '/', key: 'home' },
  { to: '/academy', key: 'academy' },
  { to: '/events', key: 'events' },
  { to: '/products', key: 'products' },
  { to: '/global-trade', key: 'globalTrade' },
  { to: '/partners', key: 'partners' },
]

const currentLabel = () => locales.find((l) => l.code === locale.value)?.label || locale.value.toUpperCase()
const pickLocale = (code) => { setLocale(code); langOpen.value = false }
</script>

<template>
<header
  :class="[
    'sticky top-0 z-50 w-full transition-all duration-300',
    scrolled
      ? 'bg-parchment-light/80 backdrop-blur-sm border-b border-parchment-deep'
      : 'bg-parchment-light border-b border-parchment-dark'
  ]"
>
  <div class="max-w-7xl mx-auto px-8 min-h-[80px] h-20 flex items-center justify-between gap-6">
    <!-- Logo + Nav group (left in LTR, right in RTL) -->
    <div class="flex items-center gap-6 min-w-0">
      <router-link
        to="/"
        :aria-label="t('brand')"
        @click="closeMobile"
        class="shrink-0"
      >
        <!-- Brand "N" neural-brain mark; wordmark appears on wide (xl) screens. -->
        <span class="flex items-center gap-2.5 select-none">
          <BrandMark :size="36" tone="mono" class="text-gold-dark" />
          <span class="hidden xl:inline-block text-[11px] uppercase tracking-[0.3em] font-light text-ink-muted">{{ t('brand') }}</span>
        </span>
      </router-link>

      <nav class="hidden lg:flex items-center gap-6">
        <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="nav-link whitespace-nowrap"
        >{{ t('nav.' + link.key) }}</router-link>
      </nav>
    </div>

    <!-- Language selector + mobile toggle (right in LTR, left in RTL).
         shrink-0 + a fixed inline-start margin guarantee the mode toggle never
         touches the last nav tab, in any locale. -->
    <div class="flex items-center gap-5 ms-8 shrink-0">
      <!-- Dark mode toggle -->
      <button
        type="button"
        @click="toggleTheme"
        class="text-ink-muted hover:text-gold-dark transition-colors p-1"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        <svg v-if="!isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
          <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" stroke-linecap="round"/>
        </svg>
      </button>

      <div class="relative">
        <button
          type="button"
          @click="langOpen = !langOpen"
          class="text-[11px] tracking-[0.25em] uppercase text-ink-muted hover:text-ink transition-colors font-light flex items-center gap-1.5"
        >
          <span>{{ currentLabel() }}</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" :class="['transition-transform', langOpen ? 'rotate-180' : '']">
            <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <Transition name="fade">
          <div
            v-if="langOpen"
            class="absolute end-0 mt-3 w-44 bg-parchment-light border border-parchment-deep shadow-lg py-2 z-50"
            style="direction: ltr;"
          >
            <button
              v-for="l in locales"
              :key="l.code"
              type="button"
              @click="pickLocale(l.code)"
              :class="[
                'w-full text-left px-4 py-2 text-xs tracking-[0.15em] uppercase font-light transition-colors',
                locale === l.code ? 'text-gold' : 'text-ink-muted hover:text-ink'
              ]"
            >{{ l.label }}</button>
          </div>
        </Transition>
      </div>

      <button
        type="button"
        class="lg:hidden text-ink p-1"
        @click="mobileOpen = !mobileOpen"
        :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
      >
        <svg v-if="!mobileOpen" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M3 7h18M3 17h18" stroke-linecap="round" />
        </svg>
        <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M6 6l12 12M6 18L18 6" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </div>

  <Transition name="fade">
    <div v-if="mobileOpen" class="lg:hidden bg-parchment-light border-t border-parchment-deep">
      <nav class="px-8 py-6 flex flex-col gap-4">
        <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="nav-link whitespace-nowrap"
          @click="closeMobile"
        >{{ t('nav.' + link.key) }}</router-link>
      </nav>

      <div class="px-8 pb-6 flex flex-wrap gap-2.5" style="direction: ltr;">
        <button
          v-for="l in locales"
          :key="l.code"
          type="button"
          @click="setLocale(l.code); closeMobile()"
          :class="[
            'text-[11px] tracking-[0.2em] uppercase font-light px-3 py-1.5 border transition-colors',
            locale === l.code ? 'text-gold border-gold/50' : 'text-ink-muted border-parchment-deep hover:text-ink'
          ]"
        >{{ l.label }}</button>
      </div>
    </div>
  </Transition>
</header>
</template>
