import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import shell components and contexts
import SharedNavBar from './components/layout/SharedNavBar';
import WelcomePage from './pages/WelcomePage';
import AgentLeanAILandingPage from './pages/AgentLeanAILandingPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy load the heavy cross-analyzer app for better initial page load.
// This uses the workspace name defined in the root package.json.
// Note: This assumes cross-analyzer-gcp's App.js is its default export.
const CrossAnalyzerApp = lazy(() => import('cross-analyzer-gcp/src/App'));

/**
 * The root component of the platform-shell. It defines all top-level routes.
 */
function App() {
  return (
    <Router>
      {/* SharedNavBar is outside the Routes to be present on all pages */}
      <SharedNavBar />
      
      {/* Suspense handles the loading state of lazy-loaded components */}
      <main>
        <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '100px', fontSize: '2rem' }}>Loading Application...</div>}>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/products/agent-lean-ai" element={<AgentLeanAILandingPage />} />
            
            {/* --- Protected Application Routes --- */}
            {/* Any route matching /app/analyzer/* will be handled by the CrossAnalyzerApp */}
            <Route 
              path="/app/analyzer/*" 
              element={
                <ProtectedRoute productKey="cross-analyzer-gcp">
                  <CrossAnalyzerApp />
                </ProtectedRoute>
              } 
            />

            {/* --- "Dumb" Redirects for this phase --- */}
            <Route path="/my-account" element={<div>My Account Page (Placeholder)</div>} />
            <Route path="/admin" element={<div>Admin Panel (Placeholder)</div>} />


            {/* A catch-all route to redirect unknown paths to the homepage */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </Router>
  );
}

export default App;