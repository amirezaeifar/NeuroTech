<script setup>
/**
 * ProductsView — "Electric Image Particle Field & Glassmorphism".
 *
 * The page is a single positioned canvas-backed stage. Behind ALL content — the
 * top "Collection" header AND the catalogue below — an HTML5 <canvas> renders a
 * floating particle field where every particle is one of FOUR brand images
 * (background-products[.|1|2|3].png), distributed equally. Each image is tinted
 * to a flat solid colour via an off-screen `source-in` mask, so it always reads
 * as a crisp flat silhouette.
 *
 * Dynamic colour inversion ("X-ray"): the page paints two background bands — a
 * header band (top) and a catalogue band (below) — in OPPOSITE tones. Each
 * particle keeps two tinted silhouettes (a body tint + a header tint) and
 * cross-fades between them as it drifts across the band boundary, so a particle
 * rising into the header flips its colour to stay in high contrast.
 *   • Dark mode  → body silver/white, header dark charcoal.
 *   • Light mode → body charcoal,     header light parchment.
 *
 * Section-based density: initial Y is biased toward the lower ~75% and a soft
 * gravity nudges any particle inside the header band back down, so the body
 * reads denser while the header stays airy (a few still rise in for the X-ray).
 *
 * Physics: ULTRA-VISCOUS — a very soft cursor repulsion impulse plus heavy
 * friction (0.85), so particles ease away slowly and lose momentum quickly, as
 * if suspended in a dense fluid.
 *
 * Colour reaction: proximity to the cursor mainly modulates opacity — the same
 * tint surges to a near-opaque, intense version of itself. Brand gold (#EDC071)
 * appears solely as a razor-thin, SHARP proximity rim: the gold silhouette is
 * drawn ~1px proud of the body and masked by the body on top, leaving only a
 * crisp golden outline that grows with proximity. No blurred glow, no smeared
 * kinetic trail, no canvas shadowBlur.
 *
 * Crisp particles: the silhouettes themselves carry NO programmatic drop shadow
 * or blur halo and only in-plane (z-axis) rotation/translation, so they read as
 * clean flat shapes. (Depth in the updated brand system lives on the page chrome —
 * buttons and cards — not on the drifting field.) The kinetic gold "phantom"
 * trail is kept minimal so it never smears into a shadow.
 *
 * First-load robustness: image preloading is awaited and all canvas sizing runs
 * inside nextTick() (plus a paint frame) so the field renders correctly on the
 * very first SPA navigation — not only after a manual refresh.
 */
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useReveal } from '../composables/useReveal.js'
import { useTheme } from '../composables/useTheme.js'
import { deviceArt } from '../composables/useDeviceArt.js'

// Static imports of the FOUR shipped backdrops. Explicit (not a glob) so the
// build is deterministic and can never try to resolve a deleted asset — the old
// background-products4/5.png references are gone for good.
import bg0 from '../assets/background-products.png'
import bg1 from '../assets/background-products1.png'
import bg2 from '../assets/background-products2.png'
import bg3 from '../assets/background-products3.png'

const { t, tm } = useI18n()
const { isDark } = useTheme()
const route = useRoute()

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
const pad2 = (n) => String(n + 1).padStart(2, '0')
// Resolve a product's stable index in the full catalogue (the filtered loop
// index is not stable) so cards route to the correct detail page.
const productId = (p) => products.value.findIndex((x) => x.name === p.name)

useReveal()

/* ── Electric custom-image particle field ─────────────────────────────────── */
const pageRef = ref(null)
const heroRef = ref(null)
const canvasRef = ref(null)
// Live header height (CSS px). Drives the canvas inversion boundary AND the
// height of the header background band, so the two stay perfectly in step.
const heroH = ref(0)

const SOURCES = [bg0, bg1, bg2, bg3]
// For each source we keep three offscreen silhouettes: `tint` (flat body colour
// for the catalogue band), `tintAlt` (the inverted header-band colour) and
// `glow` (electric gold for the proximity pulse layer).
const images = SOURCES.map((src) => ({ img: new Image(), src, ready: false, aspect: 1, tint: null, tintAlt: null, glow: null }))
let anyReady = false

