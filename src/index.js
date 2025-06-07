import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AnalysisProvider } from './contexts/AnalysisContext';

// --- START: Firebase Initialization ---
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration, taken from your project settings.
const firebaseConfig = {
  apiKey: "AIzaSyCK_Tjf3QYeKoY-EOaFXcoxlmUwz4WdOP4",
  authDomain: "cross-analyzer-gcp.firebaseapp.com",
  projectId: "cross-analyzer-gcp",
  storageBucket: "cross-analyzer-gcp.firebasestorage.app",
  messagingSenderId: "622141963650",
  appId: "1:622141963650:web:d1ee674d372487ed19e39b",
  measurementId: "G-ELF00TTLKW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Analytics (optional, but good practice)
const analytics = getAnalytics(app);
// --- END: Firebase Initialization ---


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AnalysisProvider>
      <App />
    </AnalysisProvider>
  </React.StrictMode>
);