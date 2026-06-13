import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import en from './locales/en.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import zh from './locales/zh.json'
import ru from './locales/ru.json'
import tr from './locales/tr.json'
import fa from './locales/fa.json'
import ar from './locales/ar.json'
import './assets/fonts.css'
import './style.css'
import { initTheme } from './composables/useTheme.js'

initTheme()

const SUPPORTED = ['en', 'fr', 'de', 'zh', 'ru', 'tr', 'fa', 'ar']
const saved = localStorage.getItem('locale')
const savedLocale = SUPPORTED.includes(saved) ? saved : 'en'

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: { en, fr, de, zh, ru, tr, fa, ar },
})

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')