let ctx = null
let rafId = 0
let resizeObs = null
let viewObs = null
let running = false
let inView = true
// Guards an async onMounted: if the component is torn down (e.g. a fast router
// transition) before layout settles, we must not touch a stale/removed canvas.
let destroyed = false

const particles = []
// `speed` captures how fast the cursor is moving so fast flicks hit harder.
const mouse = { x: -9999, y: -9999, active: false, speed: 0 }
let W = 0
let H = 0
let DPR = 1

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const TAU = Math.PI * 2
const FRICTION = 0.85 // ultra-viscous fluid — momentum bleeds off fast (heavy + buoyant)
const REPEL_RADIUS = 175 // px — impulse field around the cursor
const CHARGE_RADIUS = 230 // px — (larger) proximity-intensity field
const IMPULSE = 0.07 // very soft push — particles ease away slowly under force
const SPEED_BOOST = 0.006 // barely-there cursor-speed amplification
const BASE_PULSE = 0.013 // baseline breathing rate (slow + calm)
const PULSE_VARIANCE = [0.6, 1.5] // per-particle frequency spread → async breathing
const CHARGE_PULSE = 0.05 // gentle extra breathing near the cursor
const ACCENT = '#EDC071' // brand gold — used ONLY for the sharp proximity rim
const HEADER_GRAVITY = 0.05 // soft downward nudge applied only inside the header band
// Body tints (catalogue band) + their inverted header-band counterparts.
const TINT_DARK = '#E6E3DC' // silver / crisp white — dark-mode body
const TINT_LIGHT = '#1A1714' // deep charcoal — light-mode body
const HEADER_DARK = '#1A1714' // charcoal — flips against the dark-mode parchment header
const HEADER_LIGHT = '#F2EDE4' // light parchment — flips against the light-mode charcoal header
const lerp = (a, b, t) => a + (b - a) * t
const rand = (a, b) => a + Math.random() * (b - a)
const bodyColor = () => (isDark.value ? TINT_DARK : TINT_LIGHT)
const headerColor = () => (isDark.value ? HEADER_DARK : HEADER_LIGHT)

/* Build a flat solid-colour silhouette of an image via `source-in` masking —
   keeps the PNG's alpha shape, replaces all colour with one flat tint. */
function tintSilhouette(image, color) {
  const w = image.naturalWidth || 1
  const h = image.naturalHeight || 1
  const off = document.createElement('canvas')
  off.width = w
  off.height = h
  const o = off.getContext('2d')
  o.drawImage(image, 0, 0)
  o.globalCompositeOperation = 'source-in'
  o.fillStyle = color
  o.fillRect(0, 0, w, h)
  return off
}

// Re-tint every loaded image to the current theme — body AND header colours.
// (The gold glow layer is theme-independent, built once on load.) Repaint if the
// loop is paused so a theme flip is reflected even when off-screen.
function retint() {
  const body = bodyColor()
  const head = headerColor()
  for (const slot of images) {
    if (!slot.ready) continue
    slot.tint = tintSilhouette(slot.img, body)
    slot.tintAlt = tintSilhouette(slot.img, head)
  }
  if (!running && ctx) step(performance.now())
}
watch(isDark, retint)

// Route reactivity: whenever navigation lands on (or back on) this view, wait a
// tick for the DOM to settle, then re-measure the canvas against its parent. This
// keeps the field correctly sized through SPA route changes — even the edge case
// where the component is reused — so it never mounts at the wrong size and needs
// a manual refresh. The ResizeObserver below is the primary guarantee; this is a
// belt-and-suspenders pass keyed directly to the route.
watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    if (destroyed || !pageRef.value || !canvasRef.value) return
    resize()
    if (!running) start()
  }
)

