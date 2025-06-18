import React, { useState } from 'react';
    import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
    import { AuthProvider } from '@amc-platfrom/shared-contexts';
    import { SharedNavBar, LoginModal } from '@amc-platfrom/shared-components';
    
    // Import the shared stylesheet
    import '@amc-platfrom/shared-components/dist/styles.css';
    
    // Layout Components
    import MainLayout from './components/layout/MainLayout';
    // The local ProtectedRoute import is no longer needed here.
    
    // Page Components
    import WelcomePage from './pages/WelcomePage';
    import AgentLeanAILandingPage from './pages/AgentLeanAILandingPage';
    
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
                    {/* Add other public product pages here */}
                  </Route>
                </Routes>
              </main>
            </div>
          </Router>
        </AuthProvider>
      );
    }
    
    export default App;
    