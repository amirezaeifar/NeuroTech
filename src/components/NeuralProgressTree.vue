<script setup>
/**
 * NeuralProgressTree — the "Browse the Library" left sidebar.
 *
 * A vertical neural tree of the learner's progress, rendered as layered SVG with
 * a high-end glassmorphism + simulated-3D treatment:
 *
 *   • Frosted-glass panel  — backdrop blur/saturate, hairline white border, lift.
 *   • Volumetric tubes     — the trunk and dendrite branches are glass cylinders
 *                            (horizontal gloss gradient + specular streak) with a
 *                            metallic-gold inner glow that reads as emissive.
 *   • 3-D nodes            — course/module beads use a radial dark-metal fill plus
 *                            an SVG lighting filter (feSpecularLighting +
 *                            feDistantLight) for a real, consistent relief.
 *
 * Animation — ALL driven by @vueuse/motion (the Vue Motion Plugin):
 *   • Scroll fill  — useSpring() smooths raw scroll progress into a buttery,
 *                    velocity-aware value that we bind to the gold glow's
 *                    stroke-dashoffset, the travelling "comet" head, branch
 *                    reveals and node lighting. (Plugin = the animation engine;
 *                    no hand-rolled rAF easing.)
 *   • Node reveal  — the v-motion directive (:initial / :visibleOnce) pops each
 *                    bead in with a staggered spring as it enters view.
 *   • The Pulse    — useMotion() drives the active "You are here" node: an
 *                    expanding, fading inner-light ripple, repeating forever.
 *
 * Accessibility / perf: respects prefers-reduced-motion (via useReducedMotion —
 * pulse + reveal + spring smoothing are disabled, fill tracks scroll directly);
 * animates only opacity / transform / dashoffset; lighting filters apply to
 * static node geometry so the browser caches them (60fps target).
 *
 * Scope note: like the other Atlas wayfinders (see IndexSpine), development is
 * locked to LTR — physical CSS/SVG coordinates only, no BiDi mirroring.
 *
 * Scroll source: the component measures progress over the nearest ancestor
 * carrying [data-progress-track] (fallback: parent element). Pass `track` to
 * point at a specific selector.
 */
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useSpring, useMotion, useReducedMotion } from '@vueuse/motion'
import { userProgress } from '../data/userProgress.js'

const props = defineProps({
  /** userProgress payload (see src/data/userProgress.js). */
  data: { type: Object, default: () => userProgress },
  /** Optional CSS selector for the scroll track; defaults to [data-progress-track]. */
  track: { type: String, default: '' },
  /** Panel header eyebrow. */
  label: { type: String, default: 'Your pathway' },
})

/* ── Geometry constants (SVG user units; LTR) ──────────────────────────────── */
const VB_W = 300
const SPINE_X = 74          // trunk x — course nodes ride this
const MODULE_X = 212        // module beads branch out to here
const COURSE_R = 13
const MODULE_R = 7
const PAD_TOP = 54
const PAD_BOTTOM = 46
const AFTER_COURSE = 26     // course centre → first module centre
const MODULE_STEP = 46      // module → module
const AFTER_MODULES = 18    // last module → next course centre

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

/* ── Layout: flatten the curriculum into positioned nodes + branch paths ───── */
const layout = computed(() => {
  const courses = props.data?.courses ?? []
  const courseNodes = []
  const moduleNodes = []
  const branches = []
  let y = PAD_TOP
  let order = 0
  let maxY = PAD_TOP

  for (const c of courses) {
    const cy = y
    courseNodes.push({
      id: c.id, code: c.code, title: c.title, status: c.status,
      cx: SPINE_X, cy, order: order++,
    })
    maxY = Math.max(maxY, cy)
    y += AFTER_COURSE

    for (const m of c.modules ?? []) {
      const my = y
      moduleNodes.push({
        id: m.id, title: m.title, status: m.status,
        cx: MODULE_X, cy: my, order: order++,
      })
      // dendrite: rises off the trunk, then sweeps out to the bead
      branches.push({ id: `${m.id}__b`, fx: SPINE_X, fy: my - 20, tx: MODULE_X - 13, ty: my, my })
      maxY = Math.max(maxY, my)
      y += MODULE_STEP
    }
    y += AFTER_MODULES
  }

  const top = PAD_TOP
  const bottom = maxY
  const span = Math.max(1, bottom - top)
  const norm = (yy) => (yy - top) / span
  courseNodes.forEach((n) => (n.norm = norm(n.cy)))
  moduleNodes.forEach((n) => (n.norm = norm(n.cy)))
  branches.forEach((b) => (b.norm = norm(b.my)))

  return { courseNodes, moduleNodes, branches, top, bottom, span, vbW: VB_W, vbH: bottom + PAD_BOTTOM }
})