function seedParticles() {
  particles.length = 0
  // Round the count to a multiple of the image count so the assets split
  // perfectly equally across the field.
  const n = images.length
  const raw = Math.max(n, Math.min(80, Math.round((W * H) / 28000)))
  const count = Math.max(n, Math.round(raw / n) * n)
  // Fraction of the canvas occupied by the (sparse) header band.
  const headerFrac = H > 0 ? Math.min(0.6, heroH.value / H) : 0
  for (let i = 0; i < count; i++) {
    // Depth: skew toward small/far so the field stays airy.
    const t = Math.pow(Math.random(), 1.5)
    const size = lerp(26, 158, t) // drawn HEIGHT in px
    const drift = lerp(0.03, 0.13, t) // gentle base drift for the fluid feel
    const dir = Math.random() * TAU
    // Section-based density: the body must read DENSE while the header stays
    // airy. Only ~8% of particles seed into the header band (the colour-
    // inversion "travellers"); the remaining ~92% are seeded strictly BELOW the
    // header band and biased toward the lower body, so the catalogue is richly
    // populated and the header breathes.
    const yRoll = Math.random()
    let yt
    if (yRoll < 0.08) {
      yt = (yRoll / 0.08) * headerFrac // a sparse few rise into the header
    } else {
      const bodySpan = 1 - headerFrac
      yt = headerFrac + Math.pow(Math.random(), 0.85) * bodySpan // dense body
    }
    particles.push({
      imgIndex: i % n, // perfectly equal distribution across the images
      x: Math.random() * W,
      y: yt * H,
      size,
      opacity: lerp(0.06, 0.18, t), // subtle, ambient
      rot: Math.random() * TAU, // in-plane (2D) angle only
      rotSpeed: rand(-0.0016, 0.0016), // slow organic spin
      baseVx: Math.cos(dir) * drift, // persistent gentle drift
      baseVy: Math.sin(dir) * drift,
      vx: 0, // impulse velocity (friction-decayed)
      vy: 0,
      charge: 0, // 0 = calm … 1 = fully electrified (eased toward proximity)
      // Asynchronous baseline glow: a randomised START PHASE *and* FREQUENCY,
      // so every particle breathes out of step with the others.
      pulse: Math.random() * TAU,
      pulseFreq: BASE_PULSE * rand(PULSE_VARIANCE[0], PULSE_VARIANCE[1]),
    })
  }
}

function resize() {
  const el = pageRef.value
  const cv = canvasRef.value
  if (!el || !cv) return
  W = el.clientWidth
  H = el.clientHeight
  heroH.value = heroRef.value ? heroRef.value.clientHeight : 0
  DPR = Math.min(window.devicePixelRatio || 1, 2)
  cv.width = Math.round(W * DPR)
  cv.height = Math.round(H * DPR)
  ctx = cv.getContext('2d')
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
  // Keep particles crisp — never let the canvas apply a programmatic shadow.
  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'
  seedParticles()
  if (!running) step(performance.now())
}

