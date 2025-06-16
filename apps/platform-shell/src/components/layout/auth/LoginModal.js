import React, { useState } from 'react';
import { auth } from 'packages/firebase-helpers/client';
import { signInWithEmailAndPassword } from "firebase/auth";

const LoginModal = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            onClose(); // Close modal on success
        } catch (err) {
            if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                 setError("Nieprawidłowy email lub hasło.");
            } else {
                 setError("Wystąpił błąd podczas logowania.");
            }
            console.error("Firebase Auth Error:", err);
        }

        setLoading(false);
    };

    const handleModalContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[2000]" onClick={onClose}>
            <div className="modal-card w-full max-w-md p-8 rounded-2xl relative" onClick={handleModalContentClick}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div className="modal-step active">
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Witaj z powrotem</h2>
                    <p className="text-text-muted mb-6">Zaloguj się, aby uzyskać dostęp do platformy.</p>
                    <form onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="email" className="text-sm font-medium text-text-secondary block mb-2">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                className="modal-input" 
                                placeholder="jan.kowalski@firma.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                        <div className="mt-4">
                            <label htmlFor="password" className="text-sm font-medium text-text-secondary block mb-2">Hasło</label>
                            <input 
                                type="password" 
                                id="password" 
                                className="modal-input" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm mt-4 text-center h-5">{error}</p>}
                        <div className="mt-6">
                            <button type="submit" className="modal-btn modal-btn-primary" disabled={loading}>
                                {loading ? <span className="spinner-modal"></span> : <span>Zaloguj się</span>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;