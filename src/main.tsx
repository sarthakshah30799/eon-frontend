import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

const THEME_STORAGE_KEY = 'maraekat_theme';

const storedTheme =
  window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';

document.documentElement.dataset.theme = storedTheme;
document.documentElement.style.colorScheme = storedTheme;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