function drawParticle(p) {
  // ── kinematics: persistent drift + decaying impulse ───────────────────
  p.x += p.baseVx + p.vx
  p.y += p.baseVy + p.vy
  p.rot += p.rotSpeed
  p.vx *= FRICTION
  p.vy *= FRICTION

  // Soft section gravity: a gentle downward nudge ONLY while inside the header
  // band, so particles drift back down into the body and the header stays
  // sparse (a few still rise in for the colour-inversion effect).
  if (p.y < heroH.value) p.y += HEADER_GRAVITY

  // ── cursor interaction: repulsion impulse + proximity intensity ───────
  let target = 0
  if (mouse.active) {
    const dx = p.x - mouse.x
    const dy = p.y - mouse.y
    const d = Math.hypot(dx, dy) || 1
    if (d < REPEL_RADIUS) {
      const force = (1 - d / REPEL_RADIUS) * IMPULSE * (1 + mouse.speed * SPEED_BOOST)
      p.vx += (dx / d) * force
      p.vy += (dy / d) * force
    }
    if (d < CHARGE_RADIUS) target = 1 - d / CHARGE_RADIUS
  }
  p.charge += (target - p.charge) * 0.08 // eased proximity → opacity intensity

  // ── wrap the screen edges ─────────────────────────────────────────────
  const m = p.size
  if (p.x < -m) p.x = W + m
  else if (p.x > W + m) p.x = -m
  if (p.y < -m) p.y = H + m
  else if (p.y > H + m) p.y = -m

  const slot = images[p.imgIndex]
  if (!slot.tint) return // image / tint not ready yet (graceful: just skip)

  // ── baseline "breath" pulse ───────────────────────────────────────────
  p.pulse += p.pulseFreq + p.charge * CHARGE_PULSE
  const wave = 0.5 + 0.5 * Math.sin(p.pulse) // 0..1

  const drawH = p.size
  const drawW = p.size / slot.aspect

  // ── dynamic colour inversion across the header boundary ───────────────
  // `f` = fraction of the particle's vertical extent sitting inside the header
  // band [0 … heroH]. 1 → fully in header (inverted tint), 0 → fully below
  // (body tint), between → an X-ray cross-fade as it straddles the seam.
  const bound = heroH.value
  const top = p.y - drawH / 2
  const bot = p.y + drawH / 2
  let f
  if (bot <= bound) f = 1
  else if (top >= bound) f = 0
  else f = (bound - top) / (bot - top)

  const x = -drawW / 2
  const y = -drawH / 2

  // ── Main silhouette + micro-refined gold proximity rim ────────────────
  // Proximity feedback is opacity-led: the silhouette's own alpha surges toward
  // opaque as the cursor nears (p.charge). On top of that — and ONLY on top of
  // that — we add a *sharp*, hairline gold rim: the gold glow silhouette drawn
  // ~1px proud of the body, then masked by the body painted on top, so just a
  // crisp golden edge remains. No canvas shadowBlur, no smeared kinetic trail —
  // a delicate, micro-refined accent rather than a heavy blurry halo.
  const baseAlpha = p.opacity * (0.7 + 0.3 * wave)
  const fullAlpha = Math.min(1, baseAlpha + p.charge * (0.85 + 0.1 * wave))
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rot)

  // Sharp gold rim — drawn first (under the body) and a hair larger, so only a
  // ~1px gold edge peeks out around the silhouette. Alpha tracks proximity only
  // and is capped low, keeping it a fine accent, never a glow.
  if (p.charge > 0.05 && slot.glow) {
    const rim = 0.7 // razor-sharp micro-edge — deliberately tight, never a halo
    ctx.globalAlpha = Math.min(0.28, p.charge * 0.32)
    ctx.drawImage(slot.glow, x - rim, y - rim, drawW + rim * 2, drawH + rim * 2)
  }

  // Body / header tint cross-fade painted on top, masking the rim's interior so
  // the gold survives only as the outline.
  if (f < 0.999) {
    ctx.globalAlpha = fullAlpha * (1 - f)
    ctx.drawImage(slot.tint, x, y, drawW, drawH)
  }
  if (f > 0.001 && slot.tintAlt) {
    ctx.globalAlpha = fullAlpha * f
    ctx.drawImage(slot.tintAlt, x, y, drawW, drawH)
  }
  ctx.restore()
}

function step(time) {
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  if (anyReady) {
    for (const p of particles) drawParticle(p)
  }
  mouse.speed *= 0.9 // bleed off the cursor-speed boost each frame
  if (running) rafId = requestAnimationFrame(step)
}

function start() {
  if (running || prefersReduced || !inView) return
  running = true
  rafId = requestAnimationFrame(step)
}

function stop() {
  running = false
  cancelAnimationFrame(rafId)
}

function onPointerMove(e) {
  const rect = canvasRef.value.getBoundingClientRect()
  const nx = e.clientX - rect.left
  const ny = e.clientY - rect.top
  if (mouse.active) {
    mouse.speed = Math.max(mouse.speed, Math.hypot(nx - mouse.x, ny - mouse.y))
  }
  mouse.x = nx
  mouse.y = ny
  mouse.active = true
}
function onPointerLeave() {
  mouse.active = false
  mouse.x = -9999
  mouse.y = -9999
  mouse.speed = 0
}
function onVisibility() {
  if (document.hidden) stop()
  else start()
}

