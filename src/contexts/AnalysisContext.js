/**
 * @fileoverview React Context for managing and providing a real-time list
 * of all user-created analyses.
 * This version uses a real-time Firestore listener and has no internal
 * Firebase initialization calls.
 */
import React, { useState, useEffect, createContext, useContext } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { firestore as db } from '../services/firebase';

// Create the context
const AnalysisContext = createContext();

// Create the provider component
export const AnalysisProvider = ({ children }) => {
    const [userCreatedAnalyses, setUserCreatedAnalyses] = useState([]);
    const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(true);
    const [fetchAnalysesError, setFetchAnalysesError] = useState(null);

    useEffect(() => {
        console.log("[AnalysisContext] Setting up real-time listener for 'analyses' collection.");

        const q = query(collection(db, "analyses"), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const analyses = [];
            querySnapshot.forEach((doc) => {
                analyses.push({ id: doc.id, ...doc.data() });
            });
            setUserCreatedAnalyses(analyses);
            setIsLoadingAnalyses(false);
            setFetchAnalysesError(null);
        }, (error) => {
            console.error("Error listening to analyses collection:", error);
            setFetchAnalysesError(error.message || "An error occurred while listening for analyses.");
            setIsLoadingAnalyses(false);
            setUserCreatedAnalyses([]);
        });

        return () => {
            console.log("[AnalysisContext] Tearing down real-time listener.");
            unsubscribe();
        };
    }, []);

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

// Custom hook to easily consume the AnalysisContext
export const useAnalysisContext = () => {
    const context = useContext(AnalysisContext);
    if (context === undefined) {
        throw new Error('useAnalysisContext must be used within an AnalysisProvider');
    }
    return context;
};