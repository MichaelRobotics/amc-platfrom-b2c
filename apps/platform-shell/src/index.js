import React from 'react';
import ReactDOM from 'react-dom/client';
// Import the global stylesheet
import './index.css'; 
// Import the main App component (the master router)
import App from './App';
// Import the AuthProvider to wrap the entire application
import { AuthProvider } from './contexts/AuthContext';

// Get the root DOM element from the single public/index.html file
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application
root.render(
  <React.StrictMode>
    {/* AuthProvider must wrap App so that every component inside App, 
      including the router and all pages, has access to the authentication context.
    */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
