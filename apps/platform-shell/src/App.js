import React, { useContext } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import SharedNavBar from './components/layout/SharedNavBar';
import ProtectedRoute from './components/layout/auth/ProtectedRoute';
import WelcomePage from './pages/WelcomePage';
import AgentLeanAILandingPage from './pages/AgentLeanAILandingPage';

// The Cross Analyzer application is integrated after platform-shell build,
// so we don't import its components directly here. Its routing will be handled
// by the hosting configuration after the build output is copied.

function App() {
  const location = useLocation();

  // Determine if the SharedNavBar should be visible.
  // This logic should be based on platform-shell's own routes/state, not
  // directly tied to cross-analyzer-agent paths as the component is not loaded here.
  // Assuming navbar is generally visible on platform-shell pages:
  const isNavBarVisible = true; // Placeholder - refine based on actual platform-shell design needs

  return (
    <div className="platform-shell">
      {isNavBarVisible && <SharedNavBar />}
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<WelcomePage />} />
          <Route path="/agent-lean-ai" element={<AgentLeanAILandingPage />} />

           {/* 
             Since the analyzer route is handled by hosting, we might need a fallback
             or a different approach if the user navigates to /app/analyzer directly
             within the client-side routing context of platform-shell before the 
             cross-analyzer-agent app takes over. 
             For now, we'll leave it out as per the apparent build/deploy strategy.
           */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
