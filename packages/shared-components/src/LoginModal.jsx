// packages/shared-components/src/LoginModal.jsx

import React from 'react';
import { CloseIcon } from './Icons';

export const LoginModal = ({
    isOpen,
    onClose,
    onLoginSubmit,
    onMfaSubmit,
    mfaHint,
    loginError,
    mfaError,
    isLoading,
    isMfa,
}) => {
    if (!isOpen) {
        return null;
    }

    const handleLogin = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        onLoginSubmit(email, password);
    };

    const handleMfa = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const mfaCode = formData.get('mfaCode');
        onMfaSubmit(mfaCode);
    };

    return (
        <div className={`modal-overlay ${isOpen ? 'active' : ''}`}>
            {/* Use the 'relative' class here if you keep the Tailwind-styled close button */}
            <div className="modal-card relative" style={{maxWidth: '420px'}}>

                {/* Login Step with updated structure */}
                <div id="loginStep" className={`modal-step ${!isMfa ? 'active' : ''}`}>
                    <div className="modal-header">
                        <h2 className="modal-title">Witaj z powrotem</h2>
                        {/* Note: I'm using modal-close-btn for consistency. You can keep your Tailwind version if you prefer. */}
                        <button onClick={onClose} className="modal-close-btn">&times;</button>
                    </div>
                    <form onSubmit={handleLogin}>
                        <div className="modal-body">
                            <p className="mb-6">Zaloguj się, aby uzyskać dostęp do platformy.</p>
                            <div>
                                <label htmlFor="email-input" className="form-label">Email</label>
                                <input
                                    type="email"
                                    id="email-input"
                                    name="email"
                                    className="modal-input"
                                    placeholder="jan.kowalski@firma.com"
                                    required
                                />
                            </div>
                            <div> {/* Removed mt-4, as modal-input has margin-bottom */}
                                <label htmlFor="password-input" className="form-label">Hasło</label>
                                <input
                                    type="password"
                                    id="password-input"
                                    name="password"
                                    className="modal-input"
                                    required
                                />
                            </div>
                            <div className="text-red-500 text-sm text-center h-5">{loginError}</div>
                        </div>
                        <div className="modal-footer">
                            <button type="submit" className="modal-btn modal-btn-primary w-full" disabled={isLoading && !isMfa}>
                                {isLoading && !isMfa ? (
                                    <><span className="spinner-modal"></span><span>Logowanie...</span></>
                                ) : (
                                    <span>Zaloguj się</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* MFA Step with updated structure */}
                <div id="mfaStep" className={`modal-step ${isMfa ? 'active' : ''}`}>
                    <div className="modal-header">
                        <h2 className="modal-title">Weryfikacja dwuetapowa</h2>
                        <button onClick={onClose} className="modal-close-btn">&times;</button>
                    </div>
                    <form onSubmit={handleMfa}>
                        <div className="modal-body">
                            <p className="mb-6">
                                Dla Twojego bezpieczeństwa, wpisz kod wysłany na Twój numer telefonu <strong className="text-text-primary">{mfaHint}</strong>.
                            </p>
                            <div>
                                <label htmlFor="mfaCode-input" className="form-label">Kod weryfikacyjny (6 cyfr)</label>
                                <input
                                    type="text"
                                    id="mfaCode-input"
                                    name="mfaCode"
                                    inputMode="numeric"
                                    pattern="\d{6}"
                                    maxLength="6"
                                    className="modal-input text-center text-xl tracking-[0.5em]"
                                    required
                                />
                            </div>
                             <div className="text-red-500 text-sm text-center h-5">{mfaError}</div>
                        </div>
                        <div className="modal-footer">
                             <button type="submit" className="modal-btn modal-btn-primary w-full" disabled={isLoading && isMfa}>
                                {isLoading && isMfa ? (
                                    <><span className="spinner-modal"></span><span>Weryfikacja...</span></>
                                ) : (
                                    <span>Weryfikuj</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};