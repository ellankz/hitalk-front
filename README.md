# Quiz Game - Frontend

Vue 3 + TypeScript frontend for the Kahoot-like quiz game.

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **Vue Router** - Client-side routing
- **Vue I18n** - Internationalization (EN/UK)
- **Socket.IO Client** - Real-time WebSocket communication

## Project Structure

```
src/
├── locales/          # Translation files (en.json, uk.json)
├── services/         # Socket.IO client service
├── types/            # TypeScript type definitions
├── views/            # Page components
│   ├── Host/         # Host UI (CreateQuiz, HostLobby, HostGame)
│   └── Player/       # Player UI (JoinGame, PlayerGame)
├── App.vue           # Root component
├── i18n.ts           # i18n configuration
├── main.ts           # Application entry point
└── router.ts         # Vue Router configuration
```

## Development

### Prerequisites

- Node.js (v18+)
- Backend server running on http://localhost:3000

### Install Dependencies

```bash
npm install
```

### Start Dev Server

```bash
npm run dev
```

Frontend will be available at http://localhost:5173

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Environment

The frontend connects to the backend WebSocket server at:
- **Development**: http://localhost:3000
- **Production**: Update `serverUrl` in `src/services/socket.service.ts`

## Features

### Host Flow
1. Create quiz with questions
2. View lobby with room code
3. Control game flow (start, show results, next question)
4. View leaderboard and final scores

### Player Flow
1. Join game with room code
2. Answer questions
3. See immediate feedback (correct/incorrect)
4. View final score

### Internationalization
- Switch between English and Ukrainian
- Preference saved in localStorage
- All UI text fully translated

## WebSocket Events

The frontend uses Socket.IO to communicate with the backend:

**Client → Server:**
- `create:game` - Host creates new game
- `join:game` - Player joins game
- `start:game` - Host starts game
- `next:question` - Host advances to next question
- `submit:answer` - Player submits answer
- `show:results` - Host reveals results

**Server → Client:**
- `game:created` - Game creation confirmation
- `player:joined` - Player list update
- `game:started` - Game begins
- `question:started` - New question
- `answer:submitted` - Player answered notification
- `results:question` - Question results
- `game:finished` - Final scores
- `error` - Error messages

## Configuration

### Vite Config

The vite.config.ts is configured for:
- Vue 3 plugin
- Dev server on port 5173
- Host mode enabled for network access

### TypeScript Config

TypeScript is configured with:
- Strict mode enabled
- Vue 3 JSX support
- Path aliases available

## Notes

- No backend code modification required
- Clean, minimal design (no animations in Phase 2)
- All WebSocket events match backend implementation
- Component lifecycle properly manages event listeners
