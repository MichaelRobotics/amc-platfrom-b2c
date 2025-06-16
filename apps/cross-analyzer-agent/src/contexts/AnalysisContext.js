/**
 * @fileoverview A React context to provide a real-time list of a user's analyses.
 * FULLY REFACTORED FOR MONOREPO:
 * - Imports 'firestore' from the shared 'packages/firebase-helpers/client'.
 * - Imports and uses the 'useAuth' hook from 'platform-shell'.
 * - The Firestore query is now securely scoped to only fetch analyses belonging
 * to the currently logged-in user, preventing data leaks.
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

// Import shared services and contexts from the monorepo structure
import { firestore as db } from 'packages/firebase-helpers/client';
import { useAuth } from 'platform-shell/src/contexts/AuthContext';

const AnalysisContext = createContext();

/**
 * Custom hook to easily access the analysis context.
 * e.g., const { userCreatedAnalyses, isLoadingAnalyses } = useAnalysisContext();
 */
export const useAnalysisContext = () => {
    return useContext(AnalysisContext);
};

/**
 * The AnalysisProvider component wraps parts of the application that need access
 * to the list of the user's analyses.
 * @param {{ children: React.ReactNode }} props
 */
export const AnalysisProvider = ({ children }) => {
    const [userCreatedAnalyses, setUserCreatedAnalyses] = useState([]);
    const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(true);
    const { currentUser } = useAuth(); // Get the current user from the global context

    useEffect(() => {
        // If there's no user logged in, clear any existing data and stop.
        if (!currentUser) {
            setUserCreatedAnalyses([]);
            setIsLoadingAnalyses(false);
            return;
        }

        setIsLoadingAnalyses(true);

        // This query is now SECURE. It fetches documents from the 'analyses' collection
        // ONLY where the 'userId' field matches the logged-in user's UID.
        // It also sorts them by creation date.
        const q = query(
            collection(db, "analyses"),
            where("userId", "==", currentUser.uid),
            orderBy("createdAt", "desc") // Show newest analyses first
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const analyses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUserCreatedAnalyses(analyses);
            setIsLoadingAnalyses(false);
        }, (error) => {
            console.error("Error fetching user analyses:", error);
            setIsLoadingAnalyses(false);
            // Optionally set an error state here
        });

        // Cleanup the listener when the component unmounts or the user logs out
        return () => unsubscribe();

    }, [currentUser]); // The effect re-runs whenever the user logs in or out.

    // The value object is passed down to all children of this provider.
    const value = {
        userCreatedAnalyses,
        isLoadingAnalyses,
    };

    return (
        <AnalysisContext.Provider value={value}>
            {children}
        </AnalysisContext.Provider>
    );
};