<script setup>
import { ref, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LuxeCard from '../components/LuxeCard.vue'
import { useReveal } from '../composables/useReveal.js'

const { t, tm } = useI18n()
const route = useRoute()
const router = useRouter()

const courses = computed(() => tm('academy.courses'))
const courseIndex = computed(() => {
  const raw = route.query.course
  return raw !== undefined && raw !== null && courses.value[Number(raw)] ? Number(raw) : null
})
const course = computed(() => (courseIndex.value !== null ? courses.value[courseIndex.value] : null))
const itemName = computed(() => course.value?.title || t('academy.tiers.premium.name') + ' — ' + t('brand'))

const stage = ref('form') // form | processing | success
const step = ref('personal') // personal | payment
const form = reactive({ name: '', email: '', phone: '', address: '', card: '' })
const paymentMethod = ref('card')

const goToPayment = () => { step.value = 'payment' }
const goToPersonal = () => { step.value = 'personal' }

const submit = () => {
  stage.value = 'processing'
  window.setTimeout(() => { stage.value = 'success' }, 1400)
}

const goBack = () => {
  if (courseIndex.value !== null) router.push(`/academy/course/${courseIndex.value}`)
  else router.push('/academy')
}

useReveal()
</script>

<template>
  <div>
    <section class="bg-ink py-16 md:py-24">
      <div class="max-w-3xl mx-auto px-8 text-center">
        <p class="text-[11px] uppercase tracking-[0.35em] text-gold/80 font-light mb-5">{{ t('checkout.hero.eyebrow') }}</p>
        <h1 class="font-serif font-light text-parchment-light text-4xl md:text-5xl tracking-wide">{{ t('checkout.hero.title') }}</h1>
      </div>
    </section>

    <section class="py-16 md:py-24 bg-parchment-light">
      <div class="max-w-3xl mx-auto px-8">

        <!-- Success state -->
        <div v-if="stage === 'success'" class="reveal text-center">
          <LuxeCard>
            <div class="mx-auto w-12 h-12 border border-gold/60 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-gold-dark"><path d="M5 12l5 5L19 8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <h2 class="mt-6 font-serif font-light text-2xl text-ink">{{ t('checkout.successTitle') }}</h2>
            <p class="mt-3 text-sm text-ink-soft font-light leading-relaxed max-w-md mx-auto">{{ t('checkout.successDesc') }}</p>

            <div class="mt-7 inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.2em] text-gold-dark border border-gold/50 bg-gold/5 px-4 py-2.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12l5 5L19 8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              {{ t('checkout.successToast') }}
            </div>

            <div class="mt-8 flex items-center justify-center gap-8 flex-wrap">
              <button class="text-[11px] uppercase tracking-[0.25em] text-ink hover:text-gold-dark transition-colors border-b border-gold/50 pb-1" @click="goBack">
                {{ t('checkout.backCta') }}
              </button>
              <router-link to="/academy" class="text-[11px] uppercase tracking-[0.25em] text-ink-muted hover:text-ink transition-colors border-b border-transparent hover:border-gold/40 pb-1">
                {{ t('checkout.continueCta') }}
              </router-link>
            </div>
          </LuxeCard>
        </div>

        <!-- Form / processing state -->
        <div v-else>
          <!-- Step indicator -->
          <div class="reveal mb-10 flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.2em] font-light">
            <div class="flex items-center gap-2.5" :class="step === 'personal' ? 'text-gold-dark' : 'text-ink-muted'">
              <span class="flex items-center justify-center w-7 h-7 border rounded-full" :class="step === 'personal' ? 'border-gold text-gold-dark' : 'border-parchment-deep text-ink-muted'">1</span>
              <span>{{ t('checkout.stepPersonal') }}</span>
            </div>
            <span class="w-10 h-px bg-parchment-deep"></span>
            <div class="flex items-center gap-2.5" :class="step === 'payment' ? 'text-gold-dark' : 'text-ink-muted'">
              <span class="flex items-center justify-center w-7 h-7 border rounded-full" :class="step === 'payment' ? 'border-gold text-gold-dark' : 'border-parchment-deep text-ink-muted'">2</span>
              <span>{{ t('checkout.stepPayment') }}</span>
            </div>
          </div>

          <div class="grid md:grid-cols-5 gap-12">
            <!-- Order / package preview -->
            <div class="md:col-span-2">
              <LuxeCard class="reveal" :title="t('checkout.summaryTitle')">
                <dl class="space-y-5 text-sm">
                  <div>
                    <dt class="text-ink-muted uppercase tracking-[0.15em] text-[11px] font-light">{{ t('checkout.itemLabel') }}</dt>
                    <dd class="mt-1.5 text-ink font-light leading-snug">{{ itemName }}</dd>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-ink-muted uppercase tracking-[0.15em] text-[11px] font-light">{{ t('checkout.tierLabel') }}</dt>
                    <dd class="text-gold-dark uppercase tracking-[0.2em] text-[11px] font-light border border-gold/50 px-2.5 py-1">{{ t('academy.filters.premium') }}</dd>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-ink-muted uppercase tracking-[0.15em] text-[11px] font-light">{{ t('checkout.priceLabel') }}</dt>
                    <dd class="text-ink font-light">{{ t('checkout.mockPrice') }}</dd>
                  </div>
                  <div class="flex items-center justify-between gap-4 pt-5 border-t border-parchment-deep">
                    <dt class="text-ink uppercase tracking-[0.15em] text-[11px] font-light">{{ t('checkout.totalLabel') }}</dt>
                    <dd class="text-ink font-serif text-lg">{{ t('checkout.mockPrice') }}</dd>
                  </div>
                </dl>
              </LuxeCard>
            </div>

            <!-- Step content -->
            <div class="md:col-span-3">
              <!-- Step 1: Personal information -->
              <LuxeCard v-show="step === 'personal'" class="reveal" :title="t('checkout.formTitle')" style="transition-delay: 60ms;">
                <form class="space-y-6" @submit.prevent="goToPayment">
                  <div>
                    <label class="block text-[11px] uppercase tracking-[0.2em] text-ink-muted font-light mb-2">{{ t('checkout.fields.name') }}</label>
                    <input v-model="form.name" type="text" required class="w-full bg-parchment-light border border-parchment-deep px-4 py-3 text-sm font-light text-ink focus:outline-none focus:border-gold/60 transition-colors" />
                  </div>
                  <div class="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-[11px] uppercase tracking-[0.2em] text-ink-muted font-light mb-2">{{ t('checkout.fields.email') }}</label>
                      <input v-model="form.email" type="email" required class="w-full bg-parchment-light border border-parchment-deep px-4 py-3 text-sm font-light text-ink focus:outline-none focus:border-gold/60 transition-colors" />
                    </div>
                    <div>
                      <label class="block text-[11px] uppercase tracking-[0.2em] text-ink-muted font-light mb-2">{{ t('checkout.fields.phone') }}</label>
                      <input v-model="form.phone" type="tel" class="w-full bg-parchment-light border border-parchment-deep px-4 py-3 text-sm font-light text-ink focus:outline-none focus:border-gold/60 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label class="block text-[11px] uppercase tracking-[0.2em] text-ink-muted font-light mb-2">{{ t('checkout.fields.address') }}</label>
                    <input v-model="form.address" type="text" class="w-full bg-parchment-light border border-parchment-deep px-4 py-3 text-sm font-light text-ink focus:outline-none focus:border-gold/60 transition-colors" />
                  </div>

                  <button
                    type="submit"
                    class="w-full mt-2 inline-flex items-center justify-center gap-2.5 text-[11px] uppercase tracking-[0.3em] font-light px-6 py-4 border border-gold/60 text-ink hover:bg-ink hover:text-parchment-light hover:border-ink transition-colors"
                  >
                    {{ t('checkout.next') }} <span aria-hidden="true">→</span>
                  </button>
                </form>
              </LuxeCard>

              <!-- Step 2: Payment method -->
              <LuxeCard v-show="step === 'payment'" class="reveal" :title="t('checkout.paymentTitle')" style="transition-delay: 60ms;">
                <form class="space-y-6" @submit.prevent="submit">
                  <div class="space-y-3">
                    <label
                      v-for="opt in ['card', 'paypal', 'bank']"
                      :key="opt"
                      class="flex items-center gap-4 px-5 py-4 border cursor-pointer transition-colors"
                      :class="paymentMethod === opt ? 'border-gold bg-gold/10' : 'border-parchment-deep hover:border-gold/40'"
                    >
                      <input v-model="paymentMethod" type="radio" name="paymentMethod" :value="opt" class="accent-current text-gold" />
                      <span class="text-sm font-light text-ink">{{ t(`checkout.paymentOptions.${opt}`) }}</span>
                    </label>
                  </div>

                  <div v-if="paymentMethod === 'card'">
                    <label class="block text-[11px] uppercase tracking-[0.2em] text-ink-muted font-light mb-2">{{ t('checkout.fields.card') }}</label>
                    <input v-model="form.card" type="text" placeholder="•••• •••• •••• ••••" maxlength="19" class="w-full bg-parchment-light border border-parchment-deep px-4 py-3 text-sm font-light text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-gold/60 transition-colors" />
                    <p class="mt-2.5 text-xs text-ink-muted font-light leading-relaxed">{{ t('checkout.cardNote') }}</p>
                  </div>

                  <div class="flex items-center gap-5">
                    <button
                      type="button"
                      @click="goToPersonal"
                      class="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-ink-muted hover:text-ink transition-colors border-b border-transparent hover:border-gold/40 pb-1"
                    >
                      <span aria-hidden="true">←</span> {{ t('checkout.back') }}
                    </button>
                    <button
                      type="submit"
                      :disabled="stage === 'processing'"
                      class="flex-1 inline-flex items-center justify-center gap-2.5 text-[11px] uppercase tracking-[0.3em] font-light px-6 py-4 border transition-colors"
                      :class="stage === 'processing'
                        ? 'border-parchment-deep text-ink-muted cursor-wait'
                        : 'border-gold/60 text-ink hover:bg-ink hover:text-parchment-light hover:border-ink'"
                    >
                      <svg v-if="stage === 'processing'" class="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="9" stroke-opacity="0.25" />
                        <path d="M21 12a9 9 0 0 0-9-9" stroke-linecap="round" />
                      </svg>
                      {{ stage === 'processing' ? t('checkout.processing') : t('checkout.submit') }}
                    </button>
                  </div>
                  <p class="text-center text-[11px] text-ink-muted font-light italic">{{ t('checkout.hero.eyebrow') }} · {{ t('checkout.mockPrice') }}</p>
                </form>
              </LuxeCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
