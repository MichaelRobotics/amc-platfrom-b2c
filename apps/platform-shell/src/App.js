// apps/platform-shell/src/App.js

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Assuming your bundler is configured for these workspace paths
import { AuthProvider, useAuth } from '@amc-platfrom/shared-contexts';
import { SharedNavBar, LoginModal } from '@amc-platfrom/shared-components';

// Re-import the MainLayout to ensure consistent page structure
import MainLayout from './components/layout/MainLayout';
import WelcomePage from './pages/WelcomePage';
import AgentLeanAILandingPage from './pages/AgentLeanAILandingPage';

// Import the main stylesheet
import './index.css';

const AppContent = () => {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  
  // Get all necessary values and functions from the authentication context
  const {
    user,
    claims,
    loading,
    login,
    logout,
    mfaRequired,
    mfaHint,
    resolveMfa,
  } = useAuth();

  // State to hold error messages for the modal
  const [loginError, setLoginError] = useState(null);
  const [mfaError, setMfaError] = useState(null);

  // This function handles the login submission
  const handleLoginSubmit = async (email, password) => {
    setLoginError(null); // Clear previous errors
    const result = await login(email, password); // Call the login function from context
    
    if (result.success) {
      setLoginModalOpen(false); // On success, close the modal
    } else if (!result.mfa) {
      // If it fails for a reason other than MFA, show an error
      setLoginError(result.error || "Logowanie nie powiodło się.");
    }
    // If result.mfa is true, do nothing, as the modal will switch to the MFA view
  };

  // This function handles the MFA code submission
  const handleMfaSubmit = async (mfaCode) => {
    setMfaError(null);
    const result = await resolveMfa(mfaCode);
    
    if (result.success) {
      setLoginModalOpen(false); // On success, close the modal
    } else {
      setMfaError(result.error || "Nieprawidłowy kod weryfikacyjny.");
    }
  };

  return (
    <>
      <SharedNavBar
        user={user}
        claims={claims}
        onLogin={() => setLoginModalOpen(true)}
        onLogout={logout}
      />
      
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSubmit={handleLoginSubmit} // Use the handler function
        onMfaSubmit={handleMfaSubmit}     // Use the handler function
        isMfa={mfaRequired}
        mfaHint={mfaHint}
        loginError={loginError}
        mfaError={mfaError}
        isLoading={loading}
      />

      {/* The Routes now render inside the MainLayout for consistent UI */}
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<WelcomePage />} />
          <Route path="products/agent-lean-ai" element={<AgentLeanAILandingPage />} />
        </Route>
      </Routes>
    </>
  );
};


// The top-level App component provides the Router and AuthProvider
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;