import React, { useState } from 'react';
import { TimerWidget } from './TimerWidget';
import { GameCard } from './GameCard';
import { useStore } from '../hooks/useStore';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface MainViewProps {
  store: ReturnType<typeof useStore>;
}

export function MainView({ store }: MainViewProps) {
  const [newGameName, setNewGameName] = useState('');

  const handleAddGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGameName.trim()) {
      store.addGame(newGameName.trim());
      setNewGameName('');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto space-y-8 relative">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row justify-between items-center gap-4 p-6 border border-sleek-border bg-sleek-header rounded-sm"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-sleek-accent flex items-center justify-center rounded-sm">
            <span className="text-black font-black text-2xl">W</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter text-white">WIN_CHALLENGE // LAN_EDITION</h1>
            <p className="text-[10px] text-sleek-accent font-mono uppercase">Access: Arschfick123 // Authenticated</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <div className="w-2 h-2 rounded-sm bg-sleek-accent animate-pulse"></div>
          SYSTEM ONLINE
        </div>
      </motion.header>

      {/* Timer Section */}
      <motion.section 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <TimerWidget store={store} />
      </motion.section>

      {/* Games List */}
      <motion.section 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-end border-b border-sleek-border pb-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Mission Log
          </h2>
          <span className="font-mono text-[10px] text-sleek-accent">
            {store.state.games.length} GAMES TRACKED
          </span>
        </div>

        <form onSubmit={handleAddGame} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={newGameName}
              onChange={(e) => setNewGameName(e.target.value)}
              placeholder="INITIALIZE NEW GAME..."
              className="w-full bg-sleek-panel border border-sleek-border text-gray-300 text-sm p-4 rounded-sm focus:outline-none focus:border-sleek-border-hover transition-colors"
            />
          </div>
          <button 
            type="submit"
            className="px-6 bg-sleek-border border border-[#444] text-white text-[10px] uppercase rounded-sm flex items-center justify-center hover:bg-sleek-border-hover transition-colors font-bold"
          >
            + ADD GAME
          </button>
        </form>

        <div className="mt-8 space-y-8 pb-20">
          <div>
            <h3 className="text-xs font-bold text-gray-500 mb-4 tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sleek-accent"></span> Scheduled / Active ({store.state.games.filter(g => !g.isCompleted).length})
            </h3>
            <div className="grid gap-4">
              {store.state.games.filter(g => !g.isCompleted).length === 0 ? (
                <div className="text-center py-8 border border-dashed border-sleek-border rounded-sm">
                  <p className="text-gray-500 font-mono tracking-widest uppercase text-xs">No active games or challenges.</p>
                </div>
              ) : (
                store.state.games.filter(g => !g.isCompleted).map((game) => (
                  <GameCard key={game.id} game={game} store={store} />
                ))
              )}
            </div>
          </div>

          {store.state.games.filter(g => g.isCompleted).length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-4 tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Completed ({store.state.games.filter(g => g.isCompleted).length})
              </h3>
              <div className="grid gap-4 opacity-80 hover:opacity-100 transition-opacity">
                {store.state.games.filter(g => g.isCompleted).map((game) => (
                  <GameCard key={game.id} game={game} store={store} />
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
}
