import {StrictMode, Suspense, lazy} from 'react';
import {createRoot} from 'react-dom/client';
import '@fontsource/barlow/400.css';
import '@fontsource/barlow/500.css';
import '@fontsource/barlow/600.css';
import '@fontsource/barlow/700.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import App from './App.tsx';
import './index.css';

try {
  const temaViejo = localStorage.getItem('racha_tema');
  if (temaViejo) {
    if (temaViejo === 'esmeralda') {
      localStorage.setItem('racha_acento', 'jade');
    } else if (temaViejo === 'rosa') {
      localStorage.setItem('racha_acento', 'rosa');
    } else {
      localStorage.setItem('racha_acento', 'ambar');
    }
    localStorage.removeItem('racha_tema');
  }
} catch (e) {}

const PanelApp = lazy(() => import('./panel/PanelApp'));
const isPanel = window.location.pathname === '/panel' || window.location.pathname.startsWith('/panel/');

if (isPanel) {
  document.title = 'Panel de pagos · Racha';
} else if ('serviceWorker' in navigator) {
  // El que recibe los avisos (public/sw.js). No guarda nada en caché.
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isPanel ? (
      <Suspense fallback={null}>
        <PanelApp />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
