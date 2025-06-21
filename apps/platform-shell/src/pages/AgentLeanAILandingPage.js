import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@amc-platfrom/shared-contexts'; // <-- Import useAuth

// --- Reusable Icon Components (assuming they are defined elsewhere or here) ---
const CtaArrowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path></svg>;
const SuccessIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18" /></svg>;
const LinkedInIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2ZM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 1 1 8.25 6.5 1.75 1.75 0 0 1 6.5 8.25ZM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0 0 13 14.19a.66.66 0 0 0 0 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 0 1 2.7-1.4c1.55 0 3.36.96 3.36 3.66Z"></path></svg>;
const Spinner = () => <div className="spinner-modal"></div>;

// A sub-component for the FAQ items to manage their own open/closed state
const FaqItem = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`faq-item ${isOpen ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => setIsOpen(!isOpen)}>
                <span>{question}</span>
                <span className="faq-toggle">{isOpen ? '−' : '+'}</span>
            </div>
            <div className="faq-answer">
                {children}
            </div>
        </div>
    );
};


const AgentLeanAILandingPage = () => {
    // --- REDIRECTION LOGIC ---
    const { user, claims, loading: authLoading } = useAuth();

    useEffect(() => {
        // Wait until the auth state is confirmed before doing anything
        if (authLoading) {
            return;
        }

        // Check for the specific claim and redirect if the user is authorized
        if (user && claims?.hasLeanAiAgentAccess) {
            // IMPORTANT: This URL should be the deployed URL of your cross-analyzer-agent app
            window.location.href = 'https://cross-analyzer-agent.web.app/'; 
        }
    }, [user, claims, authLoading]);
    // --- END OF REDIRECTION LOGIC ---


    // --- ORIGINAL COMPONENT LOGIC ---
    // This effect runs once to handle scroll animations for existing content
    useEffect(() => {
        const scrollElements = document.querySelectorAll(".scroll-animate");
        const handleScrollAnimation = () => {
            scrollElements.forEach((el) => {
                if (el.getBoundingClientRect().top <= (window.innerHeight || document.documentElement.clientHeight) / 1.15) {
                    el.classList.add("is-visible");
                }
            });
        };
        window.addEventListener("scroll", handleScrollAnimation);
        handleScrollAnimation();

        return () => window.removeEventListener("scroll", handleScrollAnimation);
    }, []);

    // State for the product demo modal
    const [isDemoModalOpen, setDemoModalOpen] = useState(false);
    const [demoStep, setDemoStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [userRole, setUserRole] = useState('');
    const [demoUsage, setDemoUsage] = useState('');
    const [companyEmail, setCompanyEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    // AI Interpretation State
    const [aiInterpretation, setAiInterpretation] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const interpretationBoxRef = useRef(null);

    // Email Preview State
    const [emailPreview, setEmailPreview] = useState('');

    // --- Helper Functions ---
    const freeEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'wp.pl', 'o2.pl', 'onet.pl', 'interia.pl'];
    const isValidCorporateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return false;
        const domain = email.split('@')[1];
        return !freeEmailDomains.includes(domain.toLowerCase());
    };
    
    const generateEmailBody = (productName, role, usage, email) => 
`Szanowni Państwo z Advanced Manufacturing Consulting,

Jestem zainteresowany/a demonstracją produktu: ${productName}.
Moja rola w firmie to: ${role}.

Chciałbym/Chciałabym dowiedzieć się więcej o tym, jak Państwa rozwiązanie może pomóc nam w następujących obszarach lub rozwiązać problemy:
"${usage}"

Proszę o kontakt w celu umówienia terminu prezentacji.
Mój firmowy adres e-mail to: ${email}

