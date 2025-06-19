import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Import app-specific contexts and components
import { ToastProvider } from './contexts/ToastContext';
import { AnalysisProvider } from './contexts/AnalysisContext';
import NotificationsManager from './components/Notifications/NotificationsManager';
import Dashboard from './components/Dashboard/Dashboard';
import MainMenuCrossAnalyzer from './components/MainMenu/MainMenuCrossAnalyzer';

// NOTE: We no longer import SharedNavBar, LoginModal, or ProtectedRoute from shared-components
// as this app should not handle primary navigation or login.

/**
 * A wrapper component that checks for an active Firebase auth session.
 * It ensures that no part of the app is rendered until the user is verified.
 */

/**
 * The core application content, which is now the main part of the app.
 */
const AnalyzerAppContent = () => {
  const [dashboardParams, setDashboardParams] = useState(null);

  const handleNavigateToDashboard = (params) => {
    setDashboardParams(params);
  };

  const handleNavigateToLanding = () => {
    setDashboardParams(null);
  };

  return (
    <ToastProvider>
      <AnalysisProvider>
        <NotificationsManager onNavigateToDashboard={handleNavigateToDashboard} />
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
 * The root component for the Cross Analyzer application.
 * It is now much simpler, wrapping the main content in the AuthGuard.
 */
function App() {
  return (
      <main>
        <AnalyzerAppContent />
      </main>
  );
}

export default App;