<template>
  <div class="host-lobby">
    <h1>{{ t('host.lobby.title') }}</h1>

    <div class="room-code-display">
      <div class="label">{{ t('host.lobby.roomCode') }}</div>
      <div class="code">{{ roomCode }}</div>
    </div>

    <div class="players-section">
      <h2>{{ t('host.lobby.playersWaiting') }}</h2>
      <div v-if="players.length === 0" class="no-players">
        {{ t('host.lobby.noPlayers') }}
      </div>
      <ul v-else class="players-list">
        <li v-for="player in players" :key="player.socketId" class="player-item">
          {{ player.nickname }}
        </li>
      </ul>
    </div>

    <button
      class="start-btn"
      :disabled="players.length === 0"
      @click="startGame"
    >
      {{ t('host.lobby.startGame') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { socketService } from '../../services/socket.service'
import type { Player } from '../../types/game.types'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const gameId = ref(route.params.gameId as string)
const roomCode = ref(gameId.value)
const players = ref<Player[]>([])

function handlePlayerJoined(data: { players: Player[] }) {
  players.value = data.players.filter(p => !p.isHost)
}

function handleGameStarted() {
  router.push({
    name: 'host-game',
    params: { gameId: gameId.value }
  })
}

function startGame() {
  socketService.startGame(gameId.value)
}

onMounted(() => {
  if (!socketService.isConnected) {
    router.push('/')
    return
  }

  socketService.onPlayerJoined(handlePlayerJoined)
  socketService.onGameStarted(handleGameStarted)
})

onUnmounted(() => {
  socketService.offPlayerJoined(handlePlayerJoined)
  socketService.offGameStarted(handleGameStarted)
})
</script>

<style scoped>
.host-lobby {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  margin-bottom: 2rem;
  color: #2c3e50;
}

.room-code-display {
  background: #646cff;
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.room-code-display .label {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.room-code-display .code {
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: 0.5rem;
  font-family: monospace;
}

.players-section {
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  min-height: 200px;
}

.players-section h2 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.no-players {
  color: #999;
  font-style: italic;
  padding: 2rem 0;
}

.players-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.player-item {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 2px solid #e0e0e0;
  font-weight: 500;
}

.start-btn {
  width: 100%;
  padding: 1.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #42b983;
  color: white;
  transition: all 0.2s;
}

.start-btn:hover:not(:disabled) {
  background: #359268;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.start-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
