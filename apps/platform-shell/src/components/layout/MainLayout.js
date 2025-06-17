import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * MainLayout provides a consistent structure for public-facing pages.
 * It renders the content of the nested routes (e.g., WelcomePage) 
 * via the Outlet component from react-router-dom.
 * This ensures that components like the SharedNavBar, which are defined
 * in App.js, are present on all pages that use this layout.
 */
const MainLayout = () => {
  return (
    <div>
      {/* The Outlet component renders the matched child route's component. */}
      {/* For the path "/", it will render WelcomePage. */}
      {/* For "/products/agent-lean-ai", it will render AgentLeanAILandingPage. */}
      <Outlet />
    </div>
  );
};

export default MainLayout;