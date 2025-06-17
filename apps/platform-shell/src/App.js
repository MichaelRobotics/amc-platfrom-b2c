import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@amc-platfrom/shared-contexts';

// Layout Components
import SharedNavBar from './components/layout/SharedNavBar';
import MainLayout from './components/layout/MainLayout';
import LoginModal from './components/layout/auth/LoginModal';
import ProtectedRoute from './components/layout/auth/ProtectedRoute'; 

// Page Components
import WelcomePage from './pages/WelcomePage';
import AgentLeanAILandingPage from './pages/AgentLeanAILandingPage';

// FIX: The import path now correctly points to the App.js file inside the package's src directory.
const CrossAnalyzerApp = React.lazy(() => import('cross-analyzer-agent/src/App'));

function App() {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <SharedNavBar onLoginClick={() => setLoginModalOpen(true)} />
          <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
          <main>
            <Routes>
              {/* Public routes with the main layout */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<WelcomePage />} />
                <Route path="products/agent-lean-ai" element={<AgentLeanAILandingPage />} />
              </Route>

              {/* Protected route for the analyzer application */}
              <Route
                path="/app/analyzer/*"
                element={
                  <ProtectedRoute product="cross-analyzer-gcp">
                    <React.Suspense fallback={<div className="flex justify-center items-center h-screen">Loading Analyzer...</div>}>
                      <CrossAnalyzerApp />
                    </React.Suspense>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
