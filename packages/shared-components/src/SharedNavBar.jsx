import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignInIcon, SignOutIcon, UserIcon, AdminIcon, DigitalTwinXIcon, DigitalTwinAIIcon, LeanAIAgentIcon, BehavioralTrainingIcon, AboutUsIcon, ContactIcon } from './Icons'; // Ensure Icons.jsx is complete

// The configuration for the mega menu content. This makes it easy to update.
const menuConfig = {
    'digital-twins': {
        title: 'Digital Twins',
        items: [
            { icon: <DigitalTwinXIcon />, title: 'Digital Twin X', desc: 'Podstawowa symulacja procesów.', href: '/products/digital-twin-x' },
            { icon: <DigitalTwinAIIcon />, title: 'Digital Twin AI', desc: 'Zaawansowane modele z AI.', href: '/products/digital-twin-ai' },
        ]
    },
    'agenty-ai': {
        title: 'Agenty AI',
        items: [
            { icon: <LeanAIAgentIcon />, title: 'Lean AI Agent', desc: 'Agent do analizy danych i optymalizacji.', href: '/products/agent-lean-ai' },
        ]
    },
    'szkolenia': {
        title: 'Szkolenia',
        items: [
            { icon: <BehavioralTrainingIcon />, title: 'Szkolenia behawioralne', desc: 'Rozwój kompetencji miękkich.', href: '/products/szkolenia-behawioralne' },
        ]
    },
    'wiecej': {
        title: 'Więcej',
        items: [
            { icon: <AboutUsIcon />, title: 'O nas', desc: 'Poznaj naszą misję i zespół.', href: '/about' },
            { icon: <ContactIcon />, title: 'Kontakt', desc: 'Skontaktuj się z nami.', href: '/contact' }
        ]
    }
};

export const SharedNavBar = ({ user, claims, onLogin, onLogout }) => {
    const [activeMenu, setActiveMenu] = useState(null);
    const navigate = useNavigate();
    let menuTimeout; // Used to manage the delay before the menu closes.

    const handleMouseEnter = (menu) => {
        clearTimeout(menuTimeout);
        setActiveMenu(menu);
    };

    const handleMouseLeave = () => {
        // Set a brief timeout before closing the menu to allow the user's
        // mouse to travel from the link to the menu panel without it closing.
        menuTimeout = setTimeout(() => {
            setActiveMenu(null);
        }, 200);
    };
    
    // Navigate to the item's link using React Router and close the menu.
    const handleItemClick = (href) => {
        setActiveMenu(null);
        navigate(href);
    };

    return (
        <>
            <header className="top-bar">
                <div className="top-bar-content">
                    {/* Use Link component for instant, client-side navigation. */}
                    <Link to="/" className="platform-logo-topbar hover:opacity-80 transition-opacity">
                        Platforma <span className="amc-highlight">AMC</span>
                    </Link>
                    <nav
                        className="top-nav-links"
                        onMouseLeave={handleMouseLeave}
                    >
                        {Object.keys(menuConfig).map((key) => (
                            <div
                                key={key}
                                className={`nav-link-top ${activeMenu === key ? 'active-hover' : ''}`}
                                onMouseEnter={() => handleMouseEnter(key)}
                            >
                                {menuConfig[key].title}
                            </div>
                        ))}
                    </nav>
                     <div className="user-status-container">
                        {user ? (
                            claims?.admin ? (
                                <div className="admin-status-in" style={{ display: 'flex' }}>
                                    <Link to="/admin" className="user-avatar-icon" title="Admin Panel"><AdminIcon /></Link>
                                    <span className="user-greeting ml-2">Panel Administratora</span>
                                    <button onClick={onLogout} className="btn-base sign-out-btn ml-4"><SignOutIcon /><span>Wyloguj</span></button>
                                </div>
                            ) : (
                                <div className="user-status-in" style={{ display: 'flex' }}>
                                    <Link to="/account" className="user-avatar-icon" title="Moje Konto"><UserIcon /></Link>
                                    <span className="user-greeting ml-2">Witaj, {user.displayName || 'Użytkowniku'}</span>
                                    <button onClick={onLogout} className="btn-base sign-out-btn ml-4"><SignOutIcon /><span>Wyloguj</span></button>
                                </div>
                            )
                        ) : (
                            <div className="user-status-out">
                                <button onClick={onLogin} className="btn-base sign-in-btn">
                                    <SignInIcon />
                                    Zaloguj się
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* The Mega Menu Panel. Its visibility is controlled by the 'active' class. */}
            <div
                id="mega-menu-panel"
                className={activeMenu ? 'active' : ''}
                onMouseEnter={() => clearTimeout(menuTimeout)} // Keep menu open when mouse enters it
                onMouseLeave={handleMouseLeave} // Close menu when mouse leaves it
            >
                {Object.keys(menuConfig).map(key => (
                    <div key={key} id={`menu-${key}`} className={`mega-menu-content ${activeMenu === key ? 'active' : ''}`}>
                        <div className="mega-menu-grid">
                            {menuConfig[key].items.map((item, index) => (
                                <div key={index} onClick={() => handleItemClick(item.href)} className="mega-menu-item">
                                    <div className="item-icon">{item.icon}</div>
                                    <div>
                                        <div className="item-title">{item.title}</div>
                                        <div className="item-desc">{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};