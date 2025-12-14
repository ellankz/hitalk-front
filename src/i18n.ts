import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import uk from './locales/uk.json'

const savedLocale = localStorage.getItem('locale') || 'en'

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    uk
  }
})

export function setLocale(locale: string) {
  i18n.global.locale.value = locale as 'en' | 'uk'
  localStorage.setItem('locale', locale)
}
