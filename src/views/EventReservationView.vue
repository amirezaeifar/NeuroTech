<script setup>
import { ref, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LuxeCard from '../components/LuxeCard.vue'
import { useReveal } from '../composables/useReveal.js'

const { t, tm } = useI18n()
const route = useRoute()
const router = useRouter()

const eventType = computed(() => (route.params.type === 'onsite' ? 'onsite' : 'online'))
const items = computed(() => tm(`events.${eventType.value}.items`))
const itemIndex = computed(() => Number(route.params.id))
const item = computed(() => items.value[itemIndex.value])
const venueOrHost = computed(() => item.value?.host || item.value?.venue || '')

const submitted = ref(false)
const form = reactive({ name: '', email: '', phone: '', seats: '1', notes: '' })
const submit = () => { submitted.value = true }

useReveal()
</script>

<template>
  <div v-if="item">
    <section class="bg-ink py-16 md:py-24">
      <div class="max-w-3xl mx-auto px-8">
        <router-link to="/events" class="text-[11px] uppercase tracking-[0.25em] text-gold/80 hover:text-gold transition-colors inline-flex items-center gap-2">
          <span aria-hidden="true">←</span> {{ t('events.reservation.backCta') }}
        </router-link>
        <p class="mt-8 text-[11px] uppercase tracking-[0.35em] text-gold/80 font-light">{{ t('events.reservation.eyebrow') }}</p>
        <h1 class="mt-3 font-serif font-light text-parchment-light text-4xl md:text-5xl tracking-wide">{{ t('events.reservation.title') }}</h1>
        <p class="mt-4 max-w-xl text-sm text-parchment-light/70 font-light leading-relaxed">{{ t('events.reservation.intro') }}</p>
      </div>
    </section>

    <section class="py-10 md:py-14 bg-parchment-deep/30 border-b border-parchment-deep/60">
      <div class="max-w-3xl mx-auto px-8">
        <div class="reveal space-y-4 text-sm text-ink-soft font-light leading-loose">
          <p v-for="(para, i) in t('events.reservation.eventDesc').split('\n\n').filter(Boolean)" :key="i">{{ para }}</p>
        </div>
      </div>
    </section>

    <section class="py-16 md:py-24 bg-parchment-light">
      <div class="max-w-3xl mx-auto px-8 grid md:grid-cols-5 gap-10">
        <!-- Session summary -->
        <div class="md:col-span-2">
          <LuxeCard class="reveal" :title="t('events.reservation.summaryTitle')">
            <span class="text-[10px] uppercase tracking-[0.3em] text-gold-dark font-light">{{ item.tag }}</span>
            <h3 class="font-serif font-light text-xl text-ink mt-2 mb-3 leading-snug">{{ item.title }}</h3>
            <p class="text-sm text-ink-soft font-light">{{ venueOrHost }}</p>
            <p class="mt-1 text-xs text-ink-hint font-light uppercase tracking-[0.15em]">{{ item.date }}</p>
            <p class="mt-4 text-[11px] uppercase tracking-[0.2em] text-ink-muted font-light">{{ item.status }}</p>
          </LuxeCard>
        </div>

        <!-- Reservation form / success -->
        <div class="md:col-span-3">
          <LuxeCard v-if="!submitted" class="reveal" :title="t('events.reservation.formTitle')" style="transition-delay: 60ms;">
            <form class="space-y-5" @submit.prevent="submit">
              <div class="grid sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-[11px] uppercase tracking-[0.2em] text-ink-muted font-light mb-2">{{ t('events.reservation.fields.name') }}</label>
                  <input v-model="form.name" type="text" required class="w-full bg-parchment-light border border-parchment-deep px-4 py-3 text-sm font-light text-ink focus:outline-none focus:border-gold/60 transition-colors" />
                </div>
                <div>
                  <label class="block text-[11px] uppercase tracking-[0.2em] text-ink-muted font-light mb-2">{{ t('events.reservation.fields.email') }}</label>
                  <input v-model="form.email" type="email" required class="w-full bg-parchment-light border border-parchment-deep px-4 py-3 text-sm font-light text-ink focus:outline-none focus:border-gold/60 transition-colors" />
                </div>
              </div>
              <div class="grid sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-[11px] uppercase tracking-[0.2em] text-ink-muted font-light mb-2">{{ t('events.reservation.fields.phone') }}</label>
                  <input v-model="form.phone" type="tel" class="w-full bg-parchment-light border border-parchment-deep px-4 py-3 text-sm font-light text-ink focus:outline-none focus:border-gold/60 transition-colors" />
                </div>
                <div>
                  <label class="block text-[11px] uppercase tracking-[0.2em] text-ink-muted font-light mb-2">{{ t('events.reservation.fields.seats') }}</label>
                  <input v-model="form.seats" type="number" min="1" max="6" class="w-full bg-parchment-light border border-parchment-deep px-4 py-3 text-sm font-light text-ink focus:outline-none focus:border-gold/60 transition-colors" />
                </div>
              </div>
              <div>
                <label class="block text-[11px] uppercase tracking-[0.2em] text-ink-muted font-light mb-2">{{ t('events.reservation.fields.notes') }}</label>
                <textarea v-model="form.notes" rows="3" class="w-full bg-parchment-light border border-parchment-deep px-4 py-3 text-sm font-light text-ink focus:outline-none focus:border-gold/60 transition-colors"></textarea>
              </div>
              <button type="submit" class="w-full mt-2 inline-flex items-center justify-center gap-2.5 text-[11px] uppercase tracking-[0.3em] font-light px-6 py-4 border border-gold/60 text-ink hover:bg-ink hover:text-parchment-light hover:border-ink transition-colors">
                {{ t('events.reservation.submit') }}
              </button>
            </form>
          </LuxeCard>

          <LuxeCard v-else class="reveal text-center">
            <div class="mx-auto w-12 h-12 border border-gold/60 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-gold-dark"><path d="M5 12l5 5L19 8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <p class="mt-6 text-sm text-ink-soft font-light leading-relaxed max-w-sm mx-auto">{{ t('events.reservation.success') }}</p>
            <router-link to="/events" class="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-ink hover:text-gold-dark transition-colors border-b border-gold/50 pb-1">
              {{ t('events.reservation.backCta') }} <span aria-hidden="true">→</span>
            </router-link>
          </LuxeCard>
        </div>
      </div>
    </section>
  </div>

  <div v-else class="py-32 text-center">
    <button class="text-[11px] uppercase tracking-[0.25em] text-gold-dark border-b border-gold/50 pb-1" @click="router.push('/events')">
      {{ t('events.reservation.backCta') }}
    </button>
  </div>
</template>