const branchD = (b) => `M ${b.fx} ${b.fy} C ${b.fx + 48} ${b.fy}, ${b.tx - 50} ${b.ty}, ${b.tx} ${b.ty}`

/* The active "You are here" node — could be a course or a module. */
const currentNode = computed(() => {
  const id = props.data?.currentNodeId
  return (
    layout.value.moduleNodes.find((n) => n.id === id) ||
    layout.value.courseNodes.find((n) => n.id === id) ||
    null
  )
})

/* ── Reduced motion ────────────────────────────────────────────────────────── */
const reduced = useReducedMotion()

/* ── Scroll → spring fill (THE Motion Plugin animation engine) ─────────────────
   `fill.t` (0→1) is written by the spring's onChange; binding it into the SVG
   gives velocity-aware, buttery fill. Reduced motion sets it directly. */
const fill = reactive({ t: 0 })
const fillSpring = useSpring(fill, { stiffness: 90, damping: 24, mass: 0.9 })

const rootEl = ref(null)

function computeProgress() {
  const el = rootEl.value
  if (!el) return 0
  const trackEl =
    (props.track && document.querySelector(props.track)) ||
    el.closest('[data-progress-track]') ||
    el.parentElement
  if (!trackEl) return 0
  const r = trackEl.getBoundingClientRect()
  const vh = window.innerHeight || document.documentElement.clientHeight
  const dist = r.height - vh
  if (dist <= 4) return clamp01((vh * 0.5 - r.top) / Math.max(vh, 1))
  return clamp01(-r.top / dist)
}

// Read scroll progress synchronously (one cheap getBoundingClientRect per event)
// and hand the target to the spring, which does its own rAF-smoothed easing.
// Reduced motion skips the spring and tracks scroll position 1:1.
function onScroll() {
  const p = computeProgress()
  if (reduced.value) fill.t = p
  else fillSpring.set({ t: p })
}

/* ── Fill-derived lighting helpers (reactive via fill.t) ───────────────────── */
// How "lit" a node is as the gold front sweeps past it (0→1), damped for locked.
function nodeLit(n) {
  const r = clamp01((fill.t - n.norm + 0.015) / 0.09)
  return n.status === 'locked' ? r * 0.4 : r
}
function branchReveal(b) {
  return clamp01((fill.t - b.norm + 0.01) / 0.05)
}
const ringOpacity = (n) =>
  n.status === 'completed' ? 0.95 : n.status === 'in-progress' ? 0.82 : 0.32
const cometY = computed(() => layout.value.top + fill.t * layout.value.span)
const cometOpacity = computed(() => (fill.t > 0.003 && fill.t < 0.997 ? 1 : 0))
const fillPct = computed(() => Math.round(fill.t * 100))

/* ── Node reveal variants (v-motion directive) ─────────────────────────────── */
const revealInitial = computed(() =>
  reduced.value ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 },
)
function revealEnter(order) {
  if (reduced.value) return { opacity: 1, scale: 1 }
  return {
    opacity: 1,
    scale: 1,
    transition: { delay: 140 + order * 60, type: 'spring', stiffness: 220, damping: 18 },
  }
}

