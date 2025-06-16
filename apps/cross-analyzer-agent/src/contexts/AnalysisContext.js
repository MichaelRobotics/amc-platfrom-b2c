/**
 * @fileoverview React Context for managing and providing a real-time list
 * of a user's created analyses.
 * This version is updated for the monorepo architecture.
 * - It uses the shared `useAuth` hook to get the current user's ID.
 * - The Firestore query is now filtered to only fetch documents belonging to that user.
 */
import React, { useState, useEffect, createContext, useContext } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
// Import the shared Firestore instance
import { db } from 'packages/firebase-helpers/client';
// Import the shared Auth hook to identify the current user
import { useAuth } from 'platform-shell/src/contexts/AuthContext';

const AnalysisContext = createContext();

export const useAnalysisContext = () => {
    const context = useContext(AnalysisContext);
    if (context === undefined) {
        throw new Error('useAnalysisContext must be used within an AnalysisProvider');
    }
    return context;
};

export const AnalysisProvider = ({ children }) => {
    const { currentUser } = useAuth(); // Get the current user from the global context
    const [userCreatedAnalyses, setUserCreatedAnalyses] = useState([]);
    const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(true);
    const [fetchAnalysesError, setFetchAnalysesError] = useState(null);

    useEffect(() => {
        // Only attempt to fetch data if there is a logged-in user.
        if (!currentUser) {
            setIsLoadingAnalyses(false);
            setUserCreatedAnalyses([]); // Clear analyses on logout
            return;
        }

        console.log(`[AnalysisContext] Setting up listener for user: ${currentUser.uid}`);
        
        // Create a query that filters the 'analyses' collection by the current user's ID.
        const q = query(
            collection(db, "analyses"), 
            where("ownerId", "==", currentUser.uid), 
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const analyses = [];
            querySnapshot.forEach((doc) => {
                analyses.push({ id: doc.id, ...doc.data() });
            });
            setUserCreatedAnalyses(analyses);
            setIsLoadingAnalyses(false);
            setFetchAnalysesError(null);
        }, (error) => {
            console.error("Error listening to user's analyses collection:", error);
            setFetchAnalysesError("An error occurred while fetching your analyses.");
            setIsLoadingAnalyses(false);
        });

        // Cleanup: Unsubscribe from the listener when the component unmounts or the user changes.
        return () => {
            console.log("[AnalysisContext] Tearing down listener.");
            unsubscribe();
        };
    }, [currentUser]); // The effect re-runs if the user logs in or out.

    const contextValue = {
        userCreatedAnalyses,
        isLoadingAnalyses,
        fetchAnalysesError,
    };

    return (
        <AnalysisContext.Provider value={contextValue}>
            {children}
        </AnalysisContext.Provider>
    );
};