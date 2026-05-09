import React, { useState } from 'react';
import { Plus, Trash2, Trophy, Crosshair, Users, ChevronDown, ChevronUp, Edit2, Check, X } from 'lucide-react';
import { Game, Team } from '../types';
import { useStore } from '../hooks/useStore';
import { formatTime, parseTime } from '../lib/time';

interface GameCardProps {
  key?: React.Key;
  game: Game;
  store: ReturnType<typeof useStore>;
}

export function GameCard({ game, store }: GameCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeInput, setTimeInput] = useState('');

  const isCurrentChallenge = store.state.currentChallengeId === game.id;

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeamName.trim()) {
      store.addTeam(game.id, newTeamName.trim());
      setNewTeamName('');
    }
  };

  const handleEditTimeClick = () => {
    setTimeInput(formatTime(game.completionTime || 0));
    setIsEditingTime(true);
  };

  const handleSaveTime = () => {
    store.updateGameTime(game.id, parseTime(timeInput));
    setIsEditingTime(false);
  };

  return (
    <div className={`bg-sleek-panel border rounded-sm transition-all duration-300 ${
      game.isCompleted ? 'border-[#152e1c]' : isCurrentChallenge ? 'border-[#39ff1433]' : 'border-sleek-border hover:border-sleek-border-hover'
    }`}>
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <h3 className={`text-sm font-bold uppercase tracking-wider ${game.isCompleted ? 'text-gray-400 line-through' : isCurrentChallenge ? 'text-sleek-accent' : 'text-gray-300'}`}>
              {game.name}
            </h3>
            <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
              <Users size={12} /> {game.teams.length}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {isCurrentChallenge && !game.isCompleted && <span className="text-[10px] font-black text-black bg-sleek-accent px-2 py-0.5 rounded-sm">ACTIVE</span>}
            {game.isCompleted && <span className="text-[10px] font-black text-white bg-blue-600 px-2 py-0.5 rounded-sm">COMPLETED</span>}
            {expanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-4 pt-0 border-t border-sleek-border mt-2">
          
          {game.isCompleted && (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#152e1c] p-4 border border-[#39ff1433] rounded-sm mb-4 mt-4 gap-4">
              <div>
                <span className="text-[10px] font-bold text-sleek-accent uppercase tracking-widest">Clear Time</span>
                {isEditingTime ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={timeInput}
                      onChange={e => setTimeInput(e.target.value)}
                      className="bg-black border border-sleek-accent text-white font-mono text-xl px-2 w-32 outline-none py-1"
                      autoFocus
                    />
                    <button onClick={handleSaveTime} className="text-sleek-accent hover:opacity-80 transition-opacity"><Check size={20}/></button>
                    <button onClick={() => setIsEditingTime(false)} className="text-gray-400 hover:text-white transition-opacity"><X size={20}/></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mt-1 group/time cursor-pointer" onClick={handleEditTimeClick}>
                    <span className="font-mono text-2xl font-black text-white">{formatTime(game.completionTime || 0)}</span>
                    <Edit2 size={14} className="text-gray-500 opacity-0 group-hover/time:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
              <button 
                onClick={() => store.reopenGame(game.id)} 
                className="text-[10px] uppercase font-bold border border-[#444] hover:bg-sleek-border px-3 py-2 rounded-sm transition-colors text-white"
              >
                Reopen Challenge
              </button>
            </div>
          )}

          <div className="flex justify-between items-center py-4">
            {!game.isCompleted && (
              <button
                onClick={() => store.setCurrentChallenge(isCurrentChallenge ? null : game.id)}
                className={`font-mono text-[10px] px-3 py-1 border rounded-sm transition-colors uppercase font-bold ${
                  isCurrentChallenge 
                    ? 'bg-sleek-border text-white border-[#444] hover:bg-sleek-border-hover'
                    : 'bg-sleek-accent text-black border-sleek-accent hover:opacity-90'
                }`}
              >
                {isCurrentChallenge ? 'Remove from Challenge' : 'Set as Current Challenge'}
              </button>
            )}
            
            {(game.isCompleted) && <div></div> /* empty flex spacer */}

            <button
              onClick={() => store.removeGame(game.id)}
              className="text-gray-500 hover:text-sleek-fail transition-colors flex items-center gap-1 font-mono text-[10px] uppercase"
            >
              <Trash2 size={12} /> Delete Game
            </button>
          </div>

          <div className="space-y-4">
            {game.teams.map((team, index) => (
              <div key={team.id} className="bg-sleek-card border border-sleek-border rounded-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <span className="text-4xl font-black">{String(index + 1).padStart(2, '0')}</span>
                </div>
                
                <div className="flex flex-col z-10 w-full md:w-auto">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm tracking-widest uppercase text-blue-400">{team.name}</span>
                    <button 
                      onClick={() => store.removeTeam(game.id, team.id)}
                      className="md:hidden text-gray-500 hover:text-sleek-fail"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 justify-between md:justify-end z-10">
                  {/* Wins */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-mono text-[10px] uppercase text-gray-500 tracking-widest">Wins</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => store.updateTeamStat(game.id, team.id, 'wins', -1)}
                        className="py-1 px-2 hover:bg-sleek-border-hover text-gray-400 font-mono text-xs border border-transparent hover:border-[#444] rounded-sm transition-colors"
                      >-</button>
                      <span className="font-mono font-black text-4xl min-w-[3rem] text-center">{team.wins}</span>
                      <button 
                        onClick={() => store.updateTeamStat(game.id, team.id, 'wins', 1)}
                        className="py-1 px-2 bg-sleek-border hover:bg-sleek-border-hover border border-[#444] text-xs font-bold text-white rounded-sm transition-colors"
                      >+</button>
                    </div>
                  </div>

                  {/* Tries */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-mono text-[10px] uppercase text-gray-500 tracking-widest">Tries</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => store.updateTeamStat(game.id, team.id, 'tries', -1)}
                        className="py-1 px-2 hover:bg-sleek-border-hover text-gray-400 font-mono text-xs border border-transparent hover:border-[#444] rounded-sm transition-colors"
                      >-</button>
                      <span className="font-mono font-black text-4xl min-w-[3rem] text-center">{team.tries}</span>
                      <button 
                        onClick={() => store.updateTeamStat(game.id, team.id, 'tries', 1)}
                        className="py-1 px-2 bg-sleek-border hover:bg-sleek-border-hover border border-[#444] text-xs font-bold text-white rounded-sm transition-colors"
                      >+</button>
                    </div>
                  </div>

                  <button 
                    onClick={() => store.removeTeam(game.id, team.id)}
                    className="hidden md:block text-gray-500 hover:text-sleek-fail ml-4"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            <form onSubmit={handleAddTeam} className="flex gap-2 mt-4 relative">
              <input 
                type="text" 
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
                placeholder="ADD TEAM / SPLIT..."
                className="flex-1 bg-sleek-card border border-sleek-border text-white text-xs p-3 rounded-sm focus:outline-none focus:border-sleek-border-hover"
              />
              <button type="submit" className="bg-sleek-border hover:bg-sleek-border-hover border border-[#444] text-white px-4 py-2 rounded-sm transition-colors flex items-center justify-center">
                <Plus size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
