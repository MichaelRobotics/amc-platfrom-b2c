import React from 'react';
import { CloseIcon } from './Icons'; // Assuming Icons.jsx exists

/**
 * A modal component for handling user login and multi-factor authentication (MFA).
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Controls if the modal is visible.
 * @param {function} props.onClose - Function to call when the modal should be closed.
 * @param {function} props.onLoginSubmit - Async function to handle email/password submission.
 * @param {function} props.onMfaSubmit - Async function to handle the MFA code submission.
 * @param {string} [props.mfaHint] - A hint for the MFA method, like a partial phone number.
 * @param {string} [props.loginError] - Error message to display on the login form.
 * @param {string} [props.mfaError] - Error message to display on the MFA form.
 * @param {boolean} props.isLoading - Indicates if an auth process is in progress.
 * @param {boolean} props.isMfa - Determines whether to show the login or MFA step.
 */
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
    // When isOpen is false, we render nothing. This is key for CSS transitions.
    if (!isOpen) {
        return null;
    }

    // Handles the login form submission.
    const handleLogin = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        onLoginSubmit(email, password);
    };

    // Handles the MFA form submission.
    const handleMfa = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const mfaCode = formData.get('mfaCode');
        onMfaSubmit(mfaCode);
    };

    // The modal-overlay class provides the dark backdrop and flex centering.
    // The .active class on it controls the fadeIn visibility.
    return (
        <div className={`modal-overlay ${isOpen ? 'active' : ''}`}>
            {/* The modal-card class handles the modal's appearance and entry animation. */}
            <div className="modal-card w-full p-8 rounded-2xl relative" style={{maxWidth: '420px'}}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                    <CloseIcon />
                </button>

                {/* Login Step with Animation */}
                <div id="loginStep" className={`modal-step ${!isMfa ? 'active' : ''}`}>
                    <h2 className="text-2xl font-bold text-text-primary mb-2 text-left">Witaj z powrotem</h2>
                    <p className="text-text-muted mb-6 text-left">Zaloguj się, aby uzyskać dostęp do platformy.</p>
                    <form onSubmit={handleLogin}>
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
                        <div className="mt-4">
                            <label htmlFor="password-input" className="form-label">Hasło</label>
                            <input
                                type="password"
                                id="password-input"
                                name="password"
                                className="modal-input"
                                required
                            />
                        </div>
                        <div className="mt-6">
                            <button type="submit" className="modal-btn modal-btn-primary w-full" disabled={isLoading && !isMfa}>
                                {isLoading && !isMfa ? (
                                    <><span className="spinner-modal"></span><span>Logowanie...</span></>
                                ) : (
                                    <span>Zaloguj się</span>
                                )}
                            </button>
                        </div>
                    </form>
                    <div className="text-red-500 text-sm mt-4 text-center h-5">{loginError}</div>
                </div>

                {/* MFA Step with Animation */}
                <div id="mfaStep" className={`modal-step ${isMfa ? 'active' : ''}`}>
                    <h2 className="text-2xl font-bold text-text-primary mb-2 text-left">Weryfikacja dwuetapowa</h2>
                    <p className="text-text-muted mb-6 text-left">
                        Dla Twojego bezpieczeństwa, wpisz kod wysłany na Twój numer telefonu <strong className="text-text-primary">{mfaHint}</strong>.
                    </p>
                    <form onSubmit={handleMfa}>
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
                        <div className="mt-6">
                            <button type="submit" className="modal-btn modal-btn-primary w-full" disabled={isLoading && isMfa}>
                                {isLoading && isMfa ? (
                                    <><span className="spinner-modal"></span><span>Weryfikacja...</span></>
                                ) : (
                                    <span>Weryfikuj</span>
                                )}
                            </button>
                        </div>
                    </form>
                    <div className="text-red-500 text-sm mt-4 text-center h-5">{mfaError}</div>
                </div>
            </div>
        </div>
    );
};