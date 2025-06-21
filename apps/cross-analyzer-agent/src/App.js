import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

// Re-import shared components and contexts needed for this architecture
import { AuthProvider, useAuth } from '@amc-platfrom/shared-contexts';
import { SharedNavBar, LoginModal } from '@amc-platfrom/shared-components';

// App-specific contexts and components
import { ToastProvider } from './contexts/ToastContext';
import { AnalysisProvider } from './contexts/AnalysisContext';
import NotificationsManager from './components/Notifications/NotificationsManager';
import Dashboard from './components/Dashboard/Dashboard';
import MainMenuCrossAnalyzer from './components/MainMenu/MainMenuCrossAnalyzer';

/**
 * This component now acts as the application's gatekeeper.
 * Because it's a child of AuthProvider, it can use the reliable `loading`
 * state from the context to prevent premature redirects.
 */
const AppWithAuthCheck = () => {
    const { user, loading } = useAuth();

    // While the AuthProvider is confirming the session, show a loading indicator.
    // This uses the context's loading state, which waits for the initial check to complete.
    if (loading) {
        return <div style={{ textAlign: 'center', paddingTop: '5rem' }}>Loading User Session...</div>;
    }

    // If the definitive state after loading is "no user", redirect back to the shell.

    // If we're here, the user is loaded and authenticated. Render the app's main content.
    return <AppContent />;
};

/**
 * This layout component includes the shared navigation bar.
 */
const MainLayout = ({ onLoginClick, onLogout }) => {
    const { user, claims } = useAuth();
    const shellUrl = 'https://amc-platform-b2c.web.app';

    return (
        <>
            <SharedNavBar 
                user={user} 
                claims={claims} 
                onLogin={onLoginClick} 
                onLogout={onLogout}
                shellUrl={shellUrl}
            />
            <Outlet />
        </>
    );
};

/**
 * This component contains the main UI and logic of the application.
 * It now safely assumes that a `user` object is always present because AppWithAuthCheck has verified it.
 */
const AppContent = () => {
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const { login, mfaRequired, mfaHint, resolveMfa, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [loginError, setLoginError] = useState(null);
    const [mfaError, setMfaError] = useState(null);
    
    const handleLoginSubmit = async (email, password) => {
        setLoginError(null);
        const result = await login(email, password);
        if (result.success) {
            setLoginModalOpen(false);
        } else if (!result.mfa) {
            setLoginError(result.error || 'Login failed.');
        }
    };
    
    const handleMfaSubmit = async (mfaCode) => {
        setMfaError(null);
        const result = await resolveMfa(mfaCode);
        if (result.success) {
            setLoginModalOpen(false);
        } else {
            setMfaError(result.error || 'Invalid MFA code.');
        }
    };

    const handleLogout = async () => {
        const auth = getAuth();
        // After signing out, the onAuthStateChanged listener in AuthProvider will update,
        // which will cause AppWithAuthCheck to trigger the redirect.
        await signOut(auth); 
    };
    
    const handleNavigateToDashboard = (params) => {
        navigate(`/dashboard/${params.analysisId}`);
    };

    const handleNavigateToLanding = () => {
        navigate('/');
    };

    return (
        <>
            <LoginModal 
                isOpen={isLoginModalOpen} 
                onClose={() => setLoginModalOpen(false)}
                onLoginSubmit={handleLoginSubmit}
                onMfaSubmit={handleMfaSubmit}
                isMfa={mfaRequired}
                mfaHint={mfaHint}
                loginError={loginError}
                mfaError={mfaError}
                isLoading={authLoading}
            />
            
            <NotificationsManager onNavigateToDashboard={handleNavigateToDashboard} />
            
            <main>
                <Routes>
                    <Route path="/dashboard/:analysisId" element={
                        <Dashboard onNavigateToLanding={handleNavigateToLanding} />
                    } />
                    <Route element={<MainLayout onLoginClick={() => setLoginModalOpen(true)} onLogout={handleLogout} />}>
                        <Route path="/" element={<MainMenuCrossAnalyzer onStartAnalysis={handleNavigateToDashboard} />} />
                    </Route>
                </Routes>
            </main>
        </>
    );
}

/**
 * The root component for the Cross Analyzer application.
 * It now wraps the entire logic in the necessary providers.
 */
function App() {
  return (
    // All providers are at the top level. The gatekeeper is now inside.
    <AuthProvider>
      <ToastProvider>
        <AnalysisProvider>
          <Router>
            {/* The new gatekeeper component that uses the AuthProvider's state */}
            <AppWithAuthCheck />
          </Router>
        </AnalysisProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
