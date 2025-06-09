/**
 * @fileoverview A global component that listens for Firestore notifications
 * in real-time and displays them as toasts.
 *
 * CORRECTED: Removed the faulty `getFirebaseApp()` call that was causing the runtime error.
 */
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { firestore as db } from '../../services/firebase'; // Importing 'db' is enough
import Toast from '../UI/Toast';

const NotificationsManager = ({ onNavigateToDashboard }) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // The call to getFirebaseApp() has been removed.
        // The act of importing 'db' from our central firebase.js file ensures
        // that Firebase is initialized before this code runs.

        // Query for notifications that are not yet read.
        const q = query(collection(db, "notifications"), where("read", "==", false));

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

        return () => unsubscribe();
    }, []); // Empty dependency array ensures this runs once.

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