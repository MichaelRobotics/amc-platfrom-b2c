import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from "firebase/auth";
// Import from the installed package directly using its name
import { auth } from '@amc-platfrom/firebase-helpers';

// Create and EXPORT the context object. This is the fix.
export const AuthContext = createContext(undefined);

/**
 * Custom hook to easily access the auth context in any component.
 * e.g., const { currentUser } = useAuth();
 */
export const useAuth = () => {
    return useContext(AuthContext);
};

/**
 * The AuthProvider component wraps the application and provides auth state.
 * It listens to real-time authentication changes from Firebase.
 * @param {{ children: React.ReactNode }} props
 */
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [idTokenResult, setIdTokenResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // onAuthStateChanged is the core Firebase listener for auth state.
        // It returns an unsubscribe function to prevent memory leaks.
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            
            if (user) {
                try {
                    // When a user is found, force a refresh of their ID token.
                    // This is CRITICAL to get the latest custom claims (like `admin` or product ownership)
                    // that may have been set by a backend function.
                    const tokenResult = await user.getIdTokenResult(true);
                    setIdTokenResult(tokenResult);
                } catch (error) {
                    console.error("Error fetching user token with claims:", error);
                    // If fetching the token fails, treat the user as logged out.
                    setIdTokenResult(null);
                }
            } else {
                // No user, clear the token result.
                setIdTokenResult(null);
            }
            
            // Set loading to false once the initial auth check is complete.
            setLoading(false);
        });

        // Cleanup: Unsubscribe from the listener when the component unmounts.
        return unsubscribe;
    }, []);

    // The value object is passed down to all children of this provider.
    const value = {
        currentUser,
        idTokenResult,
        loading,
    };

    // We don't render children until the initial auth check is done.
    // This prevents a "flash" of a logged-out state for a logged-in user.
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
