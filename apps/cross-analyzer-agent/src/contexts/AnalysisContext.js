/**
 * @fileoverview A React context to provide a real-time list of a user's analyses.
 * This version is corrected to work with the shared AuthContext.
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

// Import shared services and contexts from the monorepo structure
import { firestore as db } from '@amc-platfrom/firebase-helpers';
import { useAuth } from '@amc-platfrom/shared-contexts';

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
    
    // --- FIX: Destructure 'user' instead of 'currentUser' ---
    // The useAuth() hook provides a 'user' object from the AuthContext.
    const { user } = useAuth(); 

    useEffect(() => {
        // This effect now depends on the 'user' object from the auth context.
        
        // If there's no user logged in, or if the user object is still loading from the parent
        // provider, we clear any existing data and stop. This is a critical safety check.
        if (!user) {
            setUserCreatedAnalyses([]);
            setIsLoadingAnalyses(false);
            return;
        }

        setIsLoadingAnalyses(true);

        // The query is now safe because we know the 'user' object exists.
        // It fetches documents from the 'analyses' collection ONLY where the 
        // 'userId' field matches the logged-in user's UID.
        const q = query(
            collection(db, "analyses"),
            where("userId", "==", user.uid), // Use the 'user' object here
            orderBy("createdAt", "desc")    // Show newest analyses first
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const analyses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUserCreatedAnalyses(analyses);
            setIsLoadingAnalyses(false);
        }, (error) => {
            console.error("Error fetching user analyses:", error);
            setIsLoadingAnalyses(false);
        });

        // Cleanup the listener when the component unmounts or the user object changes
        return () => unsubscribe();

    }, [user]); // The effect re-runs whenever the user logs in, logs out, or the session is established.

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