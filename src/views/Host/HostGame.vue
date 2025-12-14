<template>
  <div class="host-game">
    <div v-if="gameState === 'question'" class="question-view">
      <div class="question-header">
        <h2>{{ t('host.game.question', { current: currentQuestionNumber, total: totalQuestions }) }}</h2>
      </div>

      <div class="question-card">
        <div v-if="currentQuestion?.imageUrl" class="question-image">
          <img :src="currentQuestion.imageUrl" :alt="currentQuestion.text" />
        </div>
        <h1 class="question-text">{{ currentQuestion?.text }}</h1>
        <div class="options-grid">
          <div
            v-for="(option, index) in currentQuestion?.options"
            :key="index"
            class="option-card"
          >
            <div class="option-number">{{ index + 1 }}</div>
            <div class="option-text">{{ option }}</div>
          </div>
        </div>
      </div>

      <div class="game-info">
        <p>{{ t('host.game.waitingForAnswers') }}</p>
        <p class="answer-count">{{ t('host.game.playersAnswered', { count: answeredCount }) }}</p>
      </div>

      <button class="action-btn" @click="showResults">
        {{ t('host.game.showResults') }}
      </button>
    </div>

    <div v-else-if="gameState === 'results'" class="results-view">
      <h2>{{ t('host.game.results.title') }}</h2>

      <div class="correct-answer-display">
        <p class="label">{{ t('host.game.results.correctAnswer') }}:</p>
        <div class="answer-box">
          <div class="option-number">{{ (results?.correctAnswer ?? 0) + 1 }}</div>
          <div class="option-text">{{ currentQuestion?.options[results?.correctAnswer ?? 0] }}</div>
        </div>
      </div>

      <div class="stats">
        <div class="stat-card correct">
          <div class="stat-value">{{ results?.correctCount ?? 0 }}</div>
          <div class="stat-label">{{ t('host.game.results.correct', { count: results?.correctCount ?? 0 }) }}</div>
        </div>
        <div class="stat-card incorrect">
          <div class="stat-value">{{ results?.incorrectCount ?? 0 }}</div>
          <div class="stat-label">{{ t('host.game.results.incorrect', { count: results?.incorrectCount ?? 0 }) }}</div>
        </div>
      </div>

      <div class="leaderboard">
        <h3>{{ t('host.game.results.leaderboard') }}</h3>
        <div class="leaderboard-list">
          <div
            v-for="(player, index) in results?.leaderboard"
            :key="index"
            class="leaderboard-item"
            :class="{
              first: index === 0,
              second: index === 1,
              third: index === 2
            }"
          >
            <span class="rank" :class="{ badge: index < 3 }">
              <span v-if="index === 0" class="medal">🥇</span>
              <span v-else-if="index === 1" class="medal">🥈</span>
              <span v-else-if="index === 2" class="medal">🥉</span>
              <span v-else>{{ index + 1 }}</span>
            </span>
            <span class="name">{{ player.nickname }}</span>
            <span class="score">{{ player.score }}</span>
          </div>
        </div>
      </div>

      <button v-if="hasMoreQuestions" class="action-btn" @click="nextQuestion">
        {{ t('host.game.nextQuestion') }}
      </button>
      <button v-else class="action-btn" @click="viewFinalScores">
        {{ t('host.game.viewFinalScores') }}
      </button>
    </div>

    <div v-else-if="gameState === 'finished'" class="finished-view">
      <h1>{{ t('host.game.finished.title') }}</h1>

      <div v-if="finalScores && finalScores.length > 0" class="winner-display">
        <p class="winner-label">{{ t('host.game.finished.winner') }}</p>
        <div class="winner-card">
          <div class="winner-name">{{ finalScores[0]?.nickname }}</div>
          <div class="winner-score">{{ finalScores[0]?.score }}</div>
        </div>
      </div>

      <div class="final-leaderboard">
        <h3>{{ t('host.game.finished.finalScores') }}</h3>
        <div class="leaderboard-list">
          <div
            v-for="(player, index) in finalScores"
            :key="index"
            class="leaderboard-item"
            :class="{
              first: index === 0,
              second: index === 1,
              third: index === 2
            }"
          >
            <span class="rank" :class="{ badge: index < 3 }">
              <span v-if="index === 0" class="medal">🥇</span>
              <span v-else-if="index === 1" class="medal">🥈</span>
              <span v-else-if="index === 2" class="medal">🥉</span>
              <span v-else>{{ index + 1 }}</span>
            </span>
            <span class="name">{{ player.nickname }}</span>
            <span class="score">{{ player.score }}</span>
          </div>
        </div>
      </div>

      <button class="action-btn" @click="goHome">
        {{ t('common.back') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { socketService } from '../../services/socket.service'
import type { Question, PlayerScore, QuestionResultsResponse } from '../../types/game.types'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const gameId = ref(route.params.gameId as string)
const gameState = ref<'question' | 'results' | 'finished'>('question')
const currentQuestion = ref<Question | null>(null)
const currentQuestionNumber = ref(0)
const totalQuestions = ref(0)
const answeredCount = ref(0)
const results = ref<QuestionResultsResponse | null>(null)
const finalScores = ref<PlayerScore[]>([])

const hasMoreQuestions = computed(() => {
  return currentQuestionNumber.value < totalQuestions.value
})

function handleGameStarted(data: { currentQuestion: Question; questionNumber: number }) {
  currentQuestion.value = data.currentQuestion
  currentQuestionNumber.value = data.questionNumber
  gameState.value = 'question'
  answeredCount.value = 0
}

function handleQuestionStarted(data: { question: Question; questionNumber: number; totalQuestions: number }) {
  currentQuestion.value = data.question
  currentQuestionNumber.value = data.questionNumber
  totalQuestions.value = data.totalQuestions
  gameState.value = 'question'
  answeredCount.value = 0
  results.value = null
}

function handleAnswerSubmitted() {
  answeredCount.value++
}

function handleQuestionResults(data: QuestionResultsResponse) {
  results.value = data
  gameState.value = 'results'
}

function handleGameFinished(data: { finalScores: PlayerScore[] }) {
  finalScores.value = data.finalScores
  gameState.value = 'finished'
}

function showResults() {
  socketService.showResults(gameId.value)
}

function nextQuestion() {
  socketService.nextQuestion(gameId.value)
}

function viewFinalScores() {
  // The game will automatically transition to finished state
  // when nextQuestion is called after the last question
  socketService.nextQuestion(gameId.value)
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
  socketService.onAnswerSubmitted(handleAnswerSubmitted)
  socketService.onQuestionResults(handleQuestionResults)
  socketService.onGameFinished(handleGameFinished)
})

onUnmounted(() => {
  socketService.offGameStarted(handleGameStarted)
  socketService.offQuestionStarted(handleQuestionStarted)
  socketService.offAnswerSubmitted(handleAnswerSubmitted)
  socketService.offQuestionResults(handleQuestionResults)
  socketService.offGameFinished(handleGameFinished)
})
</script>

<style scoped>
.host-game {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.question-header {
  text-align: center;
  margin-bottom: 2rem;
}

.question-header h2 {
  color: #646cff;
}

.question-card {
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.question-image {
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
}

.question-image img {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
  display: block;
}

.question-text {
  text-align: center;
  font-size: 1.75rem;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.option-card {
  background: white;
  border: 3px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.option-number {
  width: 40px;
  height: 40px;
  background: #646cff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
  font-size: 1.125rem;
}

.game-info {
  text-align: center;
  margin-bottom: 2rem;
}

.game-info p {
  margin: 0.5rem 0;
  color: #666;
}

.answer-count {
  font-weight: 600;
  font-size: 1.25rem;
  color: #42b983;
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

.results-view {
  text-align: center;
}

.results-view h2 {
  margin-bottom: 2rem;
  color: #2c3e50;
}

.correct-answer-display {
  margin-bottom: 2rem;
}

.correct-answer-display .label {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.answer-box {
  background: #42b983;
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  max-width: 500px;
  margin: 0 auto;
}

.answer-box .option-number {
  width: 50px;
  height: 50px;
  background: white;
  color: #42b983;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.5rem;
}

.answer-box .option-text {
  font-size: 1.25rem;
  font-weight: 600;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  padding: 1.5rem;
  border-radius: 8px;
  color: white;
}

.stat-card.correct {
  background: #42b983;
}

.stat-card.incorrect {
  background: #ff4444;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.9;
}

.leaderboard,
.final-leaderboard {
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.leaderboard h3,
.final-leaderboard h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.leaderboard-item {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 2px solid #e0e0e0;
  transition: transform 0.2s;
}

.leaderboard-item:hover {
  transform: translateX(4px);
}

.leaderboard-item.first {
  background: linear-gradient(135deg, #fff9e6, #fffaed);
  border: 3px solid #ffd700;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
}

.leaderboard-item.second {
  background: linear-gradient(135deg, #f5f5f5, #fafafa);
  border: 3px solid #c0c0c0;
}

.leaderboard-item.third {
  background: linear-gradient(135deg, #fff3e0, #fff8f0);
  border: 3px solid #cd7f32;
}

.leaderboard-item .rank {
  font-weight: 700;
  font-size: 1.25rem;
  color: #646cff;
  min-width: 40px;
  text-align: center;
}

.leaderboard-item .rank.badge {
  font-size: 1.75rem;
}

.leaderboard-item .medal {
  display: inline-block;
  font-size: 2rem;
}

.leaderboard-item .name {
  flex: 1;
  font-weight: 600;
  text-align: left;
}

.leaderboard-item .score {
  font-weight: 700;
  font-size: 1.125rem;
  color: #42b983;
}

.finished-view h1 {
  color: #42b983;
  margin-bottom: 2rem;
}

.winner-display {
  margin-bottom: 2rem;
}

.winner-label {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.winner-card {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  margin: 0 auto;
}

.winner-name {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.winner-score {
  font-size: 3rem;
  font-weight: 700;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .host-game {
    padding: 1rem;
  }

  .question-text {
    font-size: 1.5rem;
  }

  .options-grid {
    grid-template-columns: 1fr;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .winner-name {
    font-size: 1.5rem;
  }

  .winner-score {
    font-size: 2.5rem;
  }

  .leaderboard,
  .final-leaderboard {
    padding: 1.5rem;
  }
}
</style>
