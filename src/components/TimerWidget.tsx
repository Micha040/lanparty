import React, { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { Edit2, Check } from 'lucide-react';
import { formatTime, parseTime } from '../lib/time';

export function TimerWidget({ store }: { store: ReturnType<typeof useStore> }) {
  const { state, toggleTimer, resetTimer, stopTimer, setTimerElapsed } = store;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (state.timerIsRunning) {
      interval = setInterval(() => {
        setTick(t => t + 1);
      }, 500); // 500ms for smoother visual updates
    }
    return () => clearInterval(interval);
  }, [state.timerIsRunning]);

  const handleEditClick = () => {
    stopTimer();
    setEditValue(formatTime(store.getRenderTimerElapsed()));
    setIsEditing(true);
  };

  const handleSaveTime = () => {
    setTimerElapsed(parseTime(editValue));
    setIsEditing(false);
  };

  const handleComplete = () => {
    if (!state.currentChallengeId) return;
    store.stopTimer();
    store.completeGame(state.currentChallengeId, store.getRenderTimerElapsed());
    store.resetTimer();
  };

  const currentChallenge = state.games.find(g => g.id === state.currentChallengeId);
  const isTimerDisabled = !state.currentChallengeId;
  const currentElapsed = store.getRenderTimerElapsed();

  return (
    <div className="bg-sleek-panel border border-[#39ff1433] rounded-lg p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4">
        <span className="text-[80px] font-black text-white opacity-5 leading-none">01</span>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start relative z-10 gap-6">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-sleek-accent uppercase">
            {currentChallenge ? currentChallenge.name : 'NO ACTIVE CHALLENGE'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Current Challenge Context: Global Timer
          </p>
        </div>

        <div className="text-right flex flex-col items-end w-full md:w-auto">
          <p className="text-xs text-gray-500 uppercase mb-1">Timer</p>
          
          <div className="flex items-center gap-4 mb-4">
            {isEditing ? (
              <div className="flex items-center gap-2 text-left">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="bg-sleek-panel border border-sleek-accent text-4xl sm:text-5xl font-mono font-bold text-white w-48 px-2 outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveTime}
                  className="p-2 bg-sleek-accent text-black rounded-sm hover:opacity-90"
                >
                  <Check size={24} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group/edit cursor-pointer" onClick={handleEditClick}>
                <p className="text-5xl font-mono font-bold text-white">
                  {formatTime(currentElapsed)}
                </p>
                <div className="opacity-0 group-hover/edit:opacity-100 transition-opacity text-gray-500 hover:text-white">
                  <Edit2 size={24} />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 w-full">
            <button
              onClick={toggleTimer}
              disabled={isTimerDisabled}
              className={`flex-1 py-2 font-bold text-xs uppercase transition-colors ${
                isTimerDisabled 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border-transparent'
                  : state.timerIsRunning 
                    ? 'bg-[#ff3939] text-white hover:bg-red-600 border-transparent'
                    : 'bg-sleek-accent text-black hover:opacity-90 border-transparent'
              }`}
            >
              {state.timerIsRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={handleComplete}
              disabled={isTimerDisabled}
              className={`flex-1 py-2 font-bold text-xs transition-colors uppercase border ${
                isTimerDisabled
                  ? 'bg-transparent border-[#444] text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 border-transparent text-white'
              }`}
            >
              Complete
            </button>
            <button
              onClick={resetTimer}
              disabled={isTimerDisabled}
              className={`px-4 py-2 text-xs font-bold transition-colors uppercase border ${
                isTimerDisabled
                  ? 'bg-transparent border-[#333] text-gray-600 cursor-not-allowed'
                  : 'bg-sleek-border hover:bg-sleek-border-hover border-[#444] text-white'
              }`}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