/* ── The Pulse — useMotion() on the active node's ripple ring ───────────────── */
const pulseEl = ref(null)
const pulseVariants = computed(() =>
  reduced.value
    ? { initial: { opacity: 0 }, enter: { opacity: 0 } }
    : {
        initial: { scale: 0.5, opacity: 0.6 },
        enter: {
          scale: 2.9,
          opacity: 0,
          transition: { duration: 1700, repeat: Infinity, repeatType: 'loop', ease: 'easeOut' },
        },
      },
)
useMotion(pulseEl, pulseVariants)

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<template>
  <aside ref="rootEl" class="npt" aria-label="Learning pathway progress">
    <div class="npt__panel">
      <!-- ── Header ─────────────────────────────────────────────────────── -->
      <header class="npt__head">
        <p class="npt__eyebrow">{{ label }}</p>
        <h3 class="npt__user">{{ data.user }}</h3>
        <div class="npt__meter" role="progressbar" :aria-valuenow="fillPct" aria-valuemin="0" aria-valuemax="100">
          <span class="npt__meter-fill" :style="{ width: fillPct + '%' }"></span>
        </div>
        <p class="npt__meter-label">{{ fillPct }}% explored</p>
      </header>

      <!-- ── The tree ───────────────────────────────────────────────────── -->
      <div class="npt__stage">
        <svg
          class="npt__svg"
          :viewBox="`0 0 ${layout.vbW} ${layout.vbH}`"
          :style="{ aspectRatio: `${layout.vbW} / ${layout.vbH}` }"
          preserveAspectRatio="xMidYMin meet"
          role="img"
          aria-label="Neural progress tree"
        >
          <defs>
            <!-- Glass cylinder shading (across tube width) -->
            <linearGradient id="npt-trunkGlass" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.03" />
              <stop offset="22%" stop-color="#ffffff" stop-opacity="0.18" />
              <stop offset="50%" stop-color="#ffffff" stop-opacity="0.06" />
              <stop offset="78%" stop-color="#ffffff" stop-opacity="0.02" />
              <stop offset="100%" stop-color="#000000" stop-opacity="0.24" />
            </linearGradient>

            <!-- Gold inner glow — intensity varies along the tube length -->
            <linearGradient id="npt-goldGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#F4D791" stop-opacity="0.55" />
              <stop offset="50%" stop-color="#FBE9BE" stop-opacity="0.95" />
              <stop offset="100%" stop-color="#F4D791" stop-opacity="0.6" />
            </linearGradient>

            <!-- Metallic dark-glass node body (offset highlight → top-left light) -->
            <radialGradient id="npt-courseGlass" cx="0.38" cy="0.32" r="0.85">
              <stop offset="0%" stop-color="#3b4654" />
              <stop offset="46%" stop-color="#2b333d" />
              <stop offset="100%" stop-color="#171c23" />
            </radialGradient>
            <radialGradient id="npt-moduleGlass" cx="0.38" cy="0.30" r="0.9">
              <stop offset="0%" stop-color="#46525f" />
              <stop offset="55%" stop-color="#2c343e" />
              <stop offset="100%" stop-color="#191e25" />
            </radialGradient>

            <!-- Emissive gold core that grows as the fill reaches a node -->
            <radialGradient id="npt-goldCore" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stop-color="#FFF6DD" />
              <stop offset="42%" stop-color="#F4D791" />
              <stop offset="100%" stop-color="#F4D791" stop-opacity="0" />
            </radialGradient>

            <!-- Soft warm light-spill halo -->
            <radialGradient id="npt-halo" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stop-color="#F4D791" stop-opacity="0.85" />
              <stop offset="100%" stop-color="#F4D791" stop-opacity="0" />
            </radialGradient>

            <!-- Metallic gold accent ring -->
            <linearGradient id="npt-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#FBE9BE" />
              <stop offset="50%" stop-color="#F4D791" />
              <stop offset="100%" stop-color="#B8922A" />
            </linearGradient>

            <!-- Halo / light-spill blur. Applied only to static, opacity-animated
                 geometry so the GPU rasterises once and composites cheaply. -->
            <filter id="npt-haloBlur" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="6" />
            </filter>

            <!-- Volumetric relief: specular lighting from a consistent distant light -->
            <filter id="npt-relief" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.7" result="b" />
              <feSpecularLighting
                in="b" surfaceScale="3.4" specularConstant="0.9" specularExponent="20"
                lighting-color="#FFF3D6" result="spec"
              >
                <feDistantLight azimuth="235" elevation="60" />
              </feSpecularLighting>
              <feComposite in="spec" in2="SourceAlpha" operator="in" result="specClip" />
              <feComposite
                in="SourceGraphic" in2="specClip"
                operator="arithmetic" k1="0" k2="1" k3="0.92" k4="0"
              />
            </filter>
          </defs>

          <!-- ░░ Light spill cast onto the frosted glass by lit nodes ░░ -->
          <g class="npt-spill" filter="url(#npt-haloBlur)">
            <circle
              v-for="n in layout.courseNodes" :key="`sp-${n.id}`"
              :cx="n.cx" :cy="n.cy" r="30"
              fill="url(#npt-halo)" :opacity="0.55 * nodeLit(n)"
            />
            <circle
              v-for="n in layout.moduleNodes" :key="`spm-${n.id}`"
              :cx="n.cx" :cy="n.cy" r="20"
              fill="url(#npt-halo)" :opacity="0.5 * nodeLit(n)"
            />
          </g>

          <!-- ░░ Branch tubes (glass body + reveal-driven gold glow) ░░ -->
          <g class="npt-branches">
            <template v-for="b in layout.branches" :key="b.id">
              <path :d="branchD(b)" fill="none" stroke="#1c222a" stroke-width="9" stroke-linecap="round" stroke-opacity="0.9" />
              <path :d="branchD(b)" fill="none" stroke="url(#npt-trunkGlass)" stroke-width="8" stroke-linecap="round" />
              <path
                class="npt-glow"
                :d="branchD(b)" pathLength="1" fill="none" stroke="url(#npt-goldGlow)"
                stroke-width="3.4" stroke-linecap="round"
                stroke-dasharray="1 1" :stroke-dashoffset="1 - branchReveal(b)"
              />
            </template>
          </g>

          <!-- ░░ Trunk tube ░░ -->
          <g class="npt-trunk">
            <!-- dark rim -->
            <line :x1="SPINE_X" :y1="layout.top" :x2="SPINE_X" :y2="layout.bottom" stroke="#161b22" stroke-width="17" stroke-linecap="round" />
            <!-- glass body -->
            <line :x1="SPINE_X" :y1="layout.top" :x2="SPINE_X" :y2="layout.bottom" stroke="url(#npt-trunkGlass)" stroke-width="15" stroke-linecap="round" />
            <!-- specular gloss streak -->
            <line :x1="SPINE_X - 3.4" :y1="layout.top + 2" :x2="SPINE_X - 3.4" :y2="layout.bottom - 2" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2.2" stroke-linecap="round" />
            <!-- gold inner glow, revealed by scroll fill -->
            <line
              class="npt-glow"
              :x1="SPINE_X" :y1="layout.top" :x2="SPINE_X" :y2="layout.bottom"
              pathLength="1" stroke="url(#npt-goldGlow)" stroke-width="6.5" stroke-linecap="round"
              stroke-dasharray="1 1" :stroke-dashoffset="1 - fill.t"
            />
            <!-- travelling comet head: brightest point at the fill front (soft via
                 radial gradient, no per-frame blur → cheap to move every frame) -->
            <g :transform="`translate(0 ${cometY - layout.top})`" :opacity="cometOpacity">
              <circle :cx="SPINE_X" :cy="layout.top" r="11" fill="url(#npt-halo)" />
              <circle :cx="SPINE_X" :cy="layout.top" r="3" fill="#FFF6DD" />
            </g>
          </g>

          <!-- ░░ Module beads ░░ -->
          <g
            v-for="n in layout.moduleNodes" :key="n.id"
            :transform="`translate(${n.cx} ${n.cy})`"
          >
            <g
              class="npt-node"
              v-motion
              :initial="revealInitial"
              :visible-once="revealEnter(n.order)"
            >
              <title>{{ n.title }}</title>
              <circle r="9" fill="url(#npt-goldCore)" :opacity="nodeLit(n)" />
              <circle :r="MODULE_R" fill="url(#npt-moduleGlass)" filter="url(#npt-relief)" />
              <circle :r="MODULE_R" fill="none" stroke="url(#npt-ring)" stroke-width="1.6" :opacity="ringOpacity(n)" />
              <circle r="2.4" fill="url(#npt-goldCore)" :opacity="Math.max(nodeLit(n), n.status === 'completed' ? 0.9 : 0)" />
            </g>
          </g>

          <!-- ░░ Course nodes ░░ -->
          <g
            v-for="n in layout.courseNodes" :key="n.id"
            :transform="`translate(${n.cx} ${n.cy})`"
          >
            <g
              class="npt-node"
              v-motion
              :initial="revealInitial"
              :visible-once="revealEnter(n.order)"
            >
              <title>{{ n.code }} — {{ n.title }}</title>
              <circle :r="COURSE_R" fill="url(#npt-courseGlass)" filter="url(#npt-relief)" />
              <circle :r="COURSE_R" fill="none" stroke="url(#npt-ring)" stroke-width="2.2" :opacity="ringOpacity(n)" />
              <!-- emissive core fills with the gold front -->
              <circle :r="COURSE_R - 3.5" fill="url(#npt-goldCore)" :opacity="0.85 * nodeLit(n)" />
              <!-- completed check -->
              <path
                v-if="n.status === 'completed'"
                d="M -4.4 0.4 L -1.4 3.4 L 4.6 -3.2"
                fill="none" stroke="#2b333d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                :opacity="Math.max(0.25, nodeLit(n))"
              />
            </g>
          </g>

          <!-- ░░ The Pulse — active "You are here" node ░░ -->
          <g v-if="currentNode" :transform="`translate(${currentNode.cx} ${currentNode.cy})`">
            <!-- expanding ripple (useMotion) -->
            <circle ref="pulseEl" class="npt-pulse" r="11" fill="none" stroke="#F4D791" stroke-width="1.4" />
            <!-- steady marker so reduced-motion users still see it -->
            <circle r="3.4" fill="url(#npt-goldCore)" />
            <circle r="3.4" fill="none" stroke="#FFF6DD" stroke-width="0.8" stroke-opacity="0.8" />
          </g>
        </svg>
      </div>

      <p class="npt__hint">Scroll to fill the pathway · the pulse marks where you are</p>
    </div>
  </aside>
