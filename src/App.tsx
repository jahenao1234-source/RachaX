import React from 'react';
import { HabitProvider } from './store/HabitContext';
import { ThemeProvider } from './store/ThemeContext';
import { AppShell } from './components/layout/AppShell';

export default function App() {
  return (
    <ThemeProvider>
      <HabitProvider>
        <AppShell />
      </HabitProvider>
    </ThemeProvider>
  );
}