// Build a slot's three silhouettes (body / header / gold glow) once its image
// has decoded. Kept separate so both the preload and a later theme flip reuse it.
function buildSilhouettes(slot) {
  if (slot.img.naturalWidth) slot.aspect = slot.img.naturalHeight / slot.img.naturalWidth
  slot.glow = tintSilhouette(slot.img, ACCENT)
  slot.tint = tintSilhouette(slot.img, bodyColor())
  slot.tintAlt = tintSilhouette(slot.img, headerColor())
}

// Fully preload every brand image and build its silhouettes. Resolves only once
// ALL images have settled (loaded or failed), so the caller can await a single
// promise before the first real draw. A missing/broken file leaves its slot
// un-ready and is simply skipped by drawParticle — the field degrades
// gracefully rather than crashing.
function preloadImages() {
  return Promise.all(
    images.map(
      (slot) =>
        new Promise((resolve) => {
          slot.img.onload = () => {
            slot.ready = true
            anyReady = true
            buildSilhouettes(slot)
            resolve()
          }
          slot.img.onerror = () => {
            slot.ready = false
            resolve()
          }
          slot.img.src = slot.src
        })
    )
  )
}

onMounted(async () => {
  // Reset module-scope guards so a second mount (navigate away → back) starts
  // fresh and doesn't bail out due to a stale `destroyed = true` from the
  // previous instance's onBeforeUnmount.
  destroyed = false
  running = false
  ctx = null

  // Kick off image decoding immediately (parallel with layout settling).
  const ready = preloadImages()

  // Defer canvas sizing until after Vue has flushed the DOM. With the App's
  // <Transition mode="out-in"> fade, the page mounts mid-transition on the first
  // SPA navigation; measuring clientHeight synchronously then can yield a stale/
  // zero size → a blank field until a manual refresh. nextTick() guarantees the
  // template is committed before we measure, and the ResizeObserver below self-
  // heals the canvas if the final layout arrives a beat later (fonts, transition
  // end), so the field is always sized correctly on the very first visit.
  await nextTick()
  if (destroyed || !pageRef.value || !canvasRef.value) return

  resize()

  // The ResizeObserver is set up unconditionally so the canvas re-measures and
  // re-seeds the moment the element settles into its final box — this is what
  // makes the first paint reliable regardless of transition timing.
  resizeObs = new ResizeObserver(() => resize())
  resizeObs.observe(pageRef.value)

  if (!prefersReduced) {
    const el = pageRef.value
    el.addEventListener('pointermove', onPointerMove, { passive: true })
    el.addEventListener('pointerleave', onPointerLeave, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    viewObs = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        if (inView) start()
        else stop()
      },
      { threshold: 0 }
    )
    viewObs.observe(el)

    start()
  }

  // Once every image has fully decoded, re-seed against the now-final size and
  // paint, so the very first visit shows a complete field — never a blank one.
  await ready
  if (destroyed || !ctx) return
  seedParticles()
  if (!running) step(performance.now())
})

onBeforeUnmount(() => {
  destroyed = true
  stop()
  for (const slot of images) {
    slot.img.onload = null
    slot.img.onerror = null
  }
  const el = pageRef.value
  if (el) {
    el.removeEventListener('pointermove', onPointerMove)
    el.removeEventListener('pointerleave', onPointerLeave)
  }
  document.removeEventListener('visibilitychange', onVisibility)
  viewObs?.disconnect()
  resizeObs?.disconnect()
})
</script>

