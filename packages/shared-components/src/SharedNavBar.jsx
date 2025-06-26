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
            { icon: <DigitalTwinXIcon />, title: 'Digital Twin X', desc: 'Basic process simulation.', href: '/products/digital-twin-x' },
            { icon: <DigitalTwinAIIcon />, title: 'Digital Twin AI', desc: 'Advanced models with AI.', href: '/products/digital-twin-ai' },
            { icon: <DigitalTwinSuperIcon />, title: 'Digital Twin Super', desc: 'Comprehensive digital twins.', href: '/products/digital-twin-super' },
        ]
    },
    'agenty-ai': {
        title: 'AI Agents',
        items: [
            { icon: <LeanAIAgentIcon />, title: 'Lean AI Agent', desc: 'Agent for data analysis and optimization.', href: '/products/agent-lean-ai' },
            { icon: <LeanAISuperAgentIcon />, title: 'Lean AI Super Agent', desc: 'Full automation with an AI agent.', href: '/products/lean-ai-super-agent' },
        ]
    },
    'szkolenia': {
        title: 'Training',
        items: [
            { icon: <BehavioralTrainingIcon />, title: 'Behavioral Training', desc: 'Soft skills development.', href: '/products/szkolenia-behawioralne' },
            { icon: <SkillsTrainingIcon />, title: 'Skills Training', desc: 'Practical technical workshops.', href: '/products/szkolenia-umiejetnosci' },
        ]
    },
    'wiecej': {
        title: 'More',
        items: [
            { icon: <PartnersIcon />, title: 'Partners', desc: 'Our trusted collaborators.', href: '/partners' },
            { icon: <AboutUsIcon />, title: 'About', desc: 'Get to know our mission and team.', href: '/about' },
            { icon: <ContactIcon />, title: 'Contact', desc: 'Contact us.', href: '/contact' }
        ]
    }
};

/**
 * A versatile NavLink component that can render either a React Router <Link>
 * for internal navigation or a standard <a> tag for external navigation.
 */
const SmartNavLink = ({ href, shellUrl, children, ...props }) => {
    if (shellUrl) {
        // If shellUrl is provided, it's an external link.
        // We construct the full URL and use a standard anchor tag.
        return <a href={`${shellUrl}${href}`} {...props}>{children}</a>;
    }
    // Otherwise, use the React Router <Link> for client-side navigation.
    return <Link to={href} {...props}>{children}</Link>;
};

export const SharedNavBar = ({ user, claims, onLogin, onLogout, shellUrl }) => {
    const [activeMenu, setActiveMenu] = useState(null);
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    
    const navigate = useNavigate();
    const mouseLeaveTimeoutRef = useRef(null);
    const closingTimeoutRef = useRef(null);

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
        mouseLeaveTimeoutRef.current = setTimeout(() => {
            setIsClosing(true);
            closingTimeoutRef.current = setTimeout(() => {
                setIsPanelVisible(false);
                setActiveMenu(null);
                setIsClosing(false);
            }, 300);
        }, 200);
    };
    
    const handleItemClick = (href) => {
        cancelClosing();
        setIsPanelVisible(false);
        setActiveMenu(null);
        if (shellUrl) {
            // If it's an external link, perform a full browser redirect.
            window.location.href = `${shellUrl}${href}`;
        } else {
            // Otherwise, navigate internally.
            navigate(href);
        }
    };

    const panelClassName = [
        isPanelVisible ? 'active' : '',
        isClosing ? 'is-closing' : ''
    ].filter(Boolean).join(' ');

    const ActiveMenuContent = activeMenu ? menuConfig[activeMenu] : null;

    return (
        <div onMouseLeave={handleMouseLeave}>
            <header className="top-bar">
                <div className="top-bar-content">
                    <div className="top-bar-left">
                        <SmartNavLink href="/" shellUrl={shellUrl} className="platform-logo-topbar hover:opacity-80 transition-opacity">
                            Platforma <span className="amc-highlight">AMC</span>
                        </SmartNavLink>

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

                    <div className="user-status-container">
                        {user ? (
                            claims?.admin ? (
                                <div className="admin-status-in"> 
                                    <SmartNavLink href="/admin" shellUrl={shellUrl} className="user-avatar-icon" title="Admin Panel"><AdminIcon /></SmartNavLink>
                                    <span className="user-greeting">Panel Administratora</span>
                                    <button onClick={onLogout} className="btn-base sign-out-btn"><SignOutIcon /><span>Wyloguj</span></button>
                                </div>
                            ) : (
                                <div className="user-status-in">
                                    <SmartNavLink href="/account" shellUrl={shellUrl} className="user-avatar-icon" title="Moje Konto"><UserIcon /></SmartNavLink>
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