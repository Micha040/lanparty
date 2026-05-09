import React, { useState } from 'react';
import { Lock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface PasswordGateProps {
  onLogin: (password: string) => boolean;
}

export function PasswordGate({ onLogin }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shakes, setShakes] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(password);
    if (!success) {
      setError('ZUGRIFF VERWEIGERT');
      setPassword('');
      setShakes(s => s + 1);
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <motion.div 
        animate={{ x: [0, -10, 10, -10, 10, 0] }}
        key={shakes}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-sleek-panel border border-sleek-border rounded-lg p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring" }}
            className="w-16 h-16 bg-sleek-accent flex items-center justify-center mb-4 rounded-sm"
          >
            <Lock className="w-8 h-8 text-black" />
          </motion.div>
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-bold tracking-tighter text-white mt-2"
          >
            WIN_CHALLENGE // LAN_EDITION
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 mt-2 font-mono text-[10px] tracking-widest uppercase"
          >
            System locked
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ChevronRight className="h-5 w-5 text-sleek-accent" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ENTER PASSWORD..."
              className={`block w-full pl-10 pr-3 py-3 border transition-colors bg-sleek-bg text-white font-mono rounded-sm outline-none focus:ring-0 ${
                error ? 'border-sleek-fail text-sleek-fail placeholder:text-sleek-fail/50' : 'border-sleek-border focus:border-sleek-border-hover'
              }`}
              autoFocus
            />
          </div>
          
          <div className="h-6 flex items-center justify-center">
            {error && <p className="text-sleek-fail font-mono text-xs uppercase animate-pulse">{error}</p>}
          </div>
          
          <button
            type="submit"
            className="w-full flex items-center justify-center py-3 px-4 bg-sleek-border hover:bg-sleek-border-hover border border-[#444] text-white rounded-sm transition-colors font-mono font-bold uppercase text-xs"
          >
            Authenticate
          </button>
        </form>
      </motion.div>
    </div>
  );
}
