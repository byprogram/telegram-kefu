import { createApp } from 'vue'
import App from './App.vue'
import { createI18n } from 'vue-i18n'
import en from './locales/en'
import zh from './locales/zh'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'zh',
  messages: {
    en,
    zh
  }
})

const app = createApp(App)
app.use(i18n)
app.mount('#app')
