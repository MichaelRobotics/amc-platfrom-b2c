import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@amc-platfrom/shared-contexts';

/**
 * A client-side route guard.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - The component to render if the user is authorized.
 * @param {string} props.product - The specific product claim required to access this route.
 */
export const ProtectedRoute = ({ children, product }) => {
  const { user, claims, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // While checking auth state, show a loading indicator or a blank page.
    // This prevents a flash of the login page before the user session is loaded.
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  const hasAccess = user && claims && claims.products && claims.products[product];

  if (!hasAccess) {
    // User is not authorized. Redirect them to the main landing page.
    // We also pass the original location they tried to access,
    // which could be used to show a message like "You need to subscribe to access this page."
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // User is authorized, render the child components.
  return children;
};
