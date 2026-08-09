import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

// Fonts are bundled rather than fetched from Google Fonts, so an offline first
// load still renders Arabic in the proper Naskh face instead of falling back to
// a system serif. Only the subsets and weights actually used are imported:
// Scheherazade New carries the Arabic, Lora the Latin/Bengali UI text.
import '@fontsource/scheherazade-new/arabic-400.css';
import '@fontsource/scheherazade-new/arabic-700.css';
import '@fontsource/lora/latin-400.css';
import '@fontsource/lora/latin-400-italic.css';
import '@fontsource/lora/latin-600.css';
import '@fontsource/lora/latin-700.css';

import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
