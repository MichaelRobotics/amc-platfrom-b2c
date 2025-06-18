import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import shared contexts and components
import { AuthProvider } from '@amc-platfrom/shared-contexts';
import { SharedNavBar, LoginModal, ProtectedRoute } from '@amc-platfrom/shared-components';

// Import shared styles
import '@amc-platfrom/shared-components/dist/styles.css';

// Import app-specific contexts and components
import { ToastProvider } from './contexts/ToastContext';
import { AnalysisProvider } from './contexts/AnalysisContext';
import NotificationsManager from './components/Notifications/NotificationsManager';
import Dashboard from './components/Dashboard/Dashboard';
import MainMenuCrossAnalyzer from './components/MainMenu/MainMenuCrossAnalyzer';

/**
 * A wrapper component containing the core logic of the analyzer app.
 * This is the part that will be protected by the ProtectedRoute.
 */
const AnalyzerAppContent = () => {
  // This state determines whether to show the main menu or a specific analysis dashboard.
  const [dashboardParams, setDashboardParams] = useState(null);

  // This function is passed to child components (like MainMenu) to allow them
  // to trigger navigation to the dashboard view.
  const handleNavigateToDashboard = (params) => {
    setDashboardParams(params);
  };

  // This function allows the Dashboard to navigate back to the main menu.
  const handleNavigateToLanding = () => {
    setDashboardParams(null);
  };

  return (
    // The providers make toast notifications and analysis data available to all child components.
    <ToastProvider>
      <AnalysisProvider>
        {/* NotificationsManager is always active to listen for backend events. */}
        <NotificationsManager onNavigateToDashboard={handleNavigateToDashboard} />

        {/* Conditionally render the Dashboard or the Main Menu based on state */}
        {dashboardParams ? (
          <Dashboard 
            key={dashboardParams.analysisId || 'dashboard'} 
            params={dashboardParams} 
            onNavigateToLanding={handleNavigateToLanding} 
          />
        ) : (
          <MainMenuCrossAnalyzer onStartAnalysis={handleNavigateToDashboard} />
        )}
      </AnalysisProvider>
    </ToastProvider>
  );
};


/**
 * This is the root component for the Cross Analyzer application.
 * It integrates the shared navigation and auth components and uses
 * ProtectedRoute to guard the application's content.
 */
function App() {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  return (
    <AuthProvider>
      {/* The Router's basename is set to "/analyzer" so that all routes inside this app 
        are relative to that path. This is crucial for correct hosting as a micro-frontend.
      */}
      <Router basename="/app/agentLeanAI">
        <SharedNavBar onLoginClick={() => setLoginModalOpen(true)} />
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
        
        <main>
          <Routes>
            <Route
              path="/*" // This will match all sub-routes, e.g., /app/agentLeanAI/dashboard
              element={
                // The ProtectedRoute component guards access.
                // It will only render its children if the user is logged in AND
                // has the 'agentLeanAI' claim in their token.
                <ProtectedRoute product="agentLeanAI">
                  <AnalyzerAppContent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;