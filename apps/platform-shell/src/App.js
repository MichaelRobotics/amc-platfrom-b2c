import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import SharedNavBar from './components/layout/SharedNavBar';
import ProtectedRoute from './components/layout/auth/ProtectedRoute';
import WelcomePage from './pages/WelcomePage';
import AgentLeanAILandingPage from './pages/AgentLeanAILandingPage';
import { LayoutContext } from './contexts/LayoutContext'; // Corrected import

const CrossAnalyzerApp = lazy(() => import('cross-analyzer-agent/App'));

function App() {
  const { isNavBarVisible } = useContext(LayoutContext); // Corrected usage

  return (
    <div className="platform-shell">
      {isNavBarVisible && <SharedNavBar />}
      <main>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/agent-lean-ai" element={<AgentLeanAILandingPage />} />
          <Route
            path="/app/analyzer/*"
            element={
              <ProtectedRoute productKey="agent-lean-ai">
                <Suspense fallback={<div>Loading Cross Analyzer...</div>}>
                  <CrossAnalyzerApp />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
