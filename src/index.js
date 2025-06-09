import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AnalysisProvider } from './contexts/AnalysisContext';

// Import the new Firebase service file to ensure it's initialized on startup.
import './services/firebase';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AnalysisProvider>
      <App />
    </AnalysisProvider>
  </React.StrictMode>
);
