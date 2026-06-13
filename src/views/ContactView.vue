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

useReveal()
</script>

<template>
  <div>
    <!-- Header -->
    <section class="py-20 md:py-28 bg-parchment-light text-center">
      <div class="max-w-5xl mx-auto px-8">
        <SectionEyebrow :text="t('contact.hero.eyebrow')" />
        <h1 class="font-serif font-light text-5xl md:text-6xl text-ink tracking-wide mt-8">
          {{ t('contact.hero.title') }}
        </h1>
        <p class="reveal mt-10 max-w-xl mx-auto font-serif italic font-light text-xl text-ink-soft leading-relaxed">
          {{ t('contact.intro') }}
        </p>
      </div>
    </section>

    <section class="py-16 md:py-24 bg-parchment-light">
      <div class="max-w-5xl mx-auto px-8 grid lg:grid-cols-5 gap-16">
        <!-- Form -->
        <div class="lg:col-span-3 reveal">
          <Transition name="fade" mode="out-in">
            <div v-if="submitted" key="success" class="py-20 text-center">
              <p class="font-serif italic font-light text-3xl text-gold-dark">
                {{ t('contact.form.success') }}
              </p>
              <button @click="submitted = false" class="btn-ghost-gold mt-12">
                ← {{ t('nav.contact') }}
              </button>
            </div>

            <form v-else key="form" @submit.prevent="handleSubmit" class="space-y-10">
              <div class="grid md:grid-cols-2 gap-x-10 gap-y-10">
                <div class="float-field" :class="{ 'is-active': active.name }">
                  <input id="name" v-model="form.name" type="text" required />
                  <label for="name">{{ t('contact.form.name') }}</label>
                </div>
                <div class="float-field" :class="{ 'is-active': active.email }">
                  <input id="email" v-model="form.email" type="email" required />
                  <label for="email">{{ t('contact.form.email') }}</label>
                </div>
              </div>

              <div class="grid md:grid-cols-2 gap-x-10 gap-y-10">
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

              <button type="submit" class="btn-ghost-gold w-full justify-center">
                {{ t('contact.form.submit') }} <span aria-hidden="true">→</span>
              </button>
            </form>
          </Transition>
        </div>

        <!-- Info -->
        <div class="lg:col-span-2 space-y-10 reveal" style="transition-delay: 120ms">
          <div v-for="key in ['address', 'phone', 'email', 'hours']" :key="key"
               class="border-s border-gold ps-6">
            <p class="text-[11px] uppercase tracking-[0.3em] text-ink-muted font-light mb-2">{{ t(`contact.info.${key}.title`) }}</p>
            <p class="font-serif font-light text-xl text-ink leading-snug">{{ t(`contact.info.${key}.value`) }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
