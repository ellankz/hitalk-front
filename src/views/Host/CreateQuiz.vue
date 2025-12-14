<template>
  <div class="create-quiz">
    <h1>{{ t('host.createQuiz.title') }}</h1>

    <div class="quiz-form">
      <div class="form-group">
        <label>{{ t('host.createQuiz.quizTitle') }}</label>
        <input
          v-model="quizTitle"
          type="text"
          :placeholder="t('host.createQuiz.quizTitlePlaceholder')"
        />
      </div>

      <div class="questions-section">
        <div
          v-for="(question, qIndex) in questions"
          :key="qIndex"
          class="question-card"
        >
          <div class="question-header">
            <h3>{{ t('host.createQuiz.questionNumber', { number: qIndex + 1 }) }}</h3>
            <button
              v-if="questions.length > 1"
              class="remove-btn"
              @click="removeQuestion(qIndex)"
            >
              {{ t('host.createQuiz.removeQuestion') }}
            </button>
          </div>

          <div class="form-group">
            <label>{{ t('host.createQuiz.questionText') }}</label>
            <input
              v-model="question.text"
              type="text"
              :placeholder="t('host.createQuiz.questionPlaceholder')"
            />
          </div>

          <div class="form-group">
            <label>{{ t('host.createQuiz.imageUrl') }} ({{ t('host.createQuiz.optional') }})</label>
            <input
              v-model="question.imageUrl"
              type="url"
              :placeholder="t('host.createQuiz.imageUrlPlaceholder')"
            />
            <div v-if="question.imageUrl" class="image-preview">
              <img :src="question.imageUrl" :alt="t('host.createQuiz.imagePreview')" />
            </div>
          </div>

          <div class="options-grid">
            <div
              v-for="(_option, oIndex) in question.options"
              :key="oIndex"
              class="option-group"
            >
              <label>{{ t('host.createQuiz.option', { number: oIndex + 1 }) }}</label>
              <input
                v-model="question.options[oIndex]"
                type="text"
                :placeholder="t('host.createQuiz.optionPlaceholder', { number: oIndex + 1 })"
              />
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('host.createQuiz.correctAnswer') }}</label>
            <select v-model="question.correctOptionIndex">
              <option :value="0">{{ t('host.createQuiz.option', { number: 1 }) }}</option>
              <option :value="1">{{ t('host.createQuiz.option', { number: 2 }) }}</option>
              <option :value="2">{{ t('host.createQuiz.option', { number: 3 }) }}</option>
              <option :value="3">{{ t('host.createQuiz.option', { number: 4 }) }}</option>
            </select>
          </div>
        </div>
      </div>

      <button class="add-question-btn" @click="addQuestion">
        {{ t('host.createQuiz.addQuestion') }}
      </button>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="actions">
        <button class="back-btn" @click="goBack">{{ t('common.back') }}</button>
        <button class="create-btn" @click="createGame">
          {{ t('host.createQuiz.createGame') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { socketService } from '../../services/socket.service'
import type { Question } from '../../types/game.types'

const { t } = useI18n()
const router = useRouter()

const quizTitle = ref('')
const questions = ref<Question[]>([
  {
    id: crypto.randomUUID(),
    text: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    imageUrl: ''
  }
])
const errorMessage = ref('')

function addQuestion() {
  questions.value.push({
    id: crypto.randomUUID(),
    text: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    imageUrl: ''
  })
}

function removeQuestion(index: number) {
  questions.value.splice(index, 1)
}

function validateQuiz(): boolean {
  errorMessage.value = ''

  if (!quizTitle.value.trim()) {
    errorMessage.value = t('host.createQuiz.validation.titleRequired')
    return false
  }

  if (questions.value.length === 0) {
    errorMessage.value = t('host.createQuiz.validation.minQuestions')
    return false
  }

  for (const question of questions.value) {
    if (!question.text.trim()) {
      errorMessage.value = t('host.createQuiz.validation.questionRequired')
      return false
    }

    if (question.options.some(opt => !opt.trim())) {
      errorMessage.value = t('host.createQuiz.validation.optionRequired')
      return false
    }
  }

  return true
}

function createGame() {
  if (!validateQuiz()) return

  socketService.connect()

  socketService.onGameCreated((data) => {
    router.push({
      name: 'host-lobby',
      params: { gameId: data.gameId }
    })
  })

  socketService.onError((error) => {
    errorMessage.value = error.message
  })

  socketService.createGame({
    title: quizTitle.value,
    questions: questions.value
  })
}

function goBack() {
  router.push('/')
}
</script>

<style scoped>
.create-quiz {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.quiz-form {
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #646cff;
}

.questions-section {
  margin: 2rem 0;
}

.question-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 2px solid #e0e0e0;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.question-header h3 {
  margin: 0;
  color: #646cff;
}

.remove-btn {
  padding: 0.5rem 1rem;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.remove-btn:hover {
  background: #cc0000;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.option-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.add-question-btn {
  width: 100%;
  padding: 1rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.add-question-btn:hover {
  background: #359268;
}

.error-message {
  padding: 1rem;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
}

.actions {
  display: flex;
  gap: 1rem;
}

.back-btn,
.create-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
}

.back-btn {
  background: #ddd;
  color: #333;
}

.back-btn:hover {
  background: #ccc;
}

.create-btn {
  background: #646cff;
  color: white;
}

.create-btn:hover {
  background: #4e56d9;
}

.image-preview {
  margin-top: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  max-width: 100%;
}

.image-preview img {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: contain;
  display: block;
}

@media (max-width: 768px) {
  .create-quiz {
    padding: 1rem;
  }

  h1 {
    font-size: 1.75rem;
  }

  .quiz-form {
    padding: 1.5rem;
  }

  .options-grid {
    grid-template-columns: 1fr;
  }

  .question-card {
    padding: 1rem;
  }
}
</style>
