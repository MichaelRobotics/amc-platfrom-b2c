import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from 'packages/firebase-helpers/client';
import { signOut as firebaseSignOut } from "firebase/auth";

// Import the modal component
import LoginModal from '../auth/LoginModal';

// --- SVG Icons (as components for reusability) ---
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd"></path></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd"></path></svg>;
const SignOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l-3-3m0 0l-3-3m3-3H9"></path></svg>;
const MegaMenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.682 16.072M21.002 7.222L11.802 14.122M11.802 14.122L4.5 21.002M11.802 14.122L21.3 16.5 13.682 16.072M4.5 21.002L7.222 3.002l9.08 9.08-2.472 2.472" /></svg>;

// --- Mega Menu Configuration ---
const megaMenuConfig = {
    'agenty-ai': {
        title: 'Agenty AI',
        items: [
            {
                title: 'Lean AI Agent',
                desc: 'Agent do analizy danych i optymalizacji.',
                href: '/products/agent-lean-ai',
                productKey: 'agentLeanAI', // Key used for checking claims
            },
            // Add other "Agenty AI" products here
        ]
    },
    // Add other menu categories like 'digital-twins' here
};

const SharedNavBar = () => {
    const { currentUser, idTokenResult } = useAuth();
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState(null);
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);

    const handleSignOut = () => {
        firebaseSignOut(auth).catch(error => console.error("Sign out error", error));
    };

    const handleProductClick = (product) => {
        setActiveMenu(null); // Close menu on click
        
        if (!currentUser) {
            navigate(product.href);
            return;
        }

        const isAdmin = idTokenResult?.claims?.admin === true;
        const hasProduct = idTokenResult?.claims?.products?.[product.productKey] === true;

        if (isAdmin || hasProduct) {
            // NOTE: For now, we only have one app, so we navigate there directly.
            // In the future, this could be dynamic based on the productKey.
            navigate(`/app/analyzer/main-menu`);
        } else {
            navigate(product.href);
        }
    };

    return (
        <>
            <header className="top-bar">
                <div className="top-bar-content">
                    <Link to="/" className="platform-logo-topbar hover:opacity-80 transition-opacity">
                        Platforma <span className="amc-highlight">AMC</span>
                    </Link>
                    
                    <nav className="top-nav-links" onMouseLeave={() => setActiveMenu(null)}>
                        {Object.entries(megaMenuConfig).map(([key, menu]) => (
                             <div key={key} className="nav-link-top" onMouseEnter={() => setActiveMenu(key)}>
                                 {menu.title}
                             </div>
                        ))}
                        {/* "Dumb" links as requested */}
                        <div className="nav-link-top">Digital Twins</div>
                        <div className="nav-link-top">Szkolenia</div>
                    </nav>

                    <div className="user-status-container">
                        {currentUser ? (
                            idTokenResult?.claims.admin ? (
                                <div className="admin-status-in" style={{display: 'flex'}}>
                                    <div className="user-avatar-icon" title="Admin"><LockIcon /></div>
                                    <span className="user-greeting ml-2">Panel Administratora</span> 
                                    <button onClick={handleSignOut} className="btn-base sign-out-btn ml-4"><SignOutIcon /> Wyloguj</button>
                                </div>
                            ) : (
                                <div className="user-status-in" style={{display: 'flex'}}>
                                    <Link to="#" className="flex items-center no-underline" title="Moje konto (not active)">
                                        <div className="user-avatar-icon"><UserIcon /></div>
                                    </Link>
                                    <span className="user-greeting ml-2">Witaj, {currentUser.displayName || 'Użytkowniku'}</span> 
                                    <button onClick={handleSignOut} className="btn-base sign-out-btn ml-4"><SignOutIcon /> Wyloguj</button>
                                </div>
                            )
                        ) : (
                            <div className="user-status-out">
                               <button onClick={() => setLoginModalOpen(true)} className="btn-base sign-in-btn">Zaloguj się</button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            
            <div id="mega-menu-panel" className={activeMenu ? 'active' : ''} onMouseLeave={() => setActiveMenu(null)}>
                 {Object.entries(megaMenuConfig).map(([key, menu]) => (
                     <div key={key} id={`menu-${key}`} className={`mega-menu-content ${activeMenu === key ? 'active' : ''}`}>
                         <div className="mega-menu-grid">
                             {menu.items.map(item => (
                                 <div key={item.productKey} className="mega-menu-item" onClick={() => handleProductClick(item)}>
                                     <div className="item-icon"><MegaMenuIcon /></div>
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
            
            {isLoginModalOpen && <LoginModal onClose={() => setLoginModalOpen(false)} />}
        </>
    );
};

export default SharedNavBar;