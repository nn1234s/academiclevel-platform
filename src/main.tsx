import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './core/auth/AuthContext';
import { LanguageProvider } from './core/i18n/LanguageContext';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>
);
