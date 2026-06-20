<script setup>
/**
 * ScrollToTop — a chic, minimalist flat 2D floating control pinned to the
 * bottom-end corner of the viewport. It fades + glides in only after the page
 * has been scrolled past a threshold, and smooth-scrolls back to the top on
 * click.
 *
 * Strictly flat: a single charcoal disc with a fine gold hairline ring and a
 * clean upward arrow. There is no drop shadow and no 3D lift — the premium feel
 * comes entirely from motion: an elegant fade/slide-in, a fluid colour warm to
 * solid gold on hover, and the arrow lifting gently on hover (and dipping on
 * press) with soft ease-in-out timing. The corner uses the logical
 * `inset-inline-end`, so it sits bottom-right in LTR and bottom-left in RTL
 * (Persian) with no direction-specific code.
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const visible = ref(false)
const THRESHOLD = 400 // px scrolled before the button appears

const onScroll = () => {
  visible.value = window.scrollY > THRESHOLD
}

const toTop = () => {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <Transition name="fab-pop">
    <button
      v-if="visible"
      type="button"
      class="scroll-fab"
      :aria-label="t('common.scrollTop')"
      :title="t('common.scrollTop')"
      @click="toTop"
    >
      <svg class="scroll-fab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </Transition>
</template>

<style scoped>
.scroll-fab {
  position: fixed;
  bottom: 1.75rem;
  inset-inline-end: 1.75rem;
  z-index: 50;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.875rem;
  height: 2.875rem;
  border-radius: 9999px; /* perfect disc — modern, minimalist */
  /* Theme-adaptive via tokens (no html.dark selector needed): --c-ink is
     charcoal in light mode and warm parchment in dark mode, so the disc always
     contrasts against the page, and --c-gold keeps the arrow gold in both. */
  background: rgb(var(--c-ink));
  color: rgb(var(--c-gold));
  border: 1px solid rgb(var(--c-gold) / 0.45);
  cursor: pointer;
  overflow: hidden;
  /* Flat: only colour transitions on the shell — fluid and unhurried. No shadow. */
  transition: background-color 320ms ease, color 320ms ease, border-color 320ms ease;
}
.scroll-fab-icon {
  /* The arrow carries the motion: it lifts on hover, dips on press. */
  transition: transform 320ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}
.scroll-fab:hover {
  background: rgb(var(--c-gold)); /* warms to solid gold */
  color: #1a1714;                 /* dark arrow — gold is light-ish in both themes */
  border-color: rgb(var(--c-gold));
}
.scroll-fab:hover .scroll-fab-icon {
  transform: translateY(-3px); /* elegant upward nudge */
}
.scroll-fab:active .scroll-fab-icon {
  transform: translateY(1px);
  transition-duration: 120ms;
}
.scroll-fab:focus-visible {
  outline: 2px solid rgb(var(--c-gold) / 0.6);
  outline-offset: 3px;
}

/* Fade + glide in/out — flat, no scale bounce that would read as 3D. */
.fab-pop-enter-active {
  transition: opacity 380ms ease, transform 420ms cubic-bezier(0.16, 1, 0.3, 1);
}
.fab-pop-leave-active {
  transition: opacity 260ms ease, transform 280ms cubic-bezier(0.4, 0, 1, 1);
}
.fab-pop-enter-from,
.fab-pop-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

@media (prefers-reduced-motion: reduce) {
  .scroll-fab { transition: background-color 200ms ease, color 200ms ease; }
  .scroll-fab-icon,
  .scroll-fab:hover .scroll-fab-icon,
  .scroll-fab:active .scroll-fab-icon { transition: none; transform: none; }
  .fab-pop-enter-active,
  .fab-pop-leave-active { transition: opacity 200ms ease; }
  .fab-pop-enter-from,
  .fab-pop-leave-to { transform: none; }
}
</style>
