<template>
  <div class="home-page">
    <div class="header">
      <h1>{{ t('home.title') }}</h1>
      <div class="language-switcher">
        <button
          :class="{ active: locale === 'en' }"
          @click="switchLocale('en')"
        >
          EN
        </button>
        <button
          :class="{ active: locale === 'uk' }"
          @click="switchLocale('uk')"
        >
          UK
        </button>
      </div>
    </div>

    <div class="actions">
      <button class="action-button host" @click="goToCreateQuiz">
        {{ t('home.createQuiz') }}
      </button>
      <button class="action-button player" @click="goToJoinGame">
        {{ t('home.joinGame') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { setLocale } from '../i18n'

const { t, locale } = useI18n()
const router = useRouter()

function switchLocale(newLocale: string) {
  setLocale(newLocale)
}

function goToCreateQuiz() {
  router.push('/host/create')
}

function goToJoinGame() {
  router.push('/player/join')
}
</script>

<style scoped>
.home-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.header {
  margin-bottom: 3rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.language-switcher {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.language-switcher button {
  padding: 0.5rem 1rem;
  border: 2px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s;
}

.language-switcher button.active {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.language-switcher button:hover:not(.active) {
  border-color: #42b983;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.action-button {
  padding: 1.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  color: white;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.action-button.host {
  background: #646cff;
}

.action-button.player {
  background: #42b983;
}

@media (max-width: 640px) {
  .home-page {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .action-button {
    padding: 1.25rem;
    font-size: 1.125rem;
  }
}
</style>
