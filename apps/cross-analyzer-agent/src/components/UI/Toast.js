/**
 * @fileoverview A reusable Toast notification component.
 * Displays a message with an icon and a close button.
 */
import React, { useEffect, useState, useCallback } from 'react';

const Toast = ({ message, type = 'success', duration = 5000, onClose }) => {
    const [visible, setVisible] = useState(false);

    // FIX: useCallback is used to create a stable function reference for handleClose.
    const handleClose = useCallback(() => {
        setVisible(false);
        // Allow time for fade-out animation before calling the parent's onClose
        setTimeout(() => {
            onClose();
        }, 300); // This duration should match the CSS transition
    }, [onClose]);

    // Effect for fade-in and setting the auto-close timer
    useEffect(() => {
        // Fade in
        setVisible(true);

        // Auto-close timer
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    // FIX: Added handleClose and duration to the dependency array to satisfy exhaustive-deps.
    }, [duration, handleClose]);
    
    // --- STYLES (Embedded for simplicity) ---
    const baseStyle = {
        position: 'relative', // Changed from fixed to be controlled by the manager
        width: '350px',
        margin: '0 0 10px 0',
        padding: '16px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(20px)',
        color: 'white',
        cursor: 'pointer'
    };

    const typeStyles = {
        success: { backgroundColor: '#28a745' }, // Green
        error: { backgroundColor: '#dc3545' },   // Red
        info: { backgroundColor: '#17a2b8' },    // Blue
    };

    const iconSvgPath = {
        success: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        error: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
        info: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z",
    };

    return (
        <div style={{ ...baseStyle, ...typeStyles[type] }} onClick={handleClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px', height: '24px', marginRight: '12px', flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d={iconSvgPath[type] || iconSvgPath.info} />
            </svg>
            <span>{message}</span>
            <button onClick={(e) => { e.stopPropagation(); handleClose(); }} style={{ background: 'none', border: 'none', color: 'white', marginLeft: 'auto', paddingLeft: '16px', fontSize: '1.2rem', cursor: 'pointer' }}>
                &times;
            </button>
        </div>
    );
};

export default Toast;