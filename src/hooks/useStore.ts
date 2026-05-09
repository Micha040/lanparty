import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Game, Team } from '../types';

const defaultState: AppState = {
  isAuthenticated: false,
  games: [],
  currentChallengeId: null,
  timerElapsed: 0,
  timerIsRunning: false,
  lastTimerUpdate: null,
};

export function useStore() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('lanChallengeAuth');
    return { ...defaultState, isAuthenticated: saved === 'true' };
  });

  const isInternalUpdate = useRef(false);

  // Sync state with local storage for auth
  useEffect(() => {
    localStorage.setItem('lanChallengeAuth', String(state.isAuthenticated));
  }, [state.isAuthenticated]);

  // Server-Sent Events setup
  useEffect(() => {
    const eventSource = new EventSource('/api/state');
    eventSource.onmessage = (e) => {
      try {
        const serverState = JSON.parse(e.data);
        isInternalUpdate.current = true;
        setState((prev) => ({
          ...prev, // Keep local auth state
          games: serverState.games || [],
          currentChallengeId: serverState.currentChallengeId || null,
          timerElapsed: serverState.timerElapsed || 0,
          timerIsRunning: serverState.timerIsRunning || false,
          lastTimerUpdate: serverState.lastTimerUpdate || null,
        }));
      } catch (err) {
        console.error('Failed to parse SSE data', err);
      }
    };
    return () => eventSource.close();
  }, []);

  const setSyncedState = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      const { isAuthenticated, ...syncState } = next;
      // Fire and forget
      fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syncState),
      }).catch(console.error);
      return next;
    });
  }, []);

  const login = useCallback((password: string) => {
    if (password === 'Arschfick123') { // Required by previous rules
      setState((prev) => ({ ...prev, isAuthenticated: true }));
      return true;
    }
    return false;
  }, []);

  const addGame = useCallback((name: string) => {
    setSyncedState((prev) => ({
      ...prev,
      games: [
        ...prev.games,
        {
          id: crypto.randomUUID(),
          name,
          teams: [{ id: crypto.randomUUID(), name: 'Main Team', wins: 0, tries: 0 }],
        },
      ],
    }));
  }, [setSyncedState]);

  const removeGame = useCallback((id: string) => {
    setSyncedState((prev) => ({
      ...prev,
      games: prev.games.filter((g) => g.id !== id),
      currentChallengeId: prev.currentChallengeId === id ? null : prev.currentChallengeId,
    }));
  }, [setSyncedState]);

  const addTeam = useCallback((gameId: string, teamName: string) => {
    setSyncedState((prev) => ({
      ...prev,
      games: prev.games.map((g) =>
        g.id === gameId
          ? {
              ...g,
              teams: [...g.teams, { id: crypto.randomUUID(), name: teamName, wins: 0, tries: 0 }],
            }
          : g
      ),
    }));
  }, [setSyncedState]);

  const removeTeam = useCallback((gameId: string, teamId: string) => {
    setSyncedState((prev) => ({
      ...prev,
      games: prev.games.map((g) =>
        g.id === gameId
          ? {
              ...g,
              teams: g.teams.filter((t) => t.id !== teamId),
            }
          : g
      ),
    }));
  }, [setSyncedState]);

  const updateTeamStat = useCallback(
    (gameId: string, teamId: string, stat: 'wins' | 'tries', delta: number) => {
      setSyncedState((prev) => ({
        ...prev,
        games: prev.games.map((g) => {
          if (g.id !== gameId) return g;
          return {
            ...g,
            teams: g.teams.map((t) => {
              if (t.id !== teamId) return t;
              return {
                ...t,
                [stat]: Math.max(0, t[stat] + delta),
              };
            }),
          };
        }),
      }));
    },
    [setSyncedState]
  );

  const toggleTimer = useCallback(() => {
    setSyncedState((prev) => ({
      ...prev,
      timerIsRunning: !prev.timerIsRunning,
      lastTimerUpdate: !prev.timerIsRunning ? Date.now() : null,
    }));
  }, [setSyncedState]);

  const stopTimer = useCallback(() => {
    setSyncedState((prev) => ({
      ...prev,
      // If stopping timer, accurately record final elapsed time
      timerElapsed: prev.timerIsRunning && prev.lastTimerUpdate 
        ? prev.timerElapsed + (Date.now() - prev.lastTimerUpdate) / 1000 
        : prev.timerElapsed,
      timerIsRunning: false,
      lastTimerUpdate: null,
    }));
  }, [setSyncedState]);

  const setTimerElapsed = useCallback((seconds: number) => {
    setSyncedState((prev) => ({
      ...prev,
      timerElapsed: Math.max(0, seconds),
      lastTimerUpdate: prev.timerIsRunning ? Date.now() : null,
    }));
  }, [setSyncedState]);

  const resetTimer = useCallback(() => {
    setSyncedState((prev) => ({
      ...prev,
      timerElapsed: 0,
      timerIsRunning: false,
      lastTimerUpdate: null,
    }));
  }, [setSyncedState]);

  const setCurrentChallenge = useCallback((gameId: string | null) => {
    setSyncedState((prev) => ({
      ...prev,
      currentChallengeId: gameId,
    }));
  }, [setSyncedState]);

  const completeGame = useCallback((gameId: string, timeSeconds: number) => {
    setSyncedState((prev) => ({
      ...prev,
      games: prev.games.map((g) =>
        g.id === gameId ? { ...g, isCompleted: true, completionTime: timeSeconds } : g
      ),
      currentChallengeId: prev.currentChallengeId === gameId ? null : prev.currentChallengeId,
    }));
  }, [setSyncedState]);

  const updateGameTime = useCallback((gameId: string, timeSeconds: number) => {
    setSyncedState((prev) => ({
      ...prev,
      games: prev.games.map((g) =>
        g.id === gameId ? { ...g, completionTime: timeSeconds } : g
      ),
    }));
  }, [setSyncedState]);

  const reopenGame = useCallback((gameId: string) => {
    setSyncedState((prev) => ({
      ...prev,
      games: prev.games.map((g) =>
        g.id === gameId ? { ...g, isCompleted: false, completionTime: undefined } : g
      ),
    }));
  }, [setSyncedState]);

  // Derived state for the actual running timer based on last update timestamp
  const getRenderTimerElapsed = () => {
    if (state.timerIsRunning && state.lastTimerUpdate) {
      return state.timerElapsed + (Date.now() - state.lastTimerUpdate) / 1000;
    }
    return state.timerElapsed;
  };

  return {
    state,
    getRenderTimerElapsed,
    login,
    addGame,
    removeGame,
    addTeam,
    removeTeam,
    updateTeamStat,
    toggleTimer,
    stopTimer,
    setTimerElapsed,
    resetTimer,
    setCurrentChallenge,
    completeGame,
    updateGameTime,
    reopenGame,
  };
}
