/**
 * @fileoverview A reusable Toast notification component.
 * Displays a message with an icon and a close button.
 */
import React, { useEffect, useState } from 'react';

const Toast = ({ message, type = 'success', duration = 5000, onClose }) => {
    const [visible, setVisible] = useState(false);

    // Effect for fade-in and setting the auto-close timer
    useEffect(() => {
        // Fade in
        setVisible(true);

        // Auto-close timer
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setVisible(false);
        // Allow time for fade-out animation before calling the parent's onClose
        setTimeout(() => {
            onClose();
        }, 300); // This duration should match the CSS transition
    };
    
    // --- STYLES (Embedded for simplicity) ---
    const baseStyle = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-20px)',
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
        // Add paths for error/info if needed
    };

    return (
        <div style={{ ...baseStyle, ...typeStyles[type] }} onClick={handleClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px', height: '24px', marginRight: '12px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d={iconSvgPath[type]} />
            </svg>
            <span>{message}</span>
            <button onClick={(e) => { e.stopPropagation(); handleClose(); }} style={{ background: 'none', border: 'none', color: 'white', marginLeft: '16px', fontSize: '1.2rem', cursor: 'pointer' }}>
                &times;
            </button>
        </div>
    );
};

export default Toast;