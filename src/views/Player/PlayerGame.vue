<template>
  <div class="player-game">
    <div v-if="gameState === 'waiting'" class="waiting-view">
      <h1>{{ t('player.game.waitingToStart') }}</h1>
      <div class="loading-spinner"></div>
    </div>

    <div v-else-if="gameState === 'question'" class="question-view">
      <div class="question-header">
        <h2>{{ t('host.game.question', { current: currentQuestionNumber, total: totalQuestions }) }}</h2>
      </div>

      <div class="question-card">
        <div v-if="currentQuestion?.imageUrl" class="question-image">
          <img :src="currentQuestion.imageUrl" :alt="currentQuestion.text" />
        </div>
        <h1 class="question-text">{{ currentQuestion?.text }}</h1>
      </div>

      <div v-if="!hasSubmitted" class="selection-prompt">
        <p>{{ t('player.game.selectAnswer') }}</p>
      </div>

      <div class="options-grid">
        <button
          v-for="(option, index) in currentQuestion?.options"
          :key="index"
          class="option-button"
          :class="{
            selected: selectedOption === index,
            disabled: hasSubmitted
          }"
          :disabled="hasSubmitted"
          @click="selectOption(index)"
        >
          <div class="option-number">{{ index + 1 }}</div>
          <div class="option-text">{{ option }}</div>
        </button>
      </div>

      <div v-if="hasSubmitted" class="submitted-message">
        <p>{{ t('player.game.submitted') }}</p>
        <p class="wait-text">{{ t('player.game.waitingForResults') }}</p>
      </div>

      <div class="score-display">
        <p>{{ t('player.game.yourScore', { score: playerScore }) }}</p>
      </div>
    </div>

    <div v-else-if="gameState === 'results'" class="results-view">
      <div class="feedback-card" :class="{ correct: wasCorrect, incorrect: !wasCorrect }">
        <div class="feedback-icon">{{ wasCorrect ? '✓' : '✗' }}</div>
        <h2>{{ wasCorrect ? t('player.game.correct') : t('player.game.incorrect') }}</h2>
      </div>

      <div v-if="!wasCorrect && selectedOption !== null" class="your-answer-display">
        <p class="label">{{ t('player.game.yourAnswer') }}:</p>
        <div class="answer-box incorrect-answer">
          <div class="option-number">{{ selectedOption + 1 }}</div>
          <div class="option-text">{{ currentQuestion?.options[selectedOption] }}</div>
        </div>
      </div>

      <div class="correct-answer-display">
        <p class="label">{{ t('host.game.results.correctAnswer') }}:</p>
        <div class="answer-box correct-answer">
          <div class="option-number">{{ (correctAnswer ?? 0) + 1 }}</div>
          <div class="option-text">{{ currentQuestion?.options[correctAnswer ?? 0] }}</div>
        </div>
      </div>

      <div class="score-display large">
        <p>{{ t('player.game.yourScore', { score: playerScore }) }}</p>
      </div>

      <div class="waiting-message">
        <p>{{ t('player.game.waitingForHost') }}</p>
      </div>
    </div>

    <div v-else-if="gameState === 'finished'" class="finished-view">
      <h1>{{ t('player.game.gameFinished') }}</h1>

      <div class="final-score-card">
        <p class="final-score-label">{{ t('player.game.finalScore', { score: playerScore }) }}</p>
        <div class="final-score-value">{{ playerScore }}</div>
      </div>

      <button class="action-btn" @click="goHome">
        {{ t('common.back') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { socketService } from '../../services/socket.service'
import type { Question } from '../../types/game.types'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const gameId = ref(route.params.gameId as string)
const gameState = ref<'waiting' | 'question' | 'results' | 'finished'>('waiting')
const currentQuestion = ref<Question | null>(null)
const currentQuestionNumber = ref(0)
const totalQuestions = ref(0)
const selectedOption = ref<number | null>(null)
const hasSubmitted = ref(false)
const wasCorrect = ref(false)
const correctAnswer = ref<number | null>(null)
const playerScore = ref(0)

function handleGameStarted(data: { currentQuestion: Question; questionNumber: number }) {
  currentQuestion.value = data.currentQuestion
  currentQuestionNumber.value = data.questionNumber
  totalQuestions.value = 1
  gameState.value = 'question'
  resetQuestionState()
}

function handleQuestionStarted(data: { question: Question; questionNumber: number; totalQuestions: number }) {
  currentQuestion.value = data.question
  currentQuestionNumber.value = data.questionNumber
  totalQuestions.value = data.totalQuestions
  gameState.value = 'question'
  resetQuestionState()
}

function handleQuestionResults(data: { correctAnswer: number; leaderboard: Array<{ nickname: string; score: number }> }) {
  correctAnswer.value = data.correctAnswer

  // Determine if player's answer was correct
  if (selectedOption.value !== null) {
    wasCorrect.value = selectedOption.value === data.correctAnswer
  }

  // Update player's score from leaderboard (not ideal but works for MVP)
  // Note: In a real app, we'd track this more reliably
  gameState.value = 'results'

  // Update score from leaderboard if available
  const playerEntry = data.leaderboard.find(p => p.score !== undefined)
  if (playerEntry) {
    playerScore.value = playerEntry.score
  }
}

function handleGameFinished(data: { finalScores: Array<{ nickname: string; score: number }> }) {
  // Update final score from leaderboard
  if (data.finalScores.length > 0) {
    const playerEntry = data.finalScores.find(p => p.score !== undefined)
    if (playerEntry) {
      playerScore.value = playerEntry.score
    }
  }
  gameState.value = 'finished'
}

function resetQuestionState() {
  selectedOption.value = null
  hasSubmitted.value = false
  wasCorrect.value = false
  correctAnswer.value = null
}

function selectOption(index: number) {
  if (hasSubmitted.value) return

  selectedOption.value = index
  hasSubmitted.value = true

  socketService.submitAnswer({
    gameId: gameId.value,
    optionIndex: index
  })
}

function goHome() {
  socketService.disconnect()
  router.push('/')
}

onMounted(() => {
  if (!socketService.isConnected) {
    router.push('/')
    return
  }

  socketService.onGameStarted(handleGameStarted)
  socketService.onQuestionStarted(handleQuestionStarted)
  socketService.onQuestionResults(handleQuestionResults)
  socketService.onGameFinished(handleGameFinished)
})

onUnmounted(() => {
  socketService.offGameStarted(handleGameStarted)
  socketService.offQuestionStarted(handleQuestionStarted)
  socketService.offQuestionResults(handleQuestionResults)
  socketService.offGameFinished(handleGameFinished)
})
</script>

<style scoped>
.player-game {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
}

.waiting-view,
.finished-view {
  text-align: center;
  padding: 4rem 2rem;
}

.waiting-view h1 {
  color: #2c3e50;
  margin-bottom: 2rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.question-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.question-header h2 {
  color: #42b983;
}

.question-card {
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.question-image {
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
}

.question-image img {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: contain;
  display: block;
}

.question-text {
  text-align: center;
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
}

.selection-prompt {
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #42b983;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.option-button {
  background: white;
  border: 3px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.option-button:hover:not(.disabled) {
  border-color: #42b983;
  transform: translateX(4px);
}

.option-button.selected {
  background: #42b983;
  border-color: #42b983;
  color: white;
}

.option-button.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.option-button .option-number {
  width: 40px;
  height: 40px;
  background: #42b983;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.option-button.selected .option-number {
  background: white;
  color: #42b983;
}

.option-button .option-text {
  flex: 1;
  font-size: 1.125rem;
  font-weight: 500;
}

.submitted-message {
  text-align: center;
  padding: 1.5rem;
  background: #e8f5e9;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.submitted-message p {
  margin: 0.25rem 0;
  font-weight: 600;
  color: #2e7d32;
}

.wait-text {
  font-size: 0.875rem;
  font-weight: 400;
  color: #666;
}

.score-display {
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #646cff;
}

.score-display.large {
  font-size: 2rem;
  margin: 2rem 0;
}

.results-view {
  text-align: center;
}

.feedback-card {
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.feedback-card.correct {
  background: #42b983;
  color: white;
}

.feedback-card.incorrect {
  background: #ff4444;
  color: white;
}

.feedback-icon {
  font-size: 4rem;
  margin-bottom: 0.5rem;
}

.feedback-card h2 {
  margin: 0;
  font-size: 2rem;
}

.your-answer-display,
.correct-answer-display {
  margin-bottom: 2rem;
}

.your-answer-display .label,
.correct-answer-display .label {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.answer-box {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  border: 3px solid #e0e0e0;
}

.answer-box.correct-answer {
  background: #e8f5e9;
  border-color: #42b983;
}

.answer-box.incorrect-answer {
  background: #ffebee;
  border-color: #ff4444;
}

.answer-box .option-number {
  width: 50px;
  height: 50px;
  background: #646cff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.5rem;
}

.answer-box.correct-answer .option-number {
  background: #42b983;
}

.answer-box.incorrect-answer .option-number {
  background: #ff4444;
}

.answer-box .option-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.waiting-message {
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  color: #666;
  font-style: italic;
}

.finished-view h1 {
  color: #42b983;
  margin-bottom: 2rem;
}

.final-score-card {
  background: linear-gradient(135deg, #42b983, #359268);
  padding: 3rem 2rem;
  border-radius: 12px;
  color: white;
  margin-bottom: 2rem;
}

.final-score-label {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.final-score-value {
  font-size: 4rem;
  font-weight: 700;
}

.action-btn {
  width: 100%;
  padding: 1.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #646cff;
  color: white;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #4e56d9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 108, 255, 0.3);
}

@media (max-width: 768px) {
  .player-game {
    padding: 1rem;
  }

  .question-text {
    font-size: 1.25rem;
  }

  .feedback-card h2 {
    font-size: 1.5rem;
  }

  .feedback-icon {
    font-size: 3rem;
  }

  .final-score-value {
    font-size: 3rem;
  }

  .score-display.large {
    font-size: 1.5rem;
  }
}
</style>
