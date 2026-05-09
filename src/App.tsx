import React from 'react';
import { PasswordGate } from './components/PasswordGate';
import { MainView } from './components/MainView';
import { useStore } from './hooks/useStore';

export default function App() {
  const store = useStore();

  if (!store.state.isAuthenticated) {
    return <PasswordGate onLogin={store.login} />;
  }

  return <MainView store={store} />;
}

