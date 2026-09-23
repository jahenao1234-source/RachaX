import {StrictMode} from 'react';
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
