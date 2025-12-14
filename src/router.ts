import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './views/HomePage.vue'
import CreateQuiz from './views/Host/CreateQuiz.vue'
import HostLobby from './views/Host/HostLobby.vue'
import HostGame from './views/Host/HostGame.vue'
import JoinGame from './views/Player/JoinGame.vue'
import PlayerGame from './views/Player/PlayerGame.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/host/create',
      name: 'host-create',
      component: CreateQuiz
    },
    {
      path: '/host/lobby/:gameId',
      name: 'host-lobby',
      component: HostLobby
    },
    {
      path: '/host/game/:gameId',
      name: 'host-game',
      component: HostGame
    },
    {
      path: '/player/join',
      name: 'player-join',
      component: JoinGame
    },
    {
      path: '/player/game/:gameId',
      name: 'player-game',
      component: PlayerGame
    }
  ]
})

export default router
