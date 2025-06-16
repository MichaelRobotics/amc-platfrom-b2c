/**
 * @fileoverview The main application component for cross-analyzer-gcp.
 * Updated for monorepo:
 * - Uses React Router (`Routes`, `Route`) for internal navigation.
 * - The `platform-shell`'s master router will direct all '/app/analyzer/*' traffic here.
 */
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import MainMenuCrossAnalyzer from './components/MainMenu/MainMenuCrossAnalyzer';
import Dashboard from './components/Dashboard/Dashboard';
import NotificationsManager from './components/Notifications/NotificationsManager';
import { AnalysisProvider } from './contexts/AnalysisContext';

function App() {
    const navigate = useNavigate();

    // The navigation functions are now simpler, just using the navigate hook.
    const handleNavigateToDashboard = (params) => {
        // We pass state through the router's navigate function
        navigate(`workspace/${params.analysisId}`, { state: { topicId: params.topicId } });
    };

    const handleNavigateToLanding = () => {
        navigate(``); // Navigate to the base of this app's routes
    };

    return (
        // The AnalysisProvider now wraps the router to provide context to all routes.
        <AnalysisProvider>
            {/* NotificationsManager is always active */}
            <NotificationsManager onNavigateToDashboard={handleNavigateToDashboard} />

            <Routes>
                {/* The main menu is the default route for this app */}
                <Route 
                    index 
                    element={<MainMenuCrossAnalyzer onNavigateToDashboard={handleNavigateToDashboard} />} 
                />

                {/* The dashboard workspace is a dynamic route */}
                <Route 
                    path="workspace/:analysisId" 
                    element={<Dashboard onNavigateToLanding={handleNavigateToLanding} />} 
                />
            </Routes>
        </AnalysisProvider>
    );
}

export default App;
