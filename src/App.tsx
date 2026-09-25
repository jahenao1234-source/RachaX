import React from 'react';
import { HabitProvider } from './store/HabitContext';
import { ThemeProvider } from './store/ThemeContext';
import { CuentaProvider } from './store/CuentaContext';
import { AppShell } from './components/layout/AppShell';

export default function App() {
  return (
    <ThemeProvider>
      <CuentaProvider>
        <HabitProvider>
          <AppShell />
        </HabitProvider>
      </CuentaProvider>
    </ThemeProvider>
  );
}