Z poważaniem,
[Proszę uzupełnić podpis lub pozostawić do automatycznego uzupełnienia]`;


    // --- Modal Control ---
    const handleOpenDemoModal = () => {
        // Reset state on open
        setDemoStep(1);
        setUserRole('');
        setDemoUsage('');
        setCompanyEmail('');
        setEmailError('');
        setIsEditing(false);
        setDemoModalOpen(true);
    };

    const handleCloseDemoModal = () => {
        setDemoModalOpen(false);
    };

    // --- Step 1: Submit User Info ---
    const handleSubmitInfo = () => {
        if (!userRole || !demoUsage) {
            alert('Proszę wypełnić oba pola.');
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            const interpretationText = `Rozumiem, że jako <strong>${userRole}</strong>, chcesz rozwiązać problem: <strong>"${demoUsage}"</strong> przy użyciu Agenta Lean AI. Skupimy się na pokazaniu, jak nasze narzędzie może zautomatyzować analizę danych w tym kontekście.`;
            setAiInterpretation(interpretationText);
            setDemoStep(2);
            setIsLoading(false);
        }, 1500);
    };

    // --- Step 2: Handle AI Interpretation ---
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            // Focus the div when editing starts
            setTimeout(() => interpretationBoxRef.current?.focus(), 0);
        } else {
            // Save content when editing stops
            setAiInterpretation(interpretationBoxRef.current.innerHTML);
        }
    };
    
    const handleAcceptInterpretation = () => {
        let finalInterpretation = aiInterpretation;
        if(isEditing) {
            finalInterpretation = interpretationBoxRef.current.innerHTML;
            setAiInterpretation(finalInterpretation);
            setIsEditing(false);
        }

        // Generate email preview
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = finalInterpretation;
        const plainText = tempDiv.innerText || tempDiv.textContent || "";
        setEmailPreview(generateEmailBody('Agent Lean AI', userRole, plainText, '[Twój Adres E-mail]'));

        setDemoStep(3);
    };

    // --- Step 3: Handle Email and Proceed ---
    const handleProceed = () => {
        if (!isValidCorporateEmail(companyEmail)) {
            setEmailError('Proszę podać poprawny, firmowy adres e-mail.');
            return;
        }
        setEmailError('');
        setIsLoading(true);
        console.log("Sending Request:", { product: "Agent Lean AI", userRole, demoUsage, companyEmail });
        setTimeout(() => {
            setIsLoading(false);
            setDemoStep(4);
        }, 1000);
    };
    
    // Update email preview as user types their email
    useEffect(() => {
        if(demoStep === 3) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = aiInterpretation;
            const plainText = tempDiv.innerText || tempDiv.textContent || "";
            setEmailPreview(generateEmailBody('Agent Lean AI', userRole, plainText, companyEmail || '[Twój Adres E-mail]'));
        }
    }, [companyEmail, demoStep, aiInterpretation, userRole]);

    // If auth is loading or the user is authorized, show a spinner to prevent the page from flashing
    if (authLoading || (user && claims?.hasLeanAiAgentAccess)) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Spinner />
            </div>
        );
    }

    return (
        <div className="main-container">
            {/* NEW HERO SECTION */}
            <section className="hero-section">
                <h1 className="main-headline">
                    Rewolucjonizuj Analizę Danych w Przemyśle z <span className="highlight">Agent Lean AI</span>
                </h1>
                <p className="sub-headline">
                    Odkryj moc predykcyjnej analityki, zoptymalizuj wydajność i bezproblemowo zintegruj cyfrowego bliźniaka. Agent Lean AI to Twój klucz do inteligentnej transformacji.
                </p>
                <button id="productPageCTA" className="cta-button" onClick={handleOpenDemoModal}>
                    Poproś o Demo
                    <CtaArrowIcon />
                </button>
            </section>

            {/* --- EXISTING SECTIONS ARE PRESERVED BELOW --- */}

            <section className="content-section scroll-animate">
                <h2 className="section-title">Kluczowe Możliwości</h2>
                <p className="section-subtitle">Agent Lean AI dostarcza kompleksowe narzędzia, które przekształcają dane w strategiczne aktywa dla Twojej firmy.</p>
                <div className="grid-container"> 
                    <div className="card">
                        <div className="card-icon-wrapper">
                             <svg className="card-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                        </div>
                        <h3 className="card-title">Zaawansowana Analityka AI</h3>
                        <p className="card-description">Wykorzystaj algorytmy uczenia maszynowego do głębokiej analizy danych CSV, identyfikacji wzorców, predykcji trendów i wykrywania anomalii z niespotykaną dotąd precyzją.</p>
                    </div>
                    <div className="card">
                        <div className="card-icon-wrapper">
                             <svg className="card-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" /></svg>
                        </div>
                        <h3 className="card-title">Integracja z Digital Twin</h3>
                        <p className="card-description">Płynnie łącz analizy z modelem Witness Digital Twin. Symuluj wpływ zmian, testuj hipotezy i optymalizuj operacje w wirtualnym środowisku przed wdrożeniem.</p>
                    </div>
                    <div className="card">
                        <div className="card-icon-wrapper">
                             <svg className="card-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>
                        </div>
                        <h3 className="card-title">Optymalizacja Wydajności</h3>
                        <p className="card-description">Identyfikuj wąskie gardła, usprawniaj przepływy pracy i maksymalizuj produktywność dzięki konkretnym, opartym na danych rekomendacjom generowanym przez AI.</p>
                    </div>
                </div>
            </section>

            <section className="content-section scroll-animate">
                <h2 className="section-title">Dlaczego Agent Lean AI?</h2>
                 <p className="section-subtitle">Wybierz partnera, który rozumie wyzwania nowoczesnego przemysłu i dostarcza realne rozwiązania.</p>
                <div className="grid-container">
                    <div className="card">
                        <div className="card-icon-wrapper">
                             <svg className="card-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="card-title">Szybkość i Precyzja</h3>
                        <p className="card-description">Otrzymuj wnikliwe analizy w rekordowym czasie, umożliwiając szybkie podejmowanie decyzji i reagowanie na dynamiczne zmiany rynkowe.</p>
                    </div>
                    <div className="card">
                        <div className="card-icon-wrapper">
                             <svg className="card-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
                        </div>
                        <h3 className="card-title">Intuicyjny Interfejs</h3>
                        <p className="card-description">Korzystaj z platformy zaprojektowanej z myślą o użytkowniku – łatwej w nawigacji, przejrzystej i dostarczającej informacje w przystępny sposób.</p>
                    </div>
                    <div className="card">
                        <div className="card-icon-wrapper">
                             <svg className="card-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622A11.99 11.99 0 0018.402 6a11.959 11.959 0 01-2.047-2.786A11.959 11.959 0 0012 2.75c-2.118 0-4.04.57-5.654 1.514z" /></svg>
                        </div>
                        <h3 className="card-title">Bezpieczeństwo Danych</h3>
                        <p className="card-description">Twoje dane są chronione najwyższymi standardami bezpieczeństwa, zapewniając poufność i integralność na każdym etapie analizy.</p>
                    </div>
                </div>
            </section>

            <section className="content-section scroll-animate">
                <h2 className="section-title">Często Zadawane Pytania (FAQ)</h2>
                <p className="section-subtitle">Masz pytania? Znajdź odpowiedzi poniżej lub skontaktuj się z nami.</p>
                <div className="faq-container">
                    <FaqItem question="Jakie dane mogę analizować za pomocą Agent Lean AI?">
                        <p>Agent Lean AI jest zoptymalizowany do analizy danych tabelarycznych, przede wszystkim w formacie CSV. Idealnie nadaje się do przetwarzania danych produkcyjnych, logów maszyn, wskaźników jakości, danych telemetrycznych i innych zbiorów danych typowych dla środowisk przemysłowych.</p>
                    </FaqItem>
                    <FaqItem question="Czy potrzebuję specjalistycznej wiedzy technicznej, aby korzystać z platformy?">
                         <p>Staraliśmy się, aby Agent Lean AI był jak najbardziej intuicyjny. Podstawowa obsługa nie wymaga zaawansowanej wiedzy programistycznej. Interfejs użytkownika prowadzi przez proces analizy, a wyniki są prezentowane w przystępny sposób. Jednakże, pełne wykorzystanie potencjału integracji z Digital Twin może wymagać pewnej wiedzy domenowej.</p>
                    </FaqItem>
                    <FaqItem question="Jak wygląda proces integracji z Witness Digital Twin?">
                        <p>Integracja z Witness Digital Twin odbywa się poprzez bezpieczne połączenie API. Agent Lean AI może wysyłać przetworzone dane i wyniki analiz do Twojego modelu Digital Twin, a także pobierać dane symulacyjne. Szczegółowa konfiguracja zależy od specyfiki Twojego modelu Witness, a nasz zespół wsparcia jest gotowy pomóc w tym procesie.</p>
                    </FaqItem>
                     <FaqItem question="Jakie są główne korzyści z wdrożenia Agent Lean AI?">
                        <p>Główne korzyści to: znaczące skrócenie czasu potrzebnego na analizę danych, identyfikacja ukrytych możliwości optymalizacyjnych, redukcja kosztów operacyjnych, poprawa jakości produkcji, lepsze zrozumienie procesów oraz możliwość podejmowania decyzji opartych na precyzyjnych danych i symulacjach.</p>
                    </FaqItem>
                </div>
            </section>

            <p className="footer-text">
                &copy; 2024-2025 Advanced Manufacturing Consulting. Wszelkie prawa zastrzeżone. Stworzone z pasją do innowacji.
            </p>

            {/* NEW MODAL LOGIC AND JSX */}
            {isDemoModalOpen && (
                <div id="productDemoModal" className="modal-overlay active">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title" id="productModalTitle">
                                {demoStep === 1 && "Zapytanie o Demo: Agent Lean AI"}
                                {demoStep === 2 && "Weryfikacja Zrozumienia"}
                                {demoStep === 3 && "Podsumowanie i Kontakt"}
                                {demoStep === 4 && "Dziękujemy!"}
                            </h2>
                            <button id="closeProductModalBtn" className="modal-close-btn" onClick={handleCloseDemoModal}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {/* Step 1: User Input */}
                            {demoStep === 1 && (
                                <div id="productStep1" className="modal-step active">
                                    <p>Aby lepiej przygotować dla Ciebie demo Agent Lean AI, opowiedz nam trochę o sobie i swoich oczekiwaniach.</p>
                                    <div>
                                        <label htmlFor="productUserRole" className="form-label">Twoja rola w firmie:</label>
                                        <input type="text" id="productUserRole" className="form-input" placeholder="Np. Kierownik Produkcji, Analityk Danych" value={userRole} onChange={(e) => setUserRole(e.target.value)} />
                                    </div>
                                    <div>
                                        <label htmlFor="productDemoUsage" className="form-label">Jak planujesz wykorzystać Agent Lean AI? Jakie problemy chcesz rozwiązać?</label>
                                        <textarea id="productDemoUsage" className="form-textarea" placeholder="Opisz krótko swoje cele i wyzwania..." value={demoUsage} onChange={(e) => setDemoUsage(e.target.value)}></textarea>
                                    </div>
                                    <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
                                        <button id="submitProductInfoBtn" className="modal-btn modal-btn-primary" onClick={handleSubmitInfo} disabled={isLoading}>
                                            {isLoading ? <Spinner /> : <span>Wyślij i zobacz interpretację AI</span>}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: AI Interpretation */}
                            {demoStep === 2 && (
                                <div id="productStep2" className="modal-step active">
                                    <p>Dziękujemy! Oto jak nasza AI zinterpretowała Twoje potrzeby dotyczące Agent Lean AI. Możesz edytować ten tekst, aby go doprecyzować.</p>
                                    <div
                                        id="productAiInterpretationText"
                                        ref={interpretationBoxRef}
                                        className={`interpretation-box ${isEditing ? 'is-editing' : ''}`}
                                        contentEditable={isEditing}
                                        dangerouslySetInnerHTML={{ __html: aiInterpretation }}
                                        onBlur={(e) => { if(isEditing) setAiInterpretation(e.target.innerHTML); }}
                                    ></div>
                                    <div className="modal-footer">
                                        <button id="editInterpretationBtn" className="modal-btn modal-btn-secondary" onClick={handleEditToggle}>
                                            <span>{isEditing ? 'Zapisz' : 'Edytuj'}</span>
                                        </button>
                                        <button id="acceptProductInterpretationBtn" className="modal-btn modal-btn-primary" onClick={handleAcceptInterpretation} style={{display: isEditing ? 'none' : 'inline-flex'}}>
                                            Tak, zgadza się!
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Email Input & Preview */}
                            {demoStep === 3 && (
                                 <div id="productStep3" className="modal-step active">
                                    <p>Prosimy o podanie firmowego adresu e-mail oraz weryfikację/edycję treści wiadomości, która zostanie do nas wysłana.</p>
                                    <div>
                                        <label htmlFor="productCompanyEmail" className="form-label">Firmowy adres e-mail:</label>
                                        <input type="email" id="productCompanyEmail" className="form-input" placeholder="np. jan.kowalski@twojafirma.pl" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
                                    </div>
                                    <div>
                                        <label htmlFor="productEmailPreview" className="form-label">Podgląd wiadomości e-mail (możesz edytować):</label>
                                        <textarea id="productEmailPreview" className="form-textarea" value={emailPreview} onChange={(e) => setEmailPreview(e.target.value)}></textarea>
                                    </div>
                                    {emailError && <div id="productEmailValidationError" className="login-error" style={{textAlign: 'left'}}>{emailError}</div>}
                                      <div className="modal-footer">
                                        <button id="approveAndProceedBtn" className="modal-btn modal-btn-primary" onClick={handleProceed} disabled={isLoading}>
                                            {isLoading ? <Spinner /> : 'Zatwierdź i przejdź do kalendarza'}
                                        </button>
                                      </div>
                                  </div>
                            )}

                            {/* Step 4: Final Confirmation */}
                            {demoStep === 4 && (
                                <div id="productStep4" className="modal-step active">
                                    <div className="final-step-container">
                                        <div className="success-icon"><SuccessIcon /></div>
                                        <h3>Dziękujemy!</h3>
                                        <p>Twoje zapytanie zostało wysłane. Wybierz preferowany następny krok, aby kontynuować.</p>
                                        <div className="action-grid">
                                            <a href="https://calendly.com/twojlink" target="_blank" rel="noopener noreferrer" className="action-card">
                                                <div className="action-card-icon"><CalendarIcon /></div>
                                                <div>
                                                    <div className="action-card-title">Umów rozmowę</div>
                                                    <div className="action-card-desc">Wybierz dogodny termin na prezentację w naszym kalendarzu.</div>
                                                </div>
                                            </a>
                                            <a href="https://www.linkedin.com/in/twoj-ceo-profil/" target="_blank" rel="noopener noreferrer" className="action-card">
                                                <div className="action-card-icon"><LinkedInIcon /></div>
                                                <div>
                                                    <div className="action-card-title">Kontakt strategiczny</div>
                                                    <div className="action-card-desc">Porozmawiaj z CEO o wdrożeniach na dużą skalę lub partnerstwie.</div>
                                                </div>
                                            </a>
                                        </div>
                                        <div className="modal-footer" style={{ border: 'none', paddingTop: 0, marginTop: '1.5rem', justifyContent: 'center' }}>
                                            <button id="finishProductModalBtn" className="modal-btn modal-btn-secondary" onClick={handleCloseDemoModal}>Zakończ</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentLeanAILandingPage