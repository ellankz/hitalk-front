import { io, Socket } from 'socket.io-client';
import type {
  CreateGamePayload,
  JoinGamePayload,
  SubmitAnswerPayload,
  GameCreatedResponse,
  PlayerJoinedResponse,
  GameStartedResponse,
  QuestionStartedResponse,
  AnswerSubmittedResponse,
  QuestionResultsResponse,
  GameFinishedResponse,
  ErrorResponse,
} from '../types/game.types';

class SocketService {
  private socket: Socket | null = null;
  private readonly serverUrl = 'https://hitalk-back.onrender.com';

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(this.serverUrl, {
      transports: ['polling', 'websocket'], // Try polling first, upgrade to websocket
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      upgrade: true, // Allow transport upgrade
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to server:', this.socket?.id);
      console.log('Transport:', this.socket?.io.engine.transport.name);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server. Reason:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Connection error:', error.message);
      console.error('Error details:', error);
    });

    this.socket.io.on('reconnect_attempt', () => {
      console.log('🔄 Attempting to reconnect...');
    });

    this.socket.io.on('reconnect', (attemptNumber) => {
      console.log('✅ Reconnected after', attemptNumber, 'attempts');
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Client -> Server events
  createGame(payload: CreateGamePayload): void {
    this.socket?.emit('create:game', payload);
  }

  joinGame(payload: JoinGamePayload): void {
    this.socket?.emit('join:game', payload);
  }

  startGame(gameId: string): void {
    this.socket?.emit('start:game', { gameId });
  }

  nextQuestion(gameId: string): void {
    this.socket?.emit('next:question', { gameId });
  }

  submitAnswer(payload: SubmitAnswerPayload): void {
    this.socket?.emit('submit:answer', payload);
  }

  showResults(gameId: string): void {
    this.socket?.emit('show:results', { gameId });
  }

  // Server -> Client event listeners
  onGameCreated(callback: (data: GameCreatedResponse) => void): void {
    this.socket?.on('game:created', callback);
  }

  onPlayerJoined(callback: (data: PlayerJoinedResponse) => void): void {
    this.socket?.on('player:joined', callback);
  }

  onGameStarted(callback: (data: GameStartedResponse) => void): void {
    this.socket?.on('game:started', callback);
  }

  onQuestionStarted(callback: (data: QuestionStartedResponse) => void): void {
    this.socket?.on('question:started', callback);
  }

  onAnswerSubmitted(callback: (data: AnswerSubmittedResponse) => void): void {
    this.socket?.on('answer:submitted', callback);
  }

  onQuestionResults(callback: (data: QuestionResultsResponse) => void): void {
    this.socket?.on('results:question', callback);
  }

  onGameFinished(callback: (data: GameFinishedResponse) => void): void {
    this.socket?.on('game:finished', callback);
  }

  onError(callback: (data: ErrorResponse) => void): void {
    this.socket?.on('error', callback);
  }

  // Remove listeners
  offGameCreated(callback?: (data: GameCreatedResponse) => void): void {
    this.socket?.off('game:created', callback);
  }

  offPlayerJoined(callback?: (data: PlayerJoinedResponse) => void): void {
    this.socket?.off('player:joined', callback);
  }

  offGameStarted(callback?: (data: GameStartedResponse) => void): void {
    this.socket?.off('game:started', callback);
  }

  offQuestionStarted(callback?: (data: QuestionStartedResponse) => void): void {
    this.socket?.off('question:started', callback);
  }

  offAnswerSubmitted(callback?: (data: AnswerSubmittedResponse) => void): void {
    this.socket?.off('answer:submitted', callback);
  }

  offQuestionResults(callback?: (data: QuestionResultsResponse) => void): void {
    this.socket?.off('results:question', callback);
  }

  offGameFinished(callback?: (data: GameFinishedResponse) => void): void {
    this.socket?.off('game:finished', callback);
  }

  offError(callback?: (data: ErrorResponse) => void): void {
    this.socket?.off('error', callback);
  }

  get socketId(): string | undefined {
    return this.socket?.id;
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