<template>
  <!-- One positioned stage spans the whole page so the particle field flows
       continuously from the catalogue up into the header. The two background
       BANDS sit below the canvas (so particles float over them); all content
       sits above. `--hero-h` keeps the header band height in sync with JS. -->
  <div class="products-page" ref="pageRef" :style="{ '--hero-h': heroH + 'px' }">
    <!-- Background bands (below particles) — header + catalogue, opposite tones -->
    <div class="pf-bg pf-bg-hero" aria-hidden="true">
      <span class="products-hero-grid"></span>
      <span class="products-hero-aura"></span>
    </div>
    <div class="pf-bg pf-bg-stage" aria-hidden="true"></div>

    <!-- Continuous particle field (above bands, below content) -->
    <canvas ref="canvasRef" class="particle-canvas" aria-hidden="true"></canvas>

    <!-- ── Header: COLLECTION / Maison Catalogue ─────────────────────────────── -->
    <section class="products-hero relative py-24 md:py-36 text-center" ref="heroRef">
      <div class="relative max-w-5xl mx-auto px-8">
        <div class="flex items-center justify-center gap-4">
          <span class="products-hero-rule h-px w-10"></span>
          <span class="products-hero-eyebrow text-[11px] uppercase tracking-[0.4em] font-light">{{ t('products.hero.eyebrow') }}</span>
          <span class="products-hero-rule h-px w-10"></span>
        </div>
        <h1 class="products-hero-title font-serif font-light text-5xl md:text-7xl tracking-wide mt-8 leading-[1.05]">
          {{ t('products.hero.title') }}
        </h1>
      </div>
    </section>

    <!-- ── Stage: catalogue ──────────────────────────────────────────────────── -->
    <div class="products-stage">
      <div class="stage-content">
        <div class="mx-auto max-w-6xl px-8">
          <!-- Intro statement -->
          <div class="reveal text-center pt-20 md:pt-28 max-w-3xl mx-auto">
            <p class="stage-intro font-serif italic font-light text-2xl md:text-[2rem] leading-relaxed">
              {{ t('products.intro') }}
            </p>
            <div class="mx-auto mt-9 flex items-center justify-center gap-3 stage-intro-mark">
              <span class="h-px w-12"></span>
              <span class="text-xs">&#9670;</span>
              <span class="h-px w-12"></span>
            </div>
          </div>

          <!-- Filter tabs -->
          <div class="mt-16 flex flex-wrap justify-center gap-x-10 gap-y-3">
            <button
              v-for="f in filters"
              :key="f.key"
              type="button"
              @click="active = f.key"
              class="stage-tab"
              :class="{ 'is-active': active === f.key }"
            >
              {{ t(f.label) }}
              <span class="stage-tab-rule" :class="active === f.key ? 'scale-x-100' : 'scale-x-0'"></span>
            </button>
          </div>

          <!-- Premium glassmorphic product grid — each card is a single flat
               link: a framed device "render" up top, blueprint type below. -->
          <div class="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3 pb-28">
            <router-link
              v-for="(p, i) in filtered"
              :key="p.name + i"
              :to="`/products/${productId(p)}`"
              class="glass-card"
              :style="{ animationDelay: `${(i % 6) * 70}ms` }"
            >
              <!-- Top half — framed product imagery (flat line-art device) -->
              <div class="card-media">
                <span class="card-cat">{{ categoryLabel(p.category) }}</span>
                <span class="card-index">{{ pad2(i) }}</span>
                <svg
                  class="card-art"
                  viewBox="0 0 48 36"
                  fill="none"
                  stroke-width="1.1"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <g class="da-frame">
                    <path v-for="(d, k) in deviceArt(p.category).frame" :key="'f' + k" :d="d" />
                  </g>
                  <g class="da-signal">
                    <path v-for="(d, k) in deviceArt(p.category).signal" :key="'s' + k" :d="d" />
                  </g>
                </svg>
                <span class="card-media-tick" aria-hidden="true"></span>
              </div>

              <!-- Bottom half — blueprint typography -->
              <div class="card-body">
                <h3 class="card-name font-serif font-light">{{ p.name }}</h3>
                <span class="card-rule"></span>
                <p class="card-desc">{{ p.desc }}</p>
                <span class="card-inquire">
                  {{ t('products.viewCta') }}
                  <span class="dir-arrow" aria-hidden="true"></span>
                </span>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Page shell — one stacking context for the full-page particle field ─────── */
.products-page {
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

/* Background bands sit at the very back (below the canvas). The header band's
   height tracks the live `--hero-h`; the catalogue band fills the remainder. */
.pf-bg {
  position: absolute;
  inset-inline: 0;
  z-index: 0;
  pointer-events: none;
}
.pf-bg-hero {
  top: 0;
  height: var(--hero-h, 0px);
  background: #1a1714; /* light-mode header = deep charcoal */
  transition: background-color 300ms ease;
}
.pf-bg-stage {
  top: var(--hero-h, 0px);
  bottom: 0;
  /* light-mode catalogue = warm parchment + faint gold vignette */
  background-color: rgb(var(--c-parchment-light));
  background-image: radial-gradient(120% 60% at 50% 0%, rgba(138, 106, 26, 0.05), transparent 60%);
  transition: background-color 360ms ease;
}
/* Header decoration painted onto the band, beneath the particles. */
.products-hero-grid {
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(90deg, transparent 0, transparent 119px, rgba(244, 215, 145, 0.05) 119px, rgba(244, 215, 145, 0.05) 120px);
  -webkit-mask-image: linear-gradient(180deg, #000, transparent 92%);
          mask-image: linear-gradient(180deg, #000, transparent 92%);
}
.products-hero-aura {
  position: absolute;
  inset: 0;
  background: radial-gradient(60% 90% at 50% 0%, rgba(237, 192, 113, 0.16), transparent 70%);
}

/* The floating image-particle canvas — crisp, ambient, non-interactive layer. */
.particle-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

/* ── Header content ────────────────────────────────────────────────────────── */
.products-hero { position: relative; z-index: 2; }
.products-hero-eyebrow { color: rgb(237 192 113 / 0.8); }
.products-hero-rule { background: rgb(237 192 113 / 0.6); }
.products-hero-title { color: #f2ede4; }

/* ── Theme-adaptive catalogue stage (text + glass tokens) ───────────────────
   The light-mode palette lives here; the dark override lives in src/style.css
   (html.dark .products-stage …). The particle TINTS are switched from JS. */
.products-stage {
  position: relative;
  z-index: 2;
  /* Empty drift zone below the catalogue so the last cards clear the dark
     fade — the particles get a calm dark stretch to drift into before the footer. */
  padding-block-end: 7rem;

  --stage-gold: #8a6a1a;
  --stage-text: #1a1714;
  --stage-muted: rgba(26, 23, 20, 0.62);
  --stage-faint: rgba(26, 23, 20, 0.42);
  --stage-rule: rgba(138, 106, 26, 0.55);
  --glass-bg: rgba(255, 255, 255, 0.5);
  --glass-bg-hover: rgba(255, 255, 255, 0.72);
  --glass-border: rgba(26, 23, 20, 0.1);
  --glass-sheen: rgba(255, 255, 255, 0.55);
  --media-bg: rgba(26, 23, 20, 0.035);
  --device-frame: rgba(26, 23, 20, 0.5);
  --device-signal: #8a6a1a;
}

.stage-content { position: relative; }

/* ── Intro statement ─────────────────────────────────────────────────────── */
.stage-intro { color: var(--stage-text); }
.stage-intro-mark { color: var(--stage-gold); }
.stage-intro-mark span:first-child,
.stage-intro-mark span:last-child { background: var(--stage-rule); }

/* ── Filter tabs ───────────────────────────────────────────────────────── */
.stage-tab {
  position: relative;
  padding-block-end: 0.25rem;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  font-weight: 300;
  color: var(--stage-faint);
  transition: color 200ms ease;
}
.stage-tab:hover,
.stage-tab.is-active { color: var(--stage-text); }
.stage-tab-rule {
  position: absolute;
  inset-inline: 0;
  bottom: -1px;
  height: 1px;
  background: var(--stage-gold);
  transition: transform 220ms ease;
}

/* ── Premium frosted-glass product cards ───────────────────────────────────
   Near-transparent fill + a strong backdrop blur frost the field behind each
   card. A framed device render tops the card; sharp blueprint type sits below. */
.glass-card {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  backdrop-filter: blur(16px) saturate(1.2);
  overflow: hidden;
  /* Updated brand aesthetic: a soft drop shadow lifts the card off the field;
     it floats a little higher on hover for a premium, tactile feel. */
  box-shadow: 0 8px 26px rgba(26, 23, 20, 0.1), 0 2px 6px rgba(26, 23, 20, 0.06);
  transition: background-color 360ms ease, border-color 360ms ease,
              transform 420ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 420ms ease;
  animation: card-in 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
/* A whisper-fine gold top hairline catches the eye like a glass edge. */
.glass-card::after {
  content: '';
  position: absolute;
  inset-block-start: 0;
  inset-inline: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(237, 192, 113, 0.5), transparent);
  opacity: 0.6;
  pointer-events: none;
  z-index: 2;
}
.glass-card:hover {
  background: var(--glass-bg-hover);
  border-color: rgba(237, 192, 113, 0.5);
  transform: translateY(-5px);
  box-shadow: 0 18px 40px rgba(26, 23, 20, 0.16), 0 5px 12px rgba(26, 23, 20, 0.08);
}
@keyframes card-in {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: none; }
}

/* Top half — the framed product "render". Flat tinted panel, full device shown
   via object-fit:contain, divided from the body by a gold hairline. */
.card-media {
  position: relative;
  aspect-ratio: 4 / 3;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: var(--media-bg);
  border-block-end: 1px solid var(--glass-border);
}
/* Diagonal glass sheen — purely flat, adds depth without any 3D/shadow. */
.card-media::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(150deg, var(--glass-sheen), transparent 46%);
  opacity: 0.45;
}
.card-art {
  position: relative;
  width: 64%;
  height: 64%;
  object-fit: contain;
  transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
}
.glass-card:hover .card-art { transform: scale(1.04); }
.da-frame { stroke: var(--device-frame); }
.da-signal { stroke: var(--device-signal); }
/* A small gold corner tick — a clinical "registration mark". */
.card-media-tick {
  position: absolute;
  inset-block-start: 0.9rem;
  inset-inline-end: 0.9rem;
  width: 10px;
  height: 10px;
  border-top: 1px solid rgba(237, 192, 113, 0.6);
  border-inline-end: 1px solid rgba(237, 192, 113, 0.6);
}
.card-cat {
  position: absolute;
  inset-block-start: 1rem;
  inset-inline-start: 1.25rem;
  z-index: 1;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-weight: 400;
  color: var(--stage-gold);
}
.card-index {
  position: absolute;
  inset-block-end: 0.9rem;
  inset-inline-end: 1.25rem;
  z-index: 1;
  font-size: 11px;
  letter-spacing: 0.18em;
  font-weight: 400;
  color: var(--stage-faint);
  font-feature-settings: 'tnum' 1;
}

/* Bottom half — blueprint typography. */
.card-body {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  padding: 1.75rem 1.75rem 2rem;
}
.card-name {
  margin: 0;
  font-size: 1.6rem;
  line-height: 1.2;
  color: var(--stage-text);
}
.card-rule {
  display: block;
  width: 28px;
  height: 1px;
  margin-block: 1rem;
  background: var(--stage-rule);
}
.card-desc {
  flex: 1 1 auto;
  font-size: 0.875rem;
  line-height: 1.7;
  font-weight: 300;
  color: var(--stage-muted);
}
.card-inquire {
  align-self: flex-start;
  margin-block-start: 1.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  font-weight: 300;
  color: var(--stage-text);
  border-block-end: 1px solid var(--stage-rule);
  padding-block-end: 0.25rem;
  transition: color 220ms ease, border-color 220ms ease;
}
.card-inquire:hover,
.glass-card:hover .card-inquire {
  color: var(--stage-gold);
  border-block-end-color: var(--stage-gold);
}

/* ── Persian — neutralise Latin tracking; promote weights per the type system. */
html[lang='fa'] .products-hero-eyebrow,
html[lang='fa'] .stage-tab,
html[lang='fa'] .card-cat,
html[lang='fa'] .card-index,
html[lang='fa'] .card-inquire {
  letter-spacing: 0;
  text-transform: none;
}
html[lang='fa'] .card-cat,
html[lang='fa'] .card-inquire { font-weight: 700; }

@media (prefers-reduced-motion: reduce) {
  .glass-card { animation: none; }
  .glass-card:hover { transform: none; }
  .stage-tab-rule,
  .glass-card,
  .card-art,
  .card-inquire { transition: none; }
}
</style>
