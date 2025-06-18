import React, { useState } from 'react'; // <-- Import useState
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '@amc-platfrom/shared-contexts';
import { SharedNavBar, LoginModal } from '@amc-platfrom/shared-components';
import './index.css';
import WelcomePage from './pages/WelcomePage';
import AgentLeanAILandingPage from './pages/AgentLeanAILandingPage';

const AppContent = () => {
  // Move the modal state management here, inside the component.
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  const {
    user,
    claims,
    logout,
    mfaResolver,
    isMfa,
    isLoading,
    loginError,
    mfaError,
    login,
    resolveMfa,
  } = useAuth();

  return (
    <div className="App">
      <SharedNavBar
        user={user}
        claims={claims}
        onLogin={() => setLoginModalOpen(true)} // This will now work correctly
        onLogout={logout}
      />
      
      <LoginModal
        isOpen={isLoginModalOpen} // This will now work correctly
        onClose={() => setLoginModalOpen(false)} // This will now work correctly
        onLoginSubmit={login}
        onMfaSubmit={resolveMfa}
        mfaHint={mfaResolver?.hints[0]?.phoneNumber}
        loginError={loginError}
        mfaError={mfaError}
        isLoading={isLoading}
        isMfa={isMfa}
      />

      <main>
        <Routes>
          <Route index element={<WelcomePage />} />
          <Route path="products/agent-lean-ai" element={<AgentLeanAILandingPage />} />
        </Routes>
      </main>
    </div>
  );
};

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