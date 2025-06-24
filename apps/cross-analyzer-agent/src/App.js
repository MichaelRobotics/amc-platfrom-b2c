import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useNavigate } from 'react-router-dom';
// BEFORE: import { getAuth, signOut } from 'firebase/auth';
// AFTER: Import only the signOut function
import { signOut } from 'firebase/auth'; 
import { Toaster } from 'react-hot-toast';

// Re-import shared components and contexts needed for this architecture
import { AuthProvider, useAuth } from '@amc-platfrom/shared-contexts';
import { SharedNavBar, LoginModal } from '@amc-platfrom/shared-components';
// AFTER: Import the configured auth instance from our shared helper
import { auth } from '@amc-platfrom/firebase-helpers';

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

    if (loading) {
        return <div style={{ textAlign: 'center', paddingTop: '5rem' }}>Loading User Session...</div>;
    }

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
        // BEFORE: const auth = getAuth();
        // AFTER: We now use the single, correctly-configured auth instance
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
                {/* This new route handles the generic dashboard view */}
                <Route path="/dashboard" element={
                    <Dashboard onNavigateToLanding={handleNavigateToLanding} />
                } />
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
 */
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg-modal)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            },
            success: {
              iconTheme: {
                primary: '#22C55E',
                secondary: 'var(--text-primary)',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: 'var(--text-primary)',
              },
            },
          }}
        />
        <AnalysisProvider>
          <Router>
            <AppWithAuthCheck />
          </Router>
        </AnalysisProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;