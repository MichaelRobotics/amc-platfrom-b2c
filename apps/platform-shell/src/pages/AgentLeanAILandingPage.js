import React, { useState, useEffect } from 'react';

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
    // This effect runs once to handle scroll animations
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

    // The modal logic would be handled by a state variable and a separate Modal component in a real app
    const handleRequestDemo = () => {
        alert("This would open the intelligent lead generation modal for Agent Lean AI.");
    };

    return (
        <div className="main-container">
            <div className="logo-container">
                <img 
                    src="https://firebasestorage.googleapis.com/v0/b/csv-data-analyzer-e3207.firebasestorage.app/o/Twinn%20Agent%20AI.png?alt=media&token=08be442b-f6fb-4a00-9993-1fd3be2ddab7" 
                    alt="Agent Lean AI Logo" 
                    className="header-logo-img"
                    onError={(e) => {
                        e.onerror=null; 
                        e.target.src='https://placehold.co/300x75/111827/E2E8F0?text=Agent+Lean+AI&font=inter';
                        e.target.alt='Błąd ładowania logo Agent Lean AI';
                    }}
                />
            </div>

            <section className="hero-section">
                <h1 className="main-headline">
                    Rewolucjonizuj Analizę Danych w Przemyśle z <span className="highlight">Agent Lean AI</span>
                </h1>
                <p className="sub-headline">
                    Odkryj moc predykcyjnej analityki, zoptymalizuj wydajność i bezproblemowo zintegruj cyfrowego bliźniaka. Agent Lean AI to Twój klucz do inteligentnej transformacji.
                </p>
                <button onClick={handleRequestDemo} className="cta-button">
                    Poproś o Demo
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </button>
            </section>

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
        </div>
    );
};

export default AgentLeanAILandingPage;