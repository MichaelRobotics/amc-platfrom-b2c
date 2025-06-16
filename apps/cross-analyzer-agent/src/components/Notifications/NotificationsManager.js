/**
 * @fileoverview A global component that listens for Firestore notifications
 * in real-time and displays them as toasts.
 *
 * REFACTORED FOR MONOREPO:
 * - Imports the 'db' instance from the shared 'packages/firebase-helpers/client'.
 * - Imports and uses the shared 'useAuth' hook to identify the current user.
 * - The Firestore query is now securely scoped to only fetch notifications
 * belonging to the currently logged-in user.
 */
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';

// Import shared services and contexts
import { db } from 'packages/firebase-helpers/client';
import { useAuth } from 'platform-shell/src/contexts/AuthContext';

import Toast from '../UI/Toast';

const NotificationsManager = ({ onNavigateToDashboard }) => {
    const [notifications, setNotifications] = useState([]);
    const { currentUser } = useAuth(); // Get the current user from the global context

    useEffect(() => {
        // If there's no user logged in, do nothing.
        if (!currentUser) {
            setNotifications([]); // Clear any existing notifications on logout
            return;
        }

        // This query is now secure and multi-tenant. It fetches documents from the
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
                setNotifications(prev => [...prev, ...newNotifications]);
            }
        });

        // Cleanup the listener when the component unmounts or the user changes
        return () => unsubscribe();

    }, [currentUser]); // The effect re-runs whenever the user logs in or out.

    const handleToastClose = (notificationId) => {
        const notifRef = doc(db, "notifications", notificationId);
        updateDoc(notifRef, {
            read: true
        });
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    };
    
    const handleToastClick = (notification) => {
        if(notification.analysisId && onNavigateToDashboard) {
            onNavigateToDashboard({
                mode: 'monitor_status',
                analysisId: notification.analysisId,
                analysisName: notification.message.split('"')[1] || "Analysis"
            });
        }
        handleToastClose(notification.id);
    };

    return (
        <div className="notification-container">
            {notifications.map((notif) => (
                <div key={notif.id} onClick={() => handleToastClick(notif)}>
                    <Toast
                        message={notif.message}
                        type="success"
                        duration={10000}
                        onClose={() => handleToastClose(notif.id)}
                    />
                </div>
            ))}
        </div>
    );
};

export default NotificationsManager;