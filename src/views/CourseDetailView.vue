<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LuxeCard from '../components/LuxeCard.vue'
import SectionEyebrow from '../components/SectionEyebrow.vue'
import StratumStack from '../components/StratumStack.vue'
import VideoPlayer from '../components/VideoPlayer.vue'
import { courseCode, sectionLetter } from '../utils/catalog.js'
import { useReveal } from '../composables/useReveal.js'

const { t, tm, locale } = useI18n()
const route = useRoute()
const router = useRouter()

// Writing direction — drives native RTL chevron glyphs (no scaleX mirroring).
const isRtl = computed(() => ['fa', 'ar'].includes(locale.value))
// Chevron pointing toward the carousel's start / end edge in the current
// direction. In LTR the start edge is the left; in RTL it is the right.
const chevronToStart = computed(() => (isRtl.value ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'))
const chevronToEnd = computed(() => (isRtl.value ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'))

const courses = computed(() => tm('academy.courses'))
const courseIndex = computed(() => Number(route.params.id))
const course = computed(() => courses.value[courseIndex.value])
const isFree = computed(() => course.value?.tier === 'free')

// Derive lesson count from duration string.
const lessonCount = computed(() => {
  const match = (course.value?.duration || '').match(/(\d+)\s*lesson/i)
  return match ? Number(match[1]) : 6
})

// Per-course descriptive video lesson titles (clinical context)
const videoTitleSets = [
  // 0: Foundations of Clinical EEG (6 lessons)
  [
    'Introduction to Clinical EEG & Waveform Basics',
    'Electrode Placement, Montages & Recording Setup',
    'Normal Adult EEG: Background Activity & Variants',
    'Artefact Recognition & Elimination Strategies',
    'Focal & Generalised Abnormalities in Practice',
    'Structured EEG Reporting & Clinical Communication',
  ],
  // 1: EMG & Nerve Conduction in Practice (9 lessons)
  [
    'Peripheral Nerve Anatomy & Physiology Review',
    'Motor Nerve Conduction: Technique & Setup',
    'Sensory & Mixed NCS — Interpretation Principles',
    'Needle EMG: Safety, Insertion & Activation',
    'Normal EMG Findings, Patterns & Common Variants',
    'Neuropathic vs. Myopathic EMG Signatures',
    'Common NCS/EMG Diagnoses in Clinical Practice',
    'Entrapment Neuropathies & Radiculopathy Patterns',
    'Integrated Reporting: Standards & Documentation',
  ],
  // 2: Programming Deep-Brain Stimulators (8 lessons)
  [
    'DBS Anatomy: Lead Placement & Device Overview',
    'Stimulation Parameters: Amplitude, Pulse & Frequency',
    'Initial Post-Implantation Programming',
    'Optimising Settings for Tremor & Rigidity',
    'Managing Dyskinesias Through Parameter Adjustment',
    'Side-Effect Recognition & Troubleshooting',
    'Long-Term Follow-Up & Programming Drift',
    'Complex Cases & Refractory DBS Settings',
  ],
  // 3: Neurostimulation: An Introduction (5 lessons)
  [
    'Overview of Non-Invasive Neurostimulation',
    'Transcranial Magnetic Stimulation (TMS): Principles & Use',
    'Vagus Nerve Stimulation (VNS) in Epilepsy',
    'Patient Selection, Contraindications & Safety',
    'Emerging Modalities & Future Directions',
  ],
  // 4: Polysomnography & Sleep Reporting (7 lessons)
  [
    'Sleep Architecture & Staging Fundamentals',
    'PSG Montage Setup & Electrode Application',
    'Scoring NREM, REM & Wake Epochs',
    'Respiratory Event Classification & Diagnosis',
    'Movement Disorders & Parasomnias in Sleep',
    'Paediatric PSG: Special Considerations',
    'Report Structure, Clinical Referral & Communication',
  ],
  // 5: Intracranial Pressure Monitoring (6 lessons)
  [
    'ICP Physiology: Monro-Kellie Doctrine & Thresholds',
    'Monitoring Modalities: EVD, Bolt & Parenchymal Devices',
    'ICP Waveform Morphology: A, B & C Waves',
    'CPP Management & Cerebral Autoregulation',
    'Refractory Intracranial Hypertension: Escalation Steps',
    'Neurocritical Care Pathways & ICU Integration',
  ],
]

// Per-course high-level syllabus module names
const moduleSets = [
  ['Foundations & Waveform Science', 'Recording Methodology', 'Normal EEG Patterns', 'Abnormal & Pathological Findings', 'Clinical Correlation', 'Reporting & Communication'],
  ['Anatomical & Physiological Basis', 'NCS Methodology', 'EMG Principles', 'Diagnostic Interpretation', 'Complex Presentations', 'Quality Assurance & Reporting', 'Clinical Integration', 'Case-Based Practice', 'Final Assessment'],
  ['Device Architecture', 'Stimulation Principles', 'Initial Programming', 'Symptom-Targeted Adjustment', 'Adverse Effect Management', 'Long-Term Management', 'Advanced Scenarios', 'Real-World Cases'],
  ['Modality Overview', 'TMS Theory & Application', 'VNS Therapy', 'Safety & Patient Selection', 'Emerging Techniques'],
  ['Sleep Science Basics', 'Technical Setup', 'Epoch Scoring', 'Respiratory Disorders', 'Movement & Behavioural Disorders', 'Paediatric Considerations', 'Clinical Reporting'],
  ['ICP Physiology', 'Monitoring Techniques', 'Waveform Interpretation', 'CPP & Autoregulation', 'Refractory Hypertension', 'Neurocritical Integration'],
]

// Course descriptions (150-250 words each, clinical-grade mock content)
const longDescriptions = [
  // 0: EEG
  `Clinical EEG remains one of the most powerful diagnostic tools in neurology, yet its interpretation demands a fluency that comes only through structured training. This course builds that fluency from the ground up. You begin with the electrochemical foundations of scalp-recorded potentials, then progress through the full recording pipeline: electrode placement, referential and bipolar montages, digital filtering, and sensitivity adjustment — each taught in direct relation to its effect on the visual trace.\n\nThe core of the course is pattern recognition. You study the full spectrum of normal adult background activity alongside its physiological variants and the artefacts that mimic them, with particular attention to the drowsiness and sleep transitions that generate the highest rate of misread. From there the curriculum moves into abnormal territory: focal slowing and its localising value, generalised patterns in encephalopathy, interictal epileptiform discharges, and the electrographic signatures of seizure.\n\nClinical application runs throughout, with case-based segments set in real referral contexts. By the final lesson you will approach any trace with a systematic method, recognise the most important normal and abnormal findings, and communicate your interpretation with appropriate confidence and precision.`,

  // 1: EMG & NCS
  `Electrodiagnostic medicine sits at the intersection of neurology and practical craft: the clinical question must be well-formed before the needle is picked up, and the technical execution must be consistent enough for the waveform to carry diagnostic weight. This nine-lesson programme covers both dimensions, and is designed for clinicians who have encountered NCS and EMG in training and now need a structured pathway to independent practice.\n\nThe first block addresses nerve conduction studies — the anatomical basis of each standard study, the factors that alter velocity and amplitude, and the normative ranges that vary with age, temperature, and technique. Particular attention is given to the practical pitfalls that produce false diagnoses: submaximal stimulation, volume conduction, and the effect of oedema on surface recordings.\n\nThe EMG block addresses needle insertion, electrode positioning, and the systematic assessment of spontaneous and voluntary activity, including the waveform signatures of denervation, myopathy, and neuromuscular junction disease. The closing lessons show how NCS and needle findings integrate to support specific diagnoses — from carpal tunnel syndrome and radiculopathy to motor neurone disease — and establish the structured report format expected by referring clinicians.`,

  // 2: DBS Programming
  `Deep-brain stimulation has transformed the management of movement disorders, yet the clinical value of any implanted system depends entirely on the quality of its programming. This advanced course equips neurologists, registrars, and clinical neurophysiologists with the systematic skills required to programme and titrate DBS devices across the most common indications: Parkinson's disease, essential tremor, and dystonia.\n\nThe programme begins with the anatomy that makes DBS work — the basal ganglia circuitry, the target nuclei, and the spatial relationship between lead contacts and surrounding structures — so that contact selection becomes as deliberate as parameter choice. The core lessons cover amplitude, pulse width, and frequency in detail, explaining not just what each parameter changes but why it produces a specific clinical response.\n\nHalf of the curriculum is devoted to clinical scenarios: the tremor-dominant patient who develops stimulation-induced dyskinesias, the dystonia case requiring weeks of washout, the essential-tremor patient whose paraesthesia limits the therapeutic window. Each is worked through with a structured troubleshooting approach. The final module addresses lead migration, battery depletion, and hardware revision, providing a framework for managing complex patients in a specialist movement-disorder clinic.`,

  // 3: Neurostimulation
  `Non-invasive neuromodulation has moved rapidly from research laboratories into everyday clinical practice. This introductory course is designed for clinicians who encounter patients referred for — or already receiving — transcranial magnetic stimulation, vagus nerve stimulation, or related therapies, and who need a reliable framework for understanding, recommending, and monitoring these interventions.\n\nThe course opens with the biophysical principles underlying each modality: how a changing magnetic field induces cortical current in TMS, and how afferent vagal signals modulate cortical excitability in VNS. Regulatory approvals, evidence grades, and the distinction between established and investigational indications are addressed explicitly, because the boundary between practice and research in this field shifts quickly.\n\nPractical modules cover patient selection, contraindication screening, and the consent process for each modality. The TMS session addresses both single-pulse diagnostic protocols and the repetitive protocols used therapeutically in depression and OCD, while the VNS module covers both implanted systems for drug-resistant epilepsy and the emerging transcutaneous devices now entering clinical use. The course closes with a forward-looking review of closed-loop and adaptive neuromodulation.`,

  // 4: PSG
  `Polysomnography is the gold standard for diagnosing sleep disorders, yet the gap between a technically adequate recording and a clinically useful report depends entirely on the scorer's knowledge. This course covers the complete PSG workflow: from the patient's first clinic appointment through montage set-up, epoch-by-epoch scoring, and final report generation.\n\nThe opening lessons address sleep neuroscience — circadian regulation, homeostatic sleep drive, and the neurophysiology of NREM and REM sleep — because understanding what the brain is doing during each stage is the only durable basis for accurate scoring. You then study the AASM scoring rules in technical detail, including the EEG, EOG, and EMG criteria that distinguish the sleep stages and the requirements for REM identification.\n\nThe respiratory block is the most clinically consequential section: the definitions and significance of obstructive and central apnoea, hypopnoea, and respiratory effort-related arousals, with attention to the AHI and its limitations. Movement disorders and the parasomnias most likely to present in an adult laboratory are addressed in dedicated lessons, and the final session teaches the structure of a complete, referral-ready PSG report.`,

  // 5: ICP Monitoring
  `Elevated intracranial pressure is a neurological and neurosurgical emergency that demands rapid, accurate interpretation of monitoring data and a structured approach to escalating management. This advanced course is designed for registrars, intensivists, and neurophysiologists working in neurocritical care who need a rigorous, evidence-based grounding in ICP monitoring.\n\nThe physiological foundation is established first: the Monro-Kellie doctrine, compensatory mechanisms, and the clinical thresholds that define actionable intracranial hypertension. The monitoring-modalities lesson compares external ventricular drains, intraparenchymal devices, and subdural bolts — including insertion technique, zeroing, calibration, and the measurement errors specific to each.\n\nThe waveform module is the most technically demanding section. You learn to identify the A (plateau) waves that signal impending herniation, the B waves associated with reduced compliance, and the pulse morphology whose P2 dominance carries prognostic weight. Management lessons address the tiered protocol for refractory hypertension: osmotherapy, CSF drainage, sedation, decompressive craniectomy, and barbiturate coma. The final lesson situates ICP monitoring within the broader neurocritical-care bundle, addressing multimodality monitoring and interdisciplinary communication.`,
]

const courseDesc = computed(() => longDescriptions[courseIndex.value] || course.value?.desc || '')

// Get video lesson titles for a given course
const videoLessons = computed(() => {
  const titles = videoTitleSets[courseIndex.value] || []
  return Array.from({ length: lessonCount.value }, (_, i) => ({
    index: i + 1,
    title: titles[i] ? `${t('academy.courseDetail.lesson')} ${i + 1}: ${titles[i]}` : `${t('academy.courseDetail.lesson')} ${String(i + 1).padStart(2, '0')}`,
  }))
})

// Get syllabus module names for a given course
const modules = computed(() => {
  const names = moduleSets[courseIndex.value] || []
  return Array.from({ length: lessonCount.value }, (_, i) => ({
    index: i + 1,
    name: names[i] || `${t('academy.courseDetail.lesson')} ${String(i + 1).padStart(2, '0')}`,
  }))
})

// Stable catalog code for this course (e.g. "NRO-101").
const code = computed(() => courseCode(courses.value, courseIndex.value))

// Strata for the syllabus: modules as independent reference sections (A, B, C…)
// rather than a numbered path. State (done / current) is derived here.
const strata = computed(() => modules.value.map((m, i) => ({
  index: m.index,
  ref: sectionLetter(i),
  name: m.name,
  done: m.index <= completed.value,
  current: m.index === playing.value,
})))

// Mock progress
const completed = computed(() => (isFree.value ? Math.min(2, lessonCount.value) : 0))
const progressPct = computed(() => Math.round((completed.value / Math.max(lessonCount.value, 1)) * 100))

// Premium gating: the player stays unrendered for premium courses until the
// user has paid. There is NO instant unlock — purchase is confirmed only by
// returning from a completed checkout with ?purchased=true on the URL (mocking
// a real post-payment redirect). Free courses always show the player.
const isPurchased = computed(() => route.query.purchased === 'true')
const showPlayer = computed(() => isFree.value || isPurchased.value)

// "Subscribe" routes straight to the Checkout flow — it no longer unlocks the
// player in place. The course index is carried through so Checkout can send the
// user back here as ?purchased=true on success.
const goToCheckout = () => {
  router.push({ path: '/checkout', query: { course: courseIndex.value } })
}

const playing = ref(isFree.value ? 1 : null)
// Dismissible post-purchase banner (sits below the hero). Re-shown whenever a
// fresh purchase is confirmed.
const showUnlocked = ref(true)
watch(isPurchased, (v) => { if (v) showUnlocked.value = true })
// When the user lands back with the purchase confirmed, auto-select lesson 1.
watch(isPurchased, (v) => { if (v && playing.value === null) playing.value = 1 }, { immediate: true })
const playLesson = (n) => { if (showPlayer.value) playing.value = n }

const currentLesson = computed(() =>
  videoLessons.value.find((l) => l.index === playing.value) || videoLessons.value[0])

// Every other course in the catalogue feeds the "Browse the Library" carousel.
const related = computed(() => courses.value
  .map((c, i) => ({ ...c, i }))
  .filter((c) => c.i !== courseIndex.value))

// ── Browse-the-Library carousel ──────────────────────────────────────────────
// Shows `perView` cards (3 on desktop, 1 on mobile) and slides one card per
// arrow click along the X-axis. The track itself stays LTR so the prev/next
// direction is consistent across locales.
const carouselIndex = ref(0)
const perView = ref(3)
const maxIndex = computed(() => Math.max(0, related.value.length - perView.value))
const canPrev = computed(() => carouselIndex.value > 0)
const canNext = computed(() => carouselIndex.value < maxIndex.value)
const slidePrev = () => { if (canPrev.value) carouselIndex.value-- }
const slideNext = () => { if (canNext.value) carouselIndex.value++ }
const trackStyle = computed(() => ({
  transform: `translateX(-${(carouselIndex.value * 100) / perView.value}%)`,
}))
const slideStyle = computed(() => ({ flex: `0 0 ${100 / perView.value}%` }))

let mq = null
const applyPerView = () => {
  perView.value = mq && mq.matches ? 3 : 1
  if (carouselIndex.value > maxIndex.value) carouselIndex.value = maxIndex.value
}
onMounted(() => {
  mq = window.matchMedia('(min-width: 768px)')
  applyPerView()
  mq.addEventListener('change', applyPerView)
})
onUnmounted(() => { if (mq) mq.removeEventListener('change', applyPerView) })

// Thumbnail gradients for the library preview cards (warm parchment/gold tones)
const thumbGradients = [
  'linear-gradient(135deg, #3a342a 0%, #1c1915 100%)',
  'linear-gradient(135deg, #4a3f24 0%, #2a2418 100%)',
  'linear-gradient(135deg, #2e2a22 0%, #14110d 100%)',
  'linear-gradient(135deg, #463b22 0%, #221d12 100%)',
  'linear-gradient(135deg, #353026 0%, #1a1610 100%)',
  'linear-gradient(135deg, #4a4128 0%, #26201400 100%)',
]
const thumbStyle = (i) => ({ background: thumbGradients[i % thumbGradients.length] })

// Comments
const draft = ref('')
const justSubmitted = ref(false)
const submitComment = () => {
  if (!draft.value.trim()) return
  justSubmitted.value = true
  draft.value = ''
}

useReveal()
</script>

<template>
  <div v-if="course" class="course-detail-page">
    <!-- Hero -->
    <section class="bg-ink py-16 md:py-24">
      <div class="max-w-5xl mx-auto px-8">
        <router-link to="/academy" class="text-[11px] uppercase tracking-[0.25em] text-gold/80 hover:text-gold transition-colors inline-flex items-center gap-2">
          <span class="dir-arrow-back" aria-hidden="true"></span> {{ t('academy.courseDetail.back') }}
        </router-link>
        <p class="mt-8 text-[11px] uppercase tracking-[0.35em] text-gold/80 font-light">{{ t('academy.courseDetail.eyebrow') }}</p>
        <h1 class="mt-3 font-serif font-light text-parchment-light text-4xl md:text-5xl tracking-wide leading-snug">{{ course.title }}</h1>
        <p class="mt-4 text-sm text-parchment-light/70 uppercase tracking-[0.2em] font-light">{{ course.instructor }}</p>
      </div>
    </section>

    <!-- Post-purchase notification — dismissible banner sitting directly below the
         hero and above the Description / Syllabus grid. Mirrors the "You're
         registered" alert: an X collapses it out with a fade + slide-up. -->
    <Transition name="alert-collapse">
      <div v-if="!isFree && isPurchased && showUnlocked" class="bg-gold/10 border-b border-gold/30">
        <div class="max-w-5xl mx-auto px-8 py-3 flex items-center justify-between gap-4 text-sm text-ink-soft font-light">
          <span class="flex items-center gap-3">
            <span class="shrink-0 grid place-items-center w-7 h-7 rounded-full border border-gold/50 text-gold-dark">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 12l5 5L19 8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <span>{{ t('academy.courseDetail.unlockedNotice') }}</span>
          </span>
          <button
            type="button"
            @click="showUnlocked = false"
            :aria-label="t('academy.courseDetail.dismiss')"
            class="shrink-0 p-1 text-ink-muted hover:text-gold-dark transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 6l12 12M6 18L18 6" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Description + Syllabus side by side -->
    <section class="py-16 md:py-24 bg-parchment-light border-b border-parchment-deep/70">
      <div class="max-w-5xl mx-auto px-8 grid lg:grid-cols-3 gap-x-16 gap-y-14 lg:items-start">
        <!-- Syllabus (one-third) — static, stays in its original position -->
        <aside class="reveal lg:col-span-1">
          <div class="bg-parchment border border-parchment-deep/70 rounded-lg shadow-card p-7">
            <SectionEyebrow :text="t('academy.courseDetail.syllabusTitle')" align="center" />
            <p class="mt-3 text-center text-[11px] uppercase tracking-[0.25em] text-gold-dark font-light tabular-nums">REF&nbsp;·&nbsp;{{ code }}</p>
            <div class="mt-6">
              <StratumStack :items="strata" @select="playLesson" />
            </div>
          </div>
        </aside>

        <!-- Course Description (two-thirds) — now on the right -->
        <div class="reveal lg:col-span-2" style="transition-delay: 80ms;">
          <SectionEyebrow :text="t('academy.courseDetail.descriptionTitle')" align="center" />
          <div class="mt-6 space-y-4 text-[15px] text-ink-soft font-light leading-loose">
            <p v-for="(para, i) in courseDesc.split('\n\n').filter(Boolean)" :key="i">{{ para }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Course Info + Videos -->
    <section class="py-16 md:py-28 bg-parchment-light">
      <div class="max-w-5xl mx-auto px-8 grid md:grid-cols-12 gap-y-16 gap-x-20">
        <!-- Course info + progress (left) -->
        <div class="md:col-span-4 space-y-10">
          <LuxeCard class="reveal" :title="t('academy.courseDetail.infoTitle')">
            <dl class="space-y-5 text-sm">
              <div class="flex items-center justify-between gap-4">
                <dt class="text-ink-muted uppercase tracking-[0.15em] text-[11px] font-light">{{ t('academy.courseDetail.instructorLabel') }}</dt>
                <dd class="text-ink font-light text-right">{{ course.instructor }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="text-ink-muted uppercase tracking-[0.15em] text-[11px] font-light">{{ t('academy.courseDetail.levelLabel') }}</dt>
                <dd class="text-ink font-light">{{ course.level }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="text-ink-muted uppercase tracking-[0.15em] text-[11px] font-light">{{ t('academy.courseDetail.durationLabel') }}</dt>
                <dd class="text-ink font-light text-right">{{ course.duration }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="text-ink-muted uppercase tracking-[0.15em] text-[11px] font-light">{{ t('academy.courseDetail.fieldLabel') }}</dt>
                <dd class="text-ink font-light">{{ t(`academy.fields.${course.field}`) }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4 pt-5 border-t border-parchment-deep">
                <dt class="text-ink-muted uppercase tracking-[0.15em] text-[11px] font-light">{{ t('academy.courseDetail.tierLabel') }}</dt>
                <dd :class="['uppercase tracking-[0.2em] text-[11px] font-light px-2.5 py-1 border', isFree ? 'text-ink border-parchment-deep' : 'text-gold border-gold/50']">
                  {{ t(`academy.filters.${course.tier}`) }}
                </dd>
              </div>
            </dl>
          </LuxeCard>

          <LuxeCard class="reveal" :title="t('academy.courseDetail.progressTitle')" style="transition-delay: 60ms;">
            <div class="flex items-baseline justify-between text-sm">
              <span class="text-ink font-light">{{ completed }} / {{ lessonCount }}</span>
              <span class="text-ink-muted text-[11px] uppercase tracking-[0.2em] font-light">{{ t('academy.courseDetail.progressLabel') }}</span>
            </div>
            <div class="mt-4 h-1.5 w-full bg-parchment-deep overflow-hidden">
              <div class="h-full bg-gold transition-all duration-500" :style="{ width: progressPct + '%' }"></div>
            </div>
          </LuxeCard>
        </div>

        <!-- Course videos (right) -->
        <div class="md:col-span-8">
          <SectionEyebrow :text="t('academy.courseDetail.videosTitle')" align="center" />

          <!-- Subscription box ↔ active player.
               The premium box sits directly BETWEEN the header and the lesson
               list. On purchase it crossfades out and the player takes its place
               (mode out-in), while the list below switches to a playable state. -->
          <Transition name="purchase-swap" mode="out-in" :duration="{ enter: 520, leave: 260 }">
            <!-- Premium subscription / paywall box -->
            <div
              v-if="!isFree && !isPurchased"
              key="subbox"
              class="mt-7 border border-gold/40 bg-gold/5 rounded-lg px-8 py-9 text-center"
            >
              <div class="mx-auto w-12 h-12 rounded-full border border-gold/50 flex items-center justify-center text-gold-dark">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke-linecap="round"/></svg>
              </div>
              <p class="mt-5 text-sm text-ink-soft font-light leading-relaxed max-w-sm mx-auto">{{ t('academy.courseDetail.lockedNotice') }}</p>
              <button
                type="button"
                @click="goToCheckout"
                class="mt-6 inline-flex items-center justify-center gap-2.5 text-[11px] uppercase tracking-[0.3em] font-light px-7 py-3.5 rounded-md border border-gold/60 bg-ink text-parchment-light hover:bg-gold hover:text-ink hover:border-gold transition-colors"
              >
                {{ t('academy.courseDetail.subscribeCta') }} <span class="dir-arrow" aria-hidden="true"></span>
              </button>
              <p class="mt-4 text-[11px] text-ink-muted font-light italic">{{ t('academy.courseDetail.simulateHint') }}</p>
            </div>

            <!-- Active video player (free courses, or after purchase) -->
            <VideoPlayer
              v-else-if="showPlayer"
              key="player"
              class="mt-7"
              :title="currentLesson?.title"
              :subtitle="course.instructor + ' · ' + course.title"
            />
          </Transition>

          <ul class="mt-7 space-y-3">
            <li
              v-for="lesson in videoLessons"
              :key="'video-' + lesson.index"
              :class="[
                'flex items-center justify-between gap-4 px-5 py-4 border rounded-md transition-colors',
                playing === lesson.index
                  ? 'border-gold bg-gold/10 ring-1 ring-gold/40'
                  : showPlayer ? 'border-parchment-deep hover:border-gold/50 cursor-pointer' : 'border-parchment-deep/70'
              ]"
              @click="playLesson(lesson.index)"
            >
              <div class="flex items-center gap-4 min-w-0">
                <span :class="['shrink-0 flex items-center justify-center w-8 h-8 border rounded text-xs', playing === lesson.index ? 'border-gold text-gold-dark bg-gold/10' : (showPlayer ? 'border-gold/50 text-gold-dark' : 'border-parchment-deep text-ink-muted')]">
                  <svg v-if="showPlayer" width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke-linecap="round"/></svg>
                </span>
                <span :class="['text-sm font-light leading-snug', playing === lesson.index ? 'text-gold-dark' : 'text-ink']">{{ lesson.title }}</span>
              </div>
              <span :class="['shrink-0 text-[11px] uppercase tracking-[0.2em] font-light', playing === lesson.index ? 'text-gold-dark' : (showPlayer ? 'text-ink-muted' : 'text-gold')]">
                {{ playing === lesson.index ? '▶' : (showPlayer ? t('academy.courseDetail.play') : t('academy.courseDetail.locked')) }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Comments -->
    <section class="py-16 md:py-24 bg-parchment border-t border-parchment-deep">
      <div class="max-w-3xl mx-auto px-8">
        <SectionEyebrow :text="t('academy.comments.title')" />

        <div class="mt-10 space-y-7">
          <div v-for="(c, i) in tm('academy.comments.list')" :key="i" class="border-b border-parchment-deep pb-7">
            <div class="flex items-baseline justify-between gap-4">
              <span class="text-sm text-ink font-light uppercase tracking-[0.15em]">{{ c.name }}</span>
              <span class="text-xs text-ink-muted font-light">{{ c.time }}</span>
            </div>
            <p class="mt-2.5 text-sm text-ink-soft font-light leading-relaxed">{{ c.body }}</p>
          </div>
        </div>

        <form class="mt-10" @submit.prevent="submitComment">
          <textarea
            v-model="draft"
            rows="3"
            :placeholder="t('academy.comments.placeholder')"
            class="w-full bg-parchment-light border border-parchment-deep px-5 py-4 text-sm font-light text-ink placeholder:text-ink-muted focus:outline-none focus:border-gold/60 transition-colors"
          ></textarea>
          <div class="mt-4 flex items-center justify-end gap-4">
            <p v-if="justSubmitted" class="text-xs text-gold-dark font-light italic me-auto">✓ Posted</p>
            <button
              type="submit"
              class="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-ink hover:text-gold-dark transition-colors border-b border-gold/50 pb-1"
            >{{ t('academy.comments.submit') }} <span class="dir-arrow" aria-hidden="true"></span></button>
          </div>
        </form>
      </div>
    </section>

    <!-- Browse the Library -->
    <section class="py-16 md:py-24 bg-parchment-light border-t border-parchment-deep">
      <div class="max-w-5xl mx-auto px-8">
        <SectionEyebrow :text="t('academy.courseDetail.relatedTitle')" align="center" />
        <p class="mt-4 text-center text-sm text-ink-soft font-light leading-relaxed max-w-xl mx-auto">{{ t('academy.courseDetail.relatedSubtitle') }}</p>

        <div class="lib-carousel mt-12">
          <!-- Prev -->
          <button
            type="button"
            class="lib-arrow"
            :class="{ 'is-disabled': !canPrev }"
            :disabled="!canPrev"
            @click="slidePrev"
            :aria-label="t('academy.courseDetail.relatedTitle') + ' — previous'"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path :d="chevronToStart" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>

          <!-- Viewport: clips the track; the track slides one card per click. -->
          <div class="lib-carousel-viewport">
            <div class="lib-carousel-track" :style="trackStyle">
              <div
                v-for="rc in related"
                :key="'related-' + rc.i"
                class="lib-slide"
                :style="slideStyle"
              >
                <router-link :to="`/academy/course/${rc.i}`" class="group block h-full">
            <article class="bg-parchment border border-parchment-deep/70 rounded-lg overflow-hidden h-full flex flex-col shadow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-card-hover group-hover:border-gold/50">
              <!-- Thumbnail -->
              <div class="relative aspect-video w-full" :style="thumbStyle(rc.i)">
                <div class="absolute inset-0 opacity-[0.08]" style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 28px 28px;"></div>
                <span class="absolute top-3 left-3 text-[9px] uppercase tracking-[0.25em] font-light px-2 py-1 rounded-sm border"
                      :class="rc.tier === 'free' ? 'text-parchment-light/90 border-parchment-light/40' : 'text-gold-light border-gold-light/50 bg-black/20'">
                  {{ t(`academy.filters.${rc.tier}`) }}
                </span>
                <span class="absolute inset-0 m-auto w-11 h-11 rounded-full bg-gold/90 group-hover:bg-gold flex items-center justify-center text-ink transition-colors">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </span>
                <span class="absolute bottom-3 right-3 text-[10px] tracking-[0.1em] font-light text-parchment-light/90 bg-black/40 px-2 py-0.5 rounded">{{ (rc.duration || '').split('·').pop().trim() }}</span>
              </div>
              <!-- Body -->
              <div class="p-6 flex flex-col flex-1">
                <span class="text-[10px] uppercase tracking-[0.3em] text-gold-dark font-light">{{ t(`academy.fields.${rc.field}`) }}</span>
                <h3 class="font-serif font-light text-lg text-ink mt-2 leading-snug group-hover:text-gold-dark transition-colors">{{ rc.title }}</h3>
                <p class="mt-2 text-xs text-ink-muted font-light uppercase tracking-[0.15em]">{{ rc.instructor }}</p>
                <div class="mt-4 pt-4 border-t border-parchment-deep/60 flex items-center justify-between text-[11px] text-ink-muted font-light">
                  <span class="inline-flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 7v5l3 2" stroke-linecap="round"/><circle cx="12" cy="12" r="9"/></svg>
                    {{ rc.duration }}
                  </span>
                  <span class="inline-flex items-center gap-1.5 uppercase tracking-[0.15em] text-gold-dark">{{ rc.level }}</span>
                </div>
              </div>
            </article>
                </router-link>
              </div>
            </div>
          </div>

          <!-- Next -->
          <button
            type="button"
            class="lib-arrow"
            :class="{ 'is-disabled': !canNext }"
            :disabled="!canNext"
            @click="slideNext"
            :aria-label="t('academy.courseDetail.relatedTitle') + ' — next'"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path :d="chevronToEnd" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    </section>
  </div>

  <div v-else class="py-32 text-center">
    <p class="text-sm text-ink-muted font-light">{{ t('academy.courseDetail.back') }}</p>
    <button class="mt-4 text-[11px] uppercase tracking-[0.25em] text-gold-dark border-b border-gold/50 pb-1" @click="router.push('/academy')">
      {{ t('academy.courseDetail.back') }}
    </button>
  </div>
</template>

<style scoped>
/* ── Subscription box ↔ player crossfade ─────────────────────────────────────
   A soft fade + lift so the paywall hands off to the player (and the unlocked
   notice slides in) without any jarring snap. */
.purchase-swap-enter-active { transition: opacity 480ms ease, transform 520ms cubic-bezier(0.22, 1, 0.36, 1); }
.purchase-swap-leave-active { transition: opacity 260ms ease, transform 260ms ease; }
.purchase-swap-enter-from { opacity: 0; transform: translateY(14px) scale(0.985); }
.purchase-swap-leave-to { opacity: 0; transform: translateY(-10px) scale(0.99); }

/* ── Post-purchase banner dismiss ─────────────────────────────────────────────
   Fades + slides up while collapsing its height, so the page below glides into
   place rather than snapping. */
.alert-collapse-leave-active {
  transition: opacity 300ms ease, transform 360ms cubic-bezier(0.4, 0, 0.2, 1), max-height 360ms ease;
  overflow: hidden;
  max-height: 120px;
}
.alert-collapse-leave-to {
  opacity: 0;
  transform: translateY(-12px);
  max-height: 0;
}
@media (prefers-reduced-motion: reduce) {
  .alert-collapse-leave-active { transition: opacity 200ms ease; }
  .alert-collapse-leave-to { transform: none; }
}

/* ── Browse-the-Library carousel ─────────────────────────────────────────────
   Arrows flank a clipped viewport; the flex track slides one card-width per
   click along the X-axis with a long, high-end easing curve. */
.lib-carousel {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 2vw, 1.25rem);
}
.lib-carousel-viewport {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  /* Track is LTR so prev/next stay consistent regardless of page direction. */
  direction: ltr;
}
.lib-carousel-track {
  display: flex;
  will-change: transform;
  transition: transform 720ms cubic-bezier(0.22, 1, 0.36, 1);
}
.lib-slide {
  /* flex-basis is set inline (100% / perView) so 1-up on mobile, 3-up on md+. */
  box-sizing: border-box;
  padding-inline: clamp(0.5rem, 1.4vw, 1rem);
}
/* The viewport forces LTR for a consistent prev/next; restore RTL text flow
   inside each card so Persian course content reads in its natural direction. */
:global(html[dir='rtl']) .lib-slide { direction: rtl; }

/* Round, restrained arrow buttons that echo the gold accent on hover. */
.lib-arrow {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
  border: 1px solid rgb(var(--c-gold) / 0.45);
  color: rgb(var(--c-ink) / 0.85);
  background: rgb(var(--c-parchment-light) / 0.6);
  cursor: pointer;
  transition: color 240ms ease, background 240ms ease, border-color 240ms ease, transform 240ms ease, box-shadow 240ms ease;
}
.lib-arrow:hover {
  color: rgb(var(--c-parchment-light));
  background: rgb(var(--c-ink));
  border-color: rgb(var(--c-ink));
  box-shadow: 0 10px 24px -12px rgb(var(--c-ink) / 0.6);
  transform: translateY(-1px);
}
.lib-arrow.is-disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .lib-carousel-track { transition: none; }
  .purchase-swap-enter-active, .purchase-swap-leave-active { transition: opacity 200ms ease; }
}
</style>
