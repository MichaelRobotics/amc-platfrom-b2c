import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    SignInIcon, SignOutIcon, UserIcon, AdminIcon,
    DigitalTwinXIcon, DigitalTwinAIIcon, DigitalTwinSuperIcon,
    LeanAIAgentIcon, LeanAISuperAgentIcon,
    BehavioralTrainingIcon, SkillsTrainingIcon,
    PartnersIcon, AboutUsIcon, ContactIcon 
} from './Icons'; // Ensure you have this Icons.js file with strokeWidth="1.0"

// The configuration for the mega menu content.
const menuConfig = {
    'digital-twins': {
        title: 'Digital Twins',
        items: [
            { icon: <DigitalTwinXIcon />, title: 'Digital Twin X', desc: 'Podstawowa symulacja procesów.', href: '/products/digital-twin-x' },
            { icon: <DigitalTwinAIIcon />, title: 'Digital Twin AI', desc: 'Zaawansowane modele z AI.', href: '/products/digital-twin-ai' },
            { icon: <DigitalTwinSuperIcon />, title: 'Digital Twin Super', desc: 'Kompleksowe bliźniaki cyfrowe.', href: '/products/digital-twin-super' },
        ]
    },
    'agenty-ai': {
        title: 'Agenty AI',
        items: [
            { icon: <LeanAIAgentIcon />, title: 'Lean AI Agent', desc: 'Agent do analizy danych i optymalizacji.', href: '/products/agent-lean-ai' },
            { icon: <LeanAISuperAgentIcon />, title: 'Lean AI Super Agent', desc: 'Pełna automatyzacja z agentem AI.', href: '/products/lean-ai-super-agent' },
        ]
    },
    'szkolenia': {
        title: 'Szkolenia',
        items: [
            { icon: <BehavioralTrainingIcon />, title: 'Szkolenia behawioralne', desc: 'Rozwój kompetencji miękkich.', href: '/products/szkolenia-behawioralne' },
            { icon: <SkillsTrainingIcon />, title: 'Szkolenia umiejętności', desc: 'Praktyczne warsztaty techniczne.', href: '/products/szkolenia-umiejetnosci' },
        ]
    },
    'wiecej': {
        title: 'Więcej',
        items: [
            { icon: <PartnersIcon />, title: 'Partnerzy', desc: 'Nasi zaufani współpracownicy.', href: '/partners' },
            { icon: <AboutUsIcon />, title: 'O nas', desc: 'Poznaj naszą misję i zespół.', href: '/about' },
            { icon: <ContactIcon />, title: 'Kontakt', desc: 'Skontaktuj się z nami.', href: '/contact' }
        ]
    }
};

export const SharedNavBar = ({ user, claims, onLogin, onLogout }) => {
    const [activeMenu, setActiveMenu] = useState(null);
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    
    const navigate = useNavigate();
    // Use useRef to hold timer IDs, which persists them across renders.
    const mouseLeaveTimeoutRef = useRef(null);
    const closingTimeoutRef = useRef(null);

    // This function cancels all pending "close" actions.
    const cancelClosing = () => {
        clearTimeout(mouseLeaveTimeoutRef.current);
        clearTimeout(closingTimeoutRef.current);
        setIsClosing(false);
    };

    const handleMouseEnter = (menuKey) => {
        cancelClosing();
        setActiveMenu(menuKey);
        setIsPanelVisible(true);
    };

    const handleMouseLeave = () => {
        // Start a timer to close the menu.
        mouseLeaveTimeoutRef.current = setTimeout(() => {
            setIsClosing(true); // Trigger the .is-closing CSS animation
            
            // After the animation is done (300ms), fully hide the panel and reset state.
            closingTimeoutRef.current = setTimeout(() => {
                setIsPanelVisible(false);
                setActiveMenu(null);
                setIsClosing(false);
            }, 300); // Must match the animation duration in CSS

        }, 200);
    };
    
    const handleItemClick = (href) => {
        cancelClosing();
        setIsPanelVisible(false);
        setActiveMenu(null);
        navigate(href);
    };

    // Construct the className string for the panel dynamically
    const panelClassName = [
        isPanelVisible ? 'active' : '',
        isClosing ? 'is-closing' : ''
    ].filter(Boolean).join(' ');

    const ActiveMenuContent = activeMenu ? menuConfig[activeMenu] : null;

// In SharedNavBar.js, update the entire return block

return (
    // This parent container handles the main mouse leave event
    <div onMouseLeave={handleMouseLeave}>
        <header className="top-bar">
            <div className="top-bar-content">

                {/* FIX: Wrapper for logo and nav links */}
                <div className="top-bar-left">
                    <Link to="/" className="platform-logo-topbar hover:opacity-80 transition-opacity">
                        Platforma <span className="amc-highlight">AMC</span>
                    </Link>

                    <nav className="top-nav-links">
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
                </div>

                {/* The user status container remains on the right */}
                <div className="user-status-container">
                    {user ? (
                        claims?.admin ? (
                            <div className="admin-status-in"> 
                                <Link to="/admin" className="user-avatar-icon" title="Admin Panel"><AdminIcon /></Link>
                                <span className="user-greeting">Panel Administratora</span>
                                <button onClick={onLogout} className="btn-base sign-out-btn"><SignOutIcon /><span>Wyloguj</span></button>
                            </div>
                        ) : (
                            <div className="user-status-in">
                                <Link to="/account" className="user-avatar-icon" title="Moje Konto"><UserIcon /></Link>
                                <span className="user-greeting">Witaj, {user.displayName || 'Użytkowniku'}</span>
                                <button onClick={onLogout} className="btn-base sign-out-btn"><SignOutIcon /><span>Wyloguj</span></button>
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

        <div
            id="mega-menu-panel"
            className={panelClassName}
            onMouseEnter={cancelClosing} 
        >
            {/* Mega menu content rendering remains the same */}
            {ActiveMenuContent && (
                <div className="mega-menu-content">
                    <div className="mega-menu-grid">
                        {ActiveMenuContent.items.map((item, index) => (
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
            )}
        </div>
    </div>
);
};