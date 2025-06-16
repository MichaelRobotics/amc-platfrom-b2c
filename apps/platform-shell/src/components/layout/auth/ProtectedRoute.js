import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * A component to protect routes that require authentication and, optionally,
 * specific product ownership claims.
 * @param {{
 * children: React.ReactNode;
 * productKey?: string; // e.g., 'cross-analyzer-gcp'
 * adminOnly?: boolean;
 * }} props
 */
const ProtectedRoute = ({ children, productKey, adminOnly = false }) => {
    const { currentUser, idTokenResult, loading } = useAuth();
    const location = useLocation();

    // If the auth state is still loading from Firebase, show a placeholder.
    // This prevents redirecting the user before their session is confirmed.
    if (loading) {
        return <div>Loading session...</div>; // Or a full-page spinner component
    }

    // If no user is logged in after the check, redirect to the homepage.
    // We can save the location they were trying to access to redirect them back after login.
    if (!currentUser) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    const claims = idTokenResult?.claims || {};
    const isAdmin = claims.admin === true;

    // If the route is for admins only and the user is not an admin, redirect.
    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    // If a product key is specified (e.g., for accessing a specific app), check for ownership.
    if (productKey) {
        const hasProduct = claims.products?.[productKey] === true;
        
        // Grant access if the user is an admin (who can access everything) or owns the specific product.
        if (isAdmin || hasProduct) {
            return children;
        } else {
            // If the user is logged in but doesn't own the product, redirect them to the
            // marketing page for that product so they can learn about it or purchase it.
            return <Navigate to={`/products/${productKey}`} replace />;
        }
    }
    
    // If the route is not admin-only and doesn't require a specific product key,
    // just being logged in is enough to grant access.
    return children;
};

export default ProtectedRoute;
