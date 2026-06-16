<script setup>
import { reactive, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SectionEyebrow from '../components/SectionEyebrow.vue'
import { useReveal } from '../composables/useReveal.js'

const { t } = useI18n()

const form = reactive({ name: '', email: '', phone: '', subject: '', message: '' })
const submitted = ref(false)

const isFilled = (k) => !!form[k] && String(form[k]).length > 0
const active = computed(() => ({
  name: isFilled('name'),
  email: isFilled('email'),
  phone: isFilled('phone'),
  subject: isFilled('subject'),
  message: isFilled('message'),
}))

const handleSubmit = () => {
  console.log('Contact form submission:', { ...form })
  submitted.value = true
  Object.assign(form, { name: '', email: '', phone: '', subject: '', message: '' })
}

// Icons for the contact info channels.
const infoIcons = {
  address: 'M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z M12 10a2 2 0 1 0 0-0.01',
  phone: 'M4 4h4l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 6a2 2 0 0 1 2-2z',
  email: 'M3 6h18v12H3z M3 7l9 6 9-6',
  hours: 'M12 7v5l3 2 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
}

useReveal()
</script>

<template>
  <div class="contact-page">
    <!-- ───────────────────────── Hero ───────────────────────── -->
    <section class="relative overflow-hidden py-28 md:py-36 bg-parchment-light text-center">
      <div class="contact-hero-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
      <div class="contact-hero-pool pointer-events-none absolute inset-0" aria-hidden="true"></div>
      <div class="relative max-w-5xl mx-auto px-8">
        <SectionEyebrow :text="t('contact.hero.eyebrow')" />
        <h1 class="font-serif font-light text-5xl md:text-7xl text-ink tracking-wide mt-8 leading-[1.05]">
          {{ t('contact.hero.title') }}
        </h1>
        <p class="reveal mt-10 max-w-xl mx-auto font-serif italic font-light text-xl md:text-2xl text-ink-soft leading-relaxed">
          {{ t('contact.intro') }}
        </p>
      </div>
    </section>

    <!-- ───────────────────────── Split card: info rail + form ───────────────────────── -->
    <section class="pb-24 md:pb-32 bg-parchment-light">
      <div class="max-w-6xl mx-auto px-6 md:px-8">
        <div class="reveal contact-shell grid lg:grid-cols-12 overflow-hidden rounded-[1.75rem]">

          <!-- ── Charcoal info rail (#323A45) ── -->
          <aside class="contact-rail relative lg:col-span-5 p-9 md:p-12 flex flex-col">
            <div class="contact-rail-aura pointer-events-none absolute inset-0" aria-hidden="true"></div>
            <div class="contact-rail-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>

            <div class="relative">
              <span class="inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.35em] text-jade-light font-light">
                <span class="h-px w-8 bg-jade/60"></span>
                {{ t('contact.rail.eyebrow') }}
              </span>
              <h2 class="mt-6 font-serif font-light text-3xl md:text-[2.4rem] text-[#F4F1EA] leading-[1.12] tracking-wide">
                {{ t('contact.rail.title') }}
              </h2>
              <p class="mt-5 text-sm text-[#C9CDD2] font-light leading-relaxed max-w-sm">
                {{ t('contact.rail.desc') }}
              </p>
            </div>

            <div class="relative mt-10 md:mt-auto md:pt-12 space-y-7">
              <div v-for="key in ['address', 'phone', 'email', 'hours']" :key="key" class="flex items-start gap-4">
                <span class="contact-chip shrink-0 grid place-items-center w-11 h-11 rounded-xl">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path :d="infoIcons[key]" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
                <div>
                  <p class="text-[10px] uppercase tracking-[0.3em] text-[#9AA0A8] font-light mb-1.5">{{ t(`contact.info.${key}.title`) }}</p>
                  <p class="font-serif font-light text-lg text-[#ECE8DF] leading-snug">{{ t(`contact.info.${key}.value`) }}</p>
                </div>
              </div>
            </div>
          </aside>

          <!-- ── Form panel ── -->
          <div class="contact-form-panel lg:col-span-7 p-9 md:p-12 lg:p-14">
            <Transition name="fade" mode="out-in">
              <div v-if="submitted" key="success" class="h-full min-h-[420px] flex flex-col items-center justify-center text-center">
                <div class="mx-auto w-16 h-16 rounded-full border border-jade/50 bg-jade/10 flex items-center justify-center text-jade">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 12l5 5L19 8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
                <p class="mt-7 font-serif italic font-light text-3xl text-gold-dark">
                  {{ t('contact.form.success') }}
                </p>
                <button @click="submitted = false" class="btn-ghost-gold mt-10">
                  ← {{ t('nav.contact') }}
                </button>
              </div>

              <form v-else key="form" @submit.prevent="handleSubmit">
                <p class="text-[11px] uppercase tracking-[0.3em] text-gold-dark font-light">{{ t('contact.form.eyebrow') }}</p>
                <h3 class="mt-3 font-serif font-light text-3xl text-ink leading-snug">{{ t('contact.form.title') }}</h3>
                <div class="h-px w-12 bg-gold/70 mt-6 mb-10"></div>

                <div class="space-y-9">
                  <div class="grid md:grid-cols-2 gap-x-10 gap-y-9">
                    <div class="float-field" :class="{ 'is-active': active.name }">
                      <input id="name" v-model="form.name" type="text" required />
                      <label for="name">{{ t('contact.form.name') }}</label>
                    </div>
                    <div class="float-field" :class="{ 'is-active': active.email }">
                      <input id="email" v-model="form.email" type="email" required />
                      <label for="email">{{ t('contact.form.email') }}</label>
                    </div>
                  </div>

                  <div class="grid md:grid-cols-2 gap-x-10 gap-y-9">
                    <div class="float-field" :class="{ 'is-active': active.phone }">
                      <input id="phone" v-model="form.phone" type="tel" />
                      <label for="phone">{{ t('contact.form.phone') }}</label>
                    </div>
                    <div class="float-field" :class="{ 'is-active': active.subject }">
                      <input id="subject" v-model="form.subject" type="text" required />
                      <label for="subject">{{ t('contact.form.subject') }}</label>
                    </div>
                  </div>

                  <div class="float-field" :class="{ 'is-active': active.message }">
                    <textarea id="message" v-model="form.message" rows="4" required></textarea>
                    <label for="message">{{ t('contact.form.message') }}</label>
                  </div>
                </div>

                <button type="submit" class="btn-ghost-gold w-full justify-center mt-12">
                  {{ t('contact.form.submit') }} <span aria-hidden="true">→</span>
                </button>
              </form>
            </Transition>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.contact-hero-grid {
  background-image: repeating-linear-gradient(90deg, transparent 0, transparent 119px, rgba(184, 146, 42, 0.035) 119px, rgba(184, 146, 42, 0.035) 120px);
}
.contact-hero-pool {
  background: radial-gradient(50% 60% at 50% 0%, rgba(46, 110, 90, 0.07), transparent 70%);
}

/* Split shell — charcoal rail welded to a parchment form panel. */
.contact-shell {
  border: 1px solid rgb(var(--c-parchment-deep) / 0.7);
  box-shadow: 0 1px 2px rgb(2 6 12 / 0.12), 0 40px 90px -45px rgb(2 6 12 / 0.5);
}

/* ── Charcoal info rail (#323A45) ── */
.contact-rail {
  background: linear-gradient(165deg, #3a434f 0%, #323a45 50%, #272d36 100%);
  --jade: 46 110 90;
  --jade-light: 122 196 168;
}
.contact-rail-aura {
  background: radial-gradient(60% 50% at 15% 8%, rgba(122, 196, 168, 0.12), transparent 60%),
              radial-gradient(50% 40% at 100% 100%, rgba(237, 192, 113, 0.08), transparent 65%);
}
.contact-rail-grid {
  background-image: repeating-linear-gradient(90deg, transparent 0, transparent 63px, rgba(255, 255, 255, 0.03) 63px, rgba(255, 255, 255, 0.03) 64px);
  -webkit-mask-image: linear-gradient(180deg, #000, transparent 90%);
          mask-image: linear-gradient(180deg, #000, transparent 90%);
}
.text-jade-light { color: rgb(var(--jade-light)); }
.bg-jade\/60 { background-color: rgb(var(--jade) / 0.6); }

/* Channel chips — metallic gold ring over a jade-tinted glass square. */
.contact-chip {
  color: #EAC079;
  background: rgba(122, 196, 168, 0.08);
  border: 1px solid rgba(237, 192, 113, 0.3);
  -webkit-backdrop-filter: blur(4px);
          backdrop-filter: blur(4px);
  transition: background 280ms ease, border-color 280ms ease;
}
.contact-rail .flex:hover .contact-chip {
  background: rgba(237, 192, 113, 0.14);
  border-color: rgba(237, 192, 113, 0.55);
}

/* Form panel surface. */
.contact-form-panel {
  background: rgb(var(--c-parchment));
}

/* Jade accent utilities for the success state. */
.text-jade { color: #2E6E5A; }
.border-jade\/50 { border-color: rgba(46, 110, 90, 0.5); }
.bg-jade\/10 { background-color: rgba(46, 110, 90, 0.1); }
</style>
