import React, { useState, useEffect } from 'react';
import { useAuth } from '@amc-platfrom/shared-contexts';
import { CloseIcon, SpinnerIcon } from './Icons';

export const LoginModal = ({ isOpen, onClose }) => {
    const { login, mfaRequired, mfaHint, resolveMfa } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mfaCode, setMfaCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState('login'); // 'login' or 'mfa'

    useEffect(() => {
        if (mfaRequired) {
            setCurrentStep('mfa');
            setIsLoading(false);
            setError('');
        }
    }, [mfaRequired]);

    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal is closed
            setTimeout(() => {
                setCurrentStep('login');
                setError('');
                setEmail('');
                setPassword('');
                setMfaCode('');
                setIsLoading(false);
            }, 300); // Delay to allow closing animation
        }
    }, [isOpen]);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const result = await login(email, password);
        if (result.success) {
            onClose();
        } else if (!result.mfa) {
            setError(result.error || 'Nieprawidłowy email lub hasło.');
            setIsLoading(false);
        }
        // If MFA is required, useEffect will handle the step change
    };

    const handleMfaSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const result = await resolveMfa(mfaCode);
        if (result.success) {
            onClose();
        } else {
            setError(result.error || 'Wystąpił nieoczekiwany błąd.');
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="modal-card w-full max-w-md p-8 rounded-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                    <CloseIcon />
                </button>

                <div className={`modal-step ${currentStep === 'login' ? 'active' : 'hidden'}`}>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Witaj z powrotem</h2>
                    <p className="text-text-muted mb-6">Zaloguj się, aby uzyskać dostęp do platformy.</p>
                    <form onSubmit={handleLoginSubmit}>
                        <div>
                            <label htmlFor="email" className="text-sm font-medium text-text-secondary block mb-2">Email</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="modal-input w-full text-sm rounded-lg" placeholder="jan.kowalski@firma.com" required />
                        </div>
                        <div className="mt-4">
                            <label htmlFor="password"className="text-sm font-medium text-text-secondary block mb-2">Hasło</label>
                            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="modal-input w-full text-sm rounded-lg" required />
                        </div>
                        <div className="mt-6">
                            <button type="submit" disabled={isLoading} className="modal-btn modal-btn-primary w-full inline-flex items-center justify-center gap-2 text-white font-medium rounded-lg text-sm py-3">
                                {isLoading ? <SpinnerIcon /> : null}
                                <span>{isLoading ? 'Logowanie...' : 'Zaloguj się'}</span>
                            </button>
                        </div>
                    </form>
                    <div className="text-red-500 text-sm mt-4 text-center h-5">{error && currentStep === 'login' ? error : ''}</div>
                </div>

                <div className={`modal-step ${currentStep === 'mfa' ? 'active' : 'hidden'}`}>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Weryfikacja dwuetapowa</h2>
                    <p className="text-text-muted mb-6">Dla Twojego bezpieczeństwa, wpisz kod wysłany na Twój numer telefonu <strong className="text-text-primary">{mfaHint}</strong>.</p>
                    <form onSubmit={handleMfaSubmit}>
                        <div>
                            <label htmlFor="mfaCode" className="text-sm font-medium text-text-secondary block mb-2">Kod weryfikacyjny (6 cyfr)</label>
                            <input type="text" id="mfaCode" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} inputMode="numeric" pattern="\d{6}" maxLength="6" className="modal-input w-full text-center text-xl tracking-[0.5em] rounded-lg" required />
                        </div>
                        <div className="mt-6">
                             <button type="submit" disabled={isLoading} className="modal-btn modal-btn-primary w-full inline-flex items-center justify-center gap-2 text-white font-medium rounded-lg text-sm py-3">
                                {isLoading ? <SpinnerIcon /> : null}
                                <span>{isLoading ? 'Weryfikacja...' : 'Weryfikuj'}</span>
                            </button>
                        </div>
                    </form>
                    <div className="text-red-500 text-sm mt-4 text-center h-5">{error && currentStep === 'mfa' ? error : ''}</div>
                </div>

            </div>
        </div>
    );
};
