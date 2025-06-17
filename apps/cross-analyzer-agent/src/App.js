import React, { useState } from 'react';
import { ToastProvider } from './contexts/ToastContext';
import { AnalysisProvider } from './contexts/AnalysisContext';
import NotificationsManager from './components/Notifications/NotificationsManager';
import Dashboard from './components/Dashboard/Dashboard';
import MainMenuCrossAnalyzer from './components/MainMenu/MainMenuCrossAnalyzer';

/**
 * This is the root component for the Cross Analyzer application.
 * It manages the primary view (main menu or dashboard) and provides
 * the necessary context providers for the rest of the app.
 * It is designed to be lazy-loaded by the platform-shell.
 */
function App() {
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
}

export default App;