</template>

<style scoped>
/* LTR-only: physical properties throughout (matches the Atlas wayfinders). */

.npt {
  width: 100%;
  max-width: 320px;
  font-family: 'Inter', sans-serif;
  color: #E9ECF1;
}

/* ── Frosted-glass panel ───────────────────────────────────────────────────── */
.npt__panel {
  position: relative;
  border-radius: 22px;
  padding: 22px 18px 18px;
  background: linear-gradient(158deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  box-shadow:
    0 18px 50px -18px rgba(0, 0, 0, 0.6),
    0 2px 8px -4px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  overflow: hidden;
}
/* top sheen */
.npt__panel::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 40%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.10), transparent);
  pointer-events: none;
}
/* faint warm spill pooled where the tree lives */
.npt__panel::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(60% 40% at 30% 60%, rgba(244, 215, 145, 0.07), transparent 70%);
  pointer-events: none;
}

/* ── Header ─────────────────────────────────────────────────────────────────── */
.npt__head { position: relative; z-index: 1; }
.npt__eyebrow {
  margin: 0;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.32em;
  color: #EDC071;
  font-weight: 300;
}
.npt__user {
  margin: 6px 0 0;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 400;
  font-size: 21px;
  letter-spacing: 0.01em;
  color: #F6F3EC;
}
.npt__meter {
  margin-top: 12px;
  height: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.10);
  overflow: hidden;
}
.npt__meter-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #B8922A, #F4D791 60%, #FBE9BE);
  box-shadow: 0 0 8px rgba(244, 215, 145, 0.6);
}
.npt__meter-label {
  margin: 7px 0 0;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(233, 236, 241, 0.55);
}

/* ── Stage ─────────────────────────────────────────────────────────────────── */
.npt__stage {
  position: relative;
  z-index: 1;
  margin-top: 14px;
}
.npt__svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.npt__hint {
  position: relative;
  z-index: 1;
  margin: 10px 2px 2px;
  font-size: 9.5px;
  line-height: 1.5;
  letter-spacing: 0.08em;
  color: rgba(233, 236, 241, 0.42);
}

/* ── Node reveal / pulse transform origins (SVG needs fill-box) ─────────────── */
.npt-node,
.npt-pulse {
  transform-box: fill-box;
  transform-origin: center;
}
.npt-node { transition: filter 0.3s ease; }
.npt-node:hover { filter: brightness(1.18); cursor: default; }

/* The gold inner glow reads as emissive light over the glass — a compositor-only
   blend (no per-frame re-raster), so the scroll fill stays at 60fps. */
.npt-glow { mix-blend-mode: screen; }

/* ── Reduced motion ────────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .npt-pulse { display: none; }
  .npt__meter-fill { box-shadow: none; }
}
</style>
