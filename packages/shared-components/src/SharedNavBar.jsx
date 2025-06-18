import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@amc-platfrom/shared-contexts';
import { AdminIcon, UserIcon, LogoutIcon, DigitalTwinIcon, AgentIcon, TrainingIcon, MoreIcon, PartnersIcon, AboutIcon, ContactIcon } from './Icons';
import { Link } from 'react-router-dom';

const MegaMenuItem = ({ href, product, icon, title, desc, userClaims }) => {
    const isSubscribed = userClaims && userClaims.products && userClaims.products[product];
    const targetUrl = isSubscribed ? `/app/${product}` : href; // Example logic

    return (
        <a href={targetUrl} className="mega-menu-item group text-decoration-none">
            <div className="item-icon">{icon}</div>
            <div>
                <div className="item-title">{title}</div>
                <div className="item-desc">{desc}</div>
            </div>
        </a>
    );
};

export const SharedNavBar = ({ onLoginClick, isAdminPanel = false }) => {
    const { user, claims, logout } = useAuth();
    const [activeMenu, setActiveMenu] = useState(null);
    const menuTimeoutRef = useRef(null);

    const openMenu = (menuId) => {
        clearTimeout(menuTimeoutRef.current);
        setActiveMenu(menuId);
    };

    const closeMenu = () => {
        menuTimeoutRef.current = setTimeout(() => {
            setActiveMenu(null);
        }, 200);
    };

    useEffect(() => {
        return () => clearTimeout(menuTimeoutRef.current);
    }, []);

    const menuData = {
        'digital-twins': [
            { href: '/products/digital-twin-x', product: 'digitalTwinX', icon: <DigitalTwinIcon />, title: 'Digital Twin X', desc: 'Podstawowa symulacja procesów.' },
            { href: '/products/digital-twin-ai', product: 'digitalTwinAI', icon: <AgentIcon />, title: 'Digital Twin AI', desc: 'Zaawansowane modele z AI.' },
        ],
        'agenty-ai': [
            { href: '/products/agent-lean-ai', product: 'agentLeanAI', icon: <AgentIcon />, title: 'Lean AI Agent', desc: 'Agent do analizy danych i optymalizacji.' },
        ],
        'szkolenia': [
            { href: '/products/szkolenia-behawioralne', product: 'szkoleniaBehawioralne', icon: <TrainingIcon />, title: 'Szkolenia behawioralne', desc: 'Rozwój kompetencji miękkich.' },
        ],
        'wiecej': [
            { href: '/products/partnerzy', product: 'partnerzy', icon: <PartnersIcon />, title: 'Partnerzy', desc: 'Nasi zaufani współpracownicy.' },
            { href: '/products/o-nas', product: 'oNas', icon: <AboutIcon />, title: 'O nas', desc: 'Poznaj naszą misję i zespół.' },
            { href: '/products/kontakt', product: 'kontakt', icon: <ContactIcon />, title: 'Kontakt', desc: 'Skontaktuj się z nami.' },
        ],
    };

    return (
        <>
            <header className="top-bar">
                <div className="flex justify-between items-center w-full max-w-7xl mx-auto px-8 h-full">
                    <Link to="/" className="platform-logo-topbar hover:opacity-80 transition-opacity no-underline">
                        Platforma <span className="amc-highlight">AMC</span>
                    </Link>
                    
                    <nav className="hidden lg:flex gap-6 items-center h-full ml-8" onMouseLeave={closeMenu}>
                        {Object.keys(menuData).map((menuKey) => (
                             <div key={menuKey} onMouseEnter={() => openMenu(menuKey)} className={`nav-link-top h-full flex items-center cursor-pointer ${activeMenu === menuKey ? 'active-hover' : ''}`}>
                                {menuKey.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                             </div>
                        ))}
                    </nav>

                    <div className="ml-auto">
                        {user ? (
                            claims?.admin && isAdminPanel ? (
                                <div className="flex items-center">
                                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-700" title="Admin">
                                        <AdminIcon />
                                    </div>
                                    <span className="text-sm font-medium text-gray-300 ml-2">Panel Administratora</span>
                                    <button onClick={logout} className="btn-base sign-out-btn ml-4">
                                        <LogoutIcon /> Wyloguj
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <Link to={claims?.admin ? '/admin' : '/my-account'} className="flex items-center no-underline" title={claims?.admin ? 'Panel Administratora' : 'Moje Konto'}>
                                         <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-700">
                                            <UserIcon />
                                        </div>
                                    </Link>
                                    <span className="text-sm font-medium text-gray-300 ml-2">Witaj, {user.displayName || 'Użytkowniku'}</span>
                                    <button onClick={logout} className="btn-base sign-out-btn ml-4">
                                        <LogoutIcon /> Wyloguj
                                    </button>
                                </div>
                            )
                        ) : (
                            <button onClick={onLoginClick} className="btn-base sign-in-btn">Zaloguj się</button>
                        )}
                    </div>
                </div>
            </header>

            <div id="mega-menu-panel" 
                 className={`fixed top-[var(--top-bar-height)] left-0 right-0 z-[999] shadow-2xl transition-all duration-300 ease-out ${activeMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-full'}`}
                 onMouseEnter={() => openMenu(activeMenu)} 
                 onMouseLeave={closeMenu}
            >
                <div className="max-w-7xl mx-auto p-10">
                    {Object.entries(menuData).map(([key, items]) => (
                        <div key={key} className={`mega-menu-content ${activeMenu === key ? 'block' : 'hidden'}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {items.map(item => <MegaMenuItem key={item.product} {...item} userClaims={claims} />)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};