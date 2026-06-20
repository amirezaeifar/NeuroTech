<script setup>
/**
 * ProductsView — "Organic Neural Net & Glassmorphism".
 *
 * The page opens with a split-tone hero (mirroring the Global Trade hero): a deep
 * charcoal #1A1714 band over the light parchment body in light mode, inverted to
 * warm parchment over charcoal in dark mode. The "Maison Catalogue / The
 * Collection" identity lives in that band.
 *
 * Below it, a self-contained stage hosts an HTML5 <canvas> rendering an ORGANIC,
 * branching neural field — fractal/L-system-style trees that grow and split like
 * mycelium, dendrites or leaf veins, drifting with a slow elegant sway and a
 * fluid mouse repulsion (branches bend away from the cursor). A soft CSS blur
 * keeps it ambient. Champagne gold in dark, deep bronze ink in light.
 *
 * Products sit in premium frosted-glass cards — a very low background opacity and
 * a strong backdrop blur let the organic field read clearly through them.
 *
 * Native RTL: layout uses logical properties + the shared .dir-arrow glyph; the
 * field is symmetric so it needs no direction handling.
 */
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useReveal } from '../composables/useReveal.js'
import { useTheme } from '../composables/useTheme.js'

const { t, tm } = useI18n()
const { isDark } = useTheme()

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

/* ── Organic branching neural field ───────────────────────────────────────
   Instead of a geometric node/link grid we grow a small forest of fractal
   trees. Each tree starts from a seed point and a base direction, then splits
   recursively into ever-shorter, thinner child branches — an L-system-like
   structure that reads as mycelium / dendrites / leaf-vein networks. Every
   frame the branches sway with a slow sine breath and bend away from the
   cursor, so the whole field drifts organically.

   The colour + intensity adapt to the global theme (champagne gold on charcoal
   in dark; deep bronze ink on parchment in light), recomputed on every toggle. */
const GOLD = '237, 192, 113'
const INK_LIGHT = '96, 76, 38'
let nodeRGB = GOLD
let alphaScale = 1
const stageRef = ref(null)
const canvasRef = ref(null)

let ctx = null
let rafId = 0
let resizeObs = null
let viewObs = null
let running = false
let inView = true

const trees = []
const mouse = { x: -9999, y: -9999, active: false }
let W = 0
let H = 0
let DPR = 1

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const MAX_DEPTH = 6 // deeper recursion → more intricate fractal detail
const BASE_LEN = 38 // px — shorter trunk = a more "zoomed-out", denser network
const SWAY_SPEED = 0.00042 // very slow
const REPEL_RADIUS = 160 // px — soft repulsion field around the cursor
const TAU = Math.PI * 2

/* Build one branch node (relative description; positions are computed per-frame
   so the structure can sway + react to the cursor). */
function makeBranch(depth) {
  const node = {
    len: BASE_LEN * Math.pow(0.72, depth) * (0.85 + Math.random() * 0.35),
    spread: 0, // set by the parent when this becomes a child
    swayPhase: Math.random() * TAU,
    swayAmp: 0.05 + depth * 0.03, // tips sway more than the trunk
    children: [],
  }
  if (depth < MAX_DEPTH) {
    const n = depth === 0 ? 2 : Math.random() < 0.28 ? 3 : 2
    for (let i = 0; i < n; i++) {
      const child = makeBranch(depth + 1)
      // fan the children out symmetrically with a little organic jitter
      const base = (i - (n - 1) / 2) * (0.55 + Math.random() * 0.18)
      child.spread = base + (Math.random() - 0.5) * 0.18
      node.children.push(child)
    }
  }
  return node
}

function buildForest() {
  trees.length = 0
  // Denser, zoomed-out spread so the intricate branching reads clearly across
  // the whole stage (the smaller BASE_LEN keeps each tree compact).
  const count = Math.max(6, Math.min(16, Math.round((W * H) / 95000)))
  for (let i = 0; i < count; i++) {
    trees.push({
      x: Math.random() * W,
      y: Math.random() * H,
      dir: Math.random() * TAU, // grow in any direction for a vein-like spread
      drift: (Math.random() - 0.5) * 0.00006, // whole tree rotates imperceptibly
      root: makeBranch(0),
    })
  }
}

function resize() {
  const el = stageRef.value
  const cv = canvasRef.value
  if (!el || !cv) return
  W = el.clientWidth
  H = el.clientHeight
  DPR = Math.min(window.devicePixelRatio || 1, 1.5) // blurred anyway — cap DPR
  cv.width = Math.round(W * DPR)
  cv.height = Math.round(H * DPR)
  ctx = cv.getContext('2d')
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
  ctx.lineCap = 'round'
  buildForest()
  // Paint one frame immediately so the field is present on mount / when paused.
  if (!running) step(performance.now())
}

/* Recursively draw one branch and its subtree. Returns nothing; positions flow
   down from the parent's endpoint. */
function drawBranch(node, x, y, dir, depth, time) {
  const sway = node.swayAmp * Math.sin(time * SWAY_SPEED + node.swayPhase)
  let a = dir + node.spread + sway

  // Fluid repulsion: bend the branch away from the cursor, strongest up close.
  if (mouse.active) {
    const dx = x - mouse.x
    const dy = y - mouse.y
    const d2 = dx * dx + dy * dy
    if (d2 < REPEL_RADIUS * REPEL_RADIUS) {
      const d = Math.sqrt(d2) || 1
      const away = Math.atan2(dy, dx)
      const infl = (1 - d / REPEL_RADIUS) * 0.6
      // shortest-path angular nudge toward the "away" direction
      const diff = Math.atan2(Math.sin(away - a), Math.cos(away - a))
      a += diff * infl
    }
  }

  const ex = x + Math.cos(a) * node.len
  const ey = y + Math.sin(a) * node.len

  const reach = MAX_DEPTH - depth
  ctx.strokeStyle = `rgba(${nodeRGB}, ${((0.05 + reach * 0.014) * alphaScale).toFixed(3)})`
  ctx.lineWidth = Math.max(0.4, reach * 0.46) // finer lines read crisply without blur
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(ex, ey)
  ctx.stroke()

  if (node.children.length) {
    for (const child of node.children) drawBranch(child, ex, ey, a, depth + 1, time)
  } else {
    // crisp tip node — a small organic terminal
    ctx.fillStyle = `rgba(${nodeRGB}, ${(0.14 * alphaScale).toFixed(3)})`
    ctx.beginPath()
    ctx.arc(ex, ey, 1.3, 0, TAU)
    ctx.fill()
  }
}

function step(time) {
  ctx.clearRect(0, 0, W, H)
  for (const tree of trees) {
    tree.dir += tree.drift
    drawBranch(tree.root, tree.x, tree.y, tree.dir, 0, time)
  }
  if (running) rafId = requestAnimationFrame(step)
}

function syncTheme() {
  if (isDark.value) {
    nodeRGB = GOLD
    alphaScale = 1
  } else {
    nodeRGB = INK_LIGHT
    alphaScale = 1.8 // bronze ink needs more presence on the bright parchment
  }
  if (!running && ctx) step(performance.now())
}
watch(isDark, syncTheme)

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
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
  mouse.active = true
}
function onPointerLeave() {
  mouse.active = false
  mouse.x = -9999
  mouse.y = -9999
}
function onVisibility() {
  if (document.hidden) stop()
  else start()
}

onMounted(() => {
  syncTheme() // pick the right palette before the first frame paints
  resize()
  if (!prefersReduced) {
    const el = stageRef.value
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

    resizeObs = new ResizeObserver(() => resize())
    resizeObs.observe(el)

    start()
  }
})

onBeforeUnmount(() => {
  stop()
  const el = stageRef.value
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
  <div class="products-page">
    <!-- ── Split-tone hero (Global-Trade style) ──────────────────────────────
         Light mode: deep charcoal band; Dark mode: warm parchment band. The
         body below carries the opposite tone, so the screen reads top-dark /
         bottom-light in light mode and inverts in dark mode. -->
    <section class="products-hero relative overflow-hidden py-24 md:py-36 text-center">
      <div class="products-hero-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
      <div class="products-hero-aura pointer-events-none absolute inset-0" aria-hidden="true"></div>
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

    <!-- ── Stage: organic neural field + catalogue ─────────────────────────── -->
    <div class="products-stage" ref="stageRef">
      <canvas ref="canvasRef" class="neural-canvas" aria-hidden="true"></canvas>

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
               link that routes to the comprehensive product detail page. -->
          <div class="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3 pb-28">
            <router-link
              v-for="(p, i) in filtered"
              :key="p.name + i"
              :to="`/products/${productId(p)}`"
              class="glass-card"
              :style="{ animationDelay: `${(i % 6) * 70}ms` }"
            >
              <div class="relative flex items-start justify-between">
                <span class="card-cat">{{ categoryLabel(p.category) }}</span>
                <span class="card-index">{{ pad2(i) }}</span>
              </div>

              <h3 class="relative card-name font-serif font-light">{{ p.name }}</h3>

              <span class="relative card-rule"></span>

              <p class="relative card-desc">{{ p.desc }}</p>

              <span class="relative card-inquire">
                {{ t('products.detail.viewCta') }}
                <span class="dir-arrow" aria-hidden="true"></span>
              </span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Split-tone hero ───────────────────────────────────────────────────────
   Light mode = deep charcoal #1A1714 band with light text. The dark-mode
   inversion (warm parchment band + dark ink text) lives in the GLOBAL
   stylesheet (html.dark .products-hero …), mirroring the Trade / Partners
   heroes, because this build mis-compiles scoped :global(html.dark) selectors. */
.products-hero {
  background: #1a1714;
  transition: background-color 300ms ease;
}
.products-hero-eyebrow { color: rgb(237 192 113 / 0.8); }
.products-hero-rule { background: rgb(237 192 113 / 0.6); }
.products-hero-title { color: #f2ede4; }
.products-hero-aura {
  background: radial-gradient(60% 90% at 50% 0%, rgba(237, 192, 113, 0.16), transparent 70%);
}
.products-hero-grid {
  background-image: repeating-linear-gradient(90deg, transparent 0, transparent 119px, rgba(244, 215, 145, 0.05) 119px, rgba(244, 215, 145, 0.05) 120px);
  -webkit-mask-image: linear-gradient(180deg, #000, transparent 92%);
          mask-image: linear-gradient(180deg, #000, transparent 92%);
}

/* ── Theme-adaptive stage (body tone is the inverse of the hero) ───────────
   Light mode default here = warm parchment; the dark override (deep charcoal +
   glowing gold) lives in src/style.css. */
.products-stage {
  position: relative;
  isolation: isolate;
  overflow: hidden;

  --stage-surface: rgb(var(--c-parchment-light));
  --stage-gold: #8a6a1a;
  --stage-text: #1a1714;
  --stage-muted: rgba(26, 23, 20, 0.62);
  --stage-faint: rgba(26, 23, 20, 0.42);
  --stage-rule: rgba(138, 106, 26, 0.55);
  /* Premium glass: very low fill so the organic field reads through it. */
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-bg-hover: rgba(255, 255, 255, 0.16);
  --glass-border: rgba(26, 23, 20, 0.1);
  --glass-sheen: rgba(255, 255, 255, 0.35);
  --vignette: rgba(138, 106, 26, 0.05);

  background-color: var(--stage-surface);
  background-image: radial-gradient(120% 80% at 50% -10%, var(--vignette), transparent 60%);
  transition: background-color 360ms ease;
}

/* Crisp organic field — only a whisper of blur for anti-aliasing, so the
   intricate branching/fractal structure reads clearly behind the glass cards. */
.neural-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  filter: blur(0.6px);
  opacity: 1;
}

.stage-content {
  position: relative;
  z-index: 1;
}

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
   Near-transparent fill + a strong backdrop blur frost the organic field
   behind each card. A diagonal sheen (flat ::before gradient, NOT a shadow)
   and a delicate gold hairline on hover give the glass a premium read. */
.glass-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  border-radius: 6px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  -webkit-backdrop-filter: blur(24px) saturate(1.2);
  backdrop-filter: blur(24px) saturate(1.2);
  overflow: hidden;
  transition: background-color 360ms ease, border-color 360ms ease;
  animation: card-in 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
/* Diagonal glass sheen — purely flat, adds depth without any 3D/shadow. */
.glass-card::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(150deg, var(--glass-sheen), transparent 42%);
  opacity: 0.5;
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
}
.glass-card:hover {
  background: var(--glass-bg-hover);
  border-color: rgba(237, 192, 113, 0.5);
}
@keyframes card-in {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: none; }
}

/* Blueprint typography — sharp, flat, tracked caps + a clinical index marker. */
.card-cat {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-weight: 400;
  color: var(--stage-gold);
}
.card-index {
  font-size: 11px;
  letter-spacing: 0.18em;
  font-weight: 400;
  color: var(--stage-faint);
  font-feature-settings: 'tnum' 1;
}
.card-name {
  margin-block: 1.5rem 0;
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
  margin-block-start: 2rem;
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
  .stage-tab-rule,
  .glass-card,
  .card-inquire { transition: none; }
}
</style>
