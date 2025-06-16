import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
    // This hook from react-router-dom allows programmatic navigation
    const navigate = useNavigate();

    // This effect runs once after the component mounts to set up event listeners
    useEffect(() => {
        // Since we are now in React, we manage modals with state, not direct DOM manipulation.
        // This logic would be moved to the parent component or a context that manages modals.
        // For this conversion, we'll just link the buttons to navigate.

        const getStartedFreeBtn = document.getElementById('getStartedFreeBtn');
        if (getStartedFreeBtn) {
            // Instead of opening a modal, this could navigate to a contact page or set modal state
            getStartedFreeBtn.addEventListener('click', () => alert("Contact modal would open here."));
        }
        
        const pathButtons = document.querySelectorAll('.path-button');
        pathButtons.forEach(button => {
            button.addEventListener('click', function() {
                const path = this.dataset.path;
                // Example of navigating to a product page
                if (path === 'ai-agents') {
                    navigate('/products/agent-lean-ai');
                } else {
                    alert(`Navigation to ${path} would happen here.`);
                }
            });
        });

        // Scroll animation logic can remain similar, but is often handled by libraries
        // like Framer Motion or Intersection Observer API in a more "React-way".
        const scrollElements = document.querySelectorAll(".scroll-animate");
        const handleScrollAnimation = () => {
            scrollElements.forEach((el) => {
                if (el.getBoundingClientRect().top <= (window.innerHeight || document.documentElement.clientHeight) / 1.15) {
                    el.classList.add("is-visible");
                }
            });
        };
        window.addEventListener("scroll", handleScrollAnimation);
        handleScrollAnimation(); // Trigger on load

        // Cleanup function to remove event listeners when the component unmounts
        return () => {
            window.removeEventListener("scroll", handleScrollAnimation);
            // Remove other listeners if necessary
        };
    }, [navigate]);


    // The component returns the JSX structure converted from your HTML
    return (
        <div className="main-container">
            <section className="hero-section-platform">
                <h1 className="platform-headline">
                    Uwolnij Potencjał Swojej Firmy z <span className="highlight">Platformą AMC</span>
                </h1>
                <p className="platform-subheadline">
                    Transformuj dane w strategiczne decyzje, automatyzuj procesy dzięki inteligentnym agentom i rozwijaj kompetencje swojego zespołu. Kompletne rozwiązania dla nowoczesnego przemysłu.
                </p>
                <button id="getStartedFreeBtn" className="platform-cta-button">Rozpocznij Bezpłatnie</button>
            </section>
            <section className="choose-path-section scroll-animate">
                <h2 className="choose-path-title">Wybierz Swoją Ścieżkę</h2>
                <p className="choose-path-subtitle">
                    Wybierz obszar, który Cię interesuje, aby odkryć dopasowane rozwiązania lub rozpocznij eksplorację możliwości.
                </p>
                <div className="path-buttons-container">
                    <button className="path-button" data-path="digital-twins">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3m16.5 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z" /></svg>
                        Digital Twins
                        <span className="path-button-description">Wizualizuj i optymalizuj</span>
                    </button>
                    <button className="path-button" data-path="ai-agents">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-7.5h10.5a2.25 2.25 0 002.25-2.25V8.25a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 8.25v3.5A2.25 2.25 0 006.75 14.25z" /></svg>
                        Agenty AI
                        <span className="path-button-description">Automatyzuj i analizuj</span>
                    </button>
                    <button className="path-button" data-path="training">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>
                        Szkolenia
                        <span className="path-button-description">Rozwijaj kompetencje</span>
                    </button>
                </div>
            </section>
            <p className="footer-text">
                &copy; 2024-2025 Advanced Manufacturing Consulting. Wszelkie prawa zastrzeżone. Stworzone z pasją do innowacji.
            </p>
        </div>
    );
};

export default WelcomePage;