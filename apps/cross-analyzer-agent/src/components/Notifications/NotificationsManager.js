/**
 * @fileoverview A global component that listens for Firestore notifications
 * in real-time and displays them as toasts. It is multi-tenant and secure.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';

// Import shared services and contexts
import { firestore as db } from '@amc-platfrom/firebase-helpers';
import { useAuth } from '@amc-platfrom/shared-contexts';

import Toast from '../UI/Toast'; // Uses your original Toast component

const NotificationsManager = ({ onNavigateToDashboard }) => {
    const [notifications, setNotifications] = useState([]);
    const { currentUser } = useAuth(); // Get the current user from the global context

    useEffect(() => {
        // If there's no user logged in, do nothing.
        if (!currentUser) {
            setNotifications([]); // Clear any existing notifications on logout
            return;
        }

        // This query is secure and multi-tenant. It fetches documents from the
        // 'notifications' collection ONLY where the 'userId' field matches the
        // logged-in user's UID and the notification hasn't been read.
        const q = query(
            collection(db, "notifications"), 
            where("userId", "==", currentUser.uid), 
            where("read", "==", false)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newNotifications = [];
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    newNotifications.push({ id: change.doc.id, ...change.doc.data() });
                }
            });

            if (newNotifications.length > 0) {
                // Using a functional update to avoid stale state issues
                setNotifications(prev => [...prev, ...newNotifications]);
            }
        });

        // Cleanup the listener when the component unmounts or the user changes
        return () => unsubscribe();

    }, [currentUser]); // The effect re-runs whenever the user logs in or out.

    // FIX: Wrapped in useCallback to create a stable function reference for the dependency array.
    const handleToastClose = useCallback((notificationId) => {
        const notifRef = doc(db, "notifications", notificationId);
        updateDoc(notifRef, {
            read: true
        }).catch(err => console.error("Failed to mark notification as read:", err));
        
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }, []);
    
    // FIX: Wrapped in useCallback for stability and to include it in other hooks if needed.
    const handleToastClick = useCallback((notification) => {
        if (notification.analysisId && onNavigateToDashboard) {
            onNavigateToDashboard({
                mode: 'monitor_status',
                analysisId: notification.analysisId,
                analysisName: notification.message.split('"')[1] || "Analysis"
            });
        }
        handleToastClose(notification.id);
    }, [onNavigateToDashboard, handleToastClose]);

    // Use the container style from your original component
    const containerStyle = {
        position: 'fixed',
        top: '80px', // Positioned below the main navbar
        right: '20px',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
    };

    return (
        <div style={containerStyle}>
            {notifications.map((notif) => (
                <div key={notif.id} onClick={() => handleToastClick(notif)}>
                    <Toast
                        message={notif.message}
                        type={notif.type || "info"} // Fallback to 'info' if type is not specified
                        duration={10000}
                        onClose={() => handleToastClose(notif.id)}
                    />
                </div>
            ))}
        </div>
    );
};

export default NotificationsManager;