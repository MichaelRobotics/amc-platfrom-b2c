/**
 * @fileoverview The main application component.
 * It manages the view (Landing Page vs. Dashboard) and now includes
 * the global NotificationsManager.
 */
import React, { useState, useCallback } from 'react';
import NewLandingPage from './components/MainMenu/MainMenuCrossAnalyzer';
import Dashboard from './components/Dashboard/Dashboard';
import NotificationsManager from './components/Notifications/NotificationsManager'; // Import the new component
import { AnalysisProvider } from './contexts/AnalysisContext';

function App() {
    const [currentView, setCurrentView] = useState('landing'); // 'landing' or 'dashboard'
    const [dashboardParams, setDashboardParams] = useState(null);

    const handleNavigateToDashboard = useCallback((params) => {
        setDashboardParams(params);
        setCurrentView('dashboard');
    }, []);

    const handleNavigateToLanding = useCallback(() => {
        setDashboardParams(null);
        setCurrentView('landing');
    }, []);

    return (
        <AnalysisProvider>
            {/* The NotificationsManager sits here, outside the view logic, so it's always active. */}
            <NotificationsManager onNavigateToDashboard={handleNavigateToDashboard} />

            {currentView === 'landing' && (
                <NewLandingPage onNavigateToDashboard={handleNavigateToDashboard} />
            )}
            {currentView === 'dashboard' && (
                <Dashboard
                    params={dashboardParams}
                    onNavigateToLanding={handleNavigateToLanding}
                />
            )}
        </AnalysisProvider>
    );
}

export default App;