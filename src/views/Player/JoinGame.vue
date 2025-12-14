<template>
  <div class="join-game">
    <h1>{{ t('player.join.title') }}</h1>

    <div class="join-form">
      <div class="form-group">
        <label>{{ t('player.join.roomCode') }}</label>
        <input
          v-model="roomCode"
          type="text"
          maxlength="6"
          :placeholder="t('player.join.roomCodePlaceholder')"
          @input="onRoomCodeInput"
        />
      </div>

      <div class="form-group">
        <label>{{ t('player.join.nickname') }}</label>
        <input
          v-model="nickname"
          type="text"
          :placeholder="t('player.join.nicknamePlaceholder')"
          @keyup.enter="joinGame"
        />
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="actions">
        <button class="back-btn" @click="goBack">{{ t('common.back') }}</button>
        <button class="join-btn" @click="joinGame">
          {{ t('player.join.joinButton') }}
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

const { t } = useI18n()
const router = useRouter()

const roomCode = ref('')
const nickname = ref('')
const errorMessage = ref('')

function onRoomCodeInput(event: Event) {
  const input = event.target as HTMLInputElement
  // Only allow digits
  input.value = input.value.replace(/\D/g, '')
  roomCode.value = input.value
}

function validateForm(): boolean {
  errorMessage.value = ''

  if (!roomCode.value.trim()) {
    errorMessage.value = t('player.join.validation.roomCodeRequired')
    return false
  }

  if (roomCode.value.length !== 6) {
    errorMessage.value = t('player.join.validation.roomCodeInvalid')
    return false
  }

  if (!nickname.value.trim()) {
    errorMessage.value = t('player.join.validation.nicknameRequired')
    return false
  }

  return true
}

function joinGame() {
  if (!validateForm()) return

  socketService.connect()

  socketService.onPlayerJoined(() => {
    router.push({
      name: 'player-game',
      params: { gameId: roomCode.value }
    })
  })

  socketService.onError((error) => {
    errorMessage.value = error.message
  })

  socketService.joinGame({
    roomCode: roomCode.value,
    nickname: nickname.value
  })
}

function goBack() {
  router.push('/')
}
</script>

<style scoped>
.join-game {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.join-form {
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

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #42b983;
}

input[type="text"][maxlength="6"] {
  font-size: 1.5rem;
  font-family: monospace;
  letter-spacing: 0.25rem;
  text-align: center;
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
.join-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
}

.back-btn {
  background: #ddd;
  color: #333;
}

.back-btn:hover {
  background: #ccc;
}

.join-btn {
  background: #42b983;
  color: white;
}

.join-btn:hover {
  background: #359268;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}
</style>
