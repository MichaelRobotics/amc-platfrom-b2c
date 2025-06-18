import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '@amc-platfrom/shared-contexts';
import { SharedNavBar, LoginModal } from '@amc-platfrom/shared-components';

// Import the application's main stylesheet which contains all necessary styles.
import './index.css';

// Page Components
import WelcomePage from './pages/WelcomePage';
import AgentLeanAILandingPage from './pages/AgentLeanAILandingPage';

/**
 * AppContent is the main layout component. It's wrapped by the AuthProvider,
 * so it has access to the full authentication context. It renders the shared
 * navbar and modal, and manages the routing for the pages.
 */
const AppContent = () => {
  // Destructure all necessary values and functions from the real authentication context.
  const {
    user,
    claims,
    logout, // Function to sign the user out.
    isLoginModalOpen,
    setLoginModalOpen, // State setter to control the login modal's visibility.
    mfaResolver,
    isMfa,
    isLoading,
    loginError,
    mfaError,
    handleLoginSubmit, // Function to handle the username/password form submission.
    handleMfaSubmit,   // Function to handle the MFA code submission.
  } = useAuth();

  return (
    <div className="App">
      {/* The SharedNavBar receives the user state and functions to trigger login and logout. */}
      <SharedNavBar
        user={user}
        claims={claims}
        onLogin={() => setLoginModalOpen(true)} // This now correctly opens the modal.
        onLogout={logout}
      />
      
      {/* The LoginModal is controlled entirely by the state from AuthContext. */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSubmit={handleLoginSubmit}
        onMfaSubmit={handleMfaSubmit}
        mfaHint={mfaResolver?.hints[0]?.phoneNumber}
        loginError={loginError}
        mfaError={mfaError}
        isLoading={isLoading}
        isMfa={isMfa}
      />

      {/* The main content area where different pages will be rendered based on the route. */}
      <main>
        <Routes>
          <Route index element={<WelcomePage />} />
          <Route path="products/agent-lean-ai" element={<AgentLeanAILandingPage />} />
          {/* Add other application routes here */}
        </Routes>
      </main>
    </div>
  );
};

/**
 * The root App component. Its only role is to set up the Router
 * and the main AuthProvider, which makes the authentication context
 * available to all child components.
 */
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
