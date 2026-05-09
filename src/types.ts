export interface Team {
  id: string;
  name: string;
  wins: number;
  tries: number;
}

export interface Game {
  id: string;
  name: string;
  teams: Team[];
  isCompleted?: boolean;
  completionTime?: number;
}

export interface AppState {
  isAuthenticated: boolean;
  games: Game[];
  currentChallengeId: string | null;
  timerElapsed: number;
  timerIsRunning: boolean;
  lastTimerUpdate: number | null;
}
