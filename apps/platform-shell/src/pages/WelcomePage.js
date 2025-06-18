import React, { useState, useEffect, useRef } from 'react';

// --- Reusable Icon Components for this page ---

const DigitalTwinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3m16.5 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z" /></svg>;
const AIAgentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-7.5h10.5a2.25 2.25 0 002.25-2.25V8.25a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 8.25v3.5A2.25 2.25 0 006.75 14.25z" /></svg>;
const TrainingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>;
const Spinner = () => <div className="spinner-modal"></div>;

const WelcomePage = () => {
    // State for the modals
    const [isContactModalOpen, setContactModalOpen] = useState(false);
    const [isRecModalOpen, setRecModalOpen] = useState(false);
    
    // State for Recommendation Modal
    const [recStep, setRecStep] = useState(1);
    const [recCategory, setRecCategory] = useState('');
    const [recRole, setRecRole] = useState('');
    const [recProblem, setRecProblem] = useState('');
    const [isRecLoading, setRecLoading] = useState(false);
    
    // State for Contact Modal
    const [contactStep, setContactStep] = useState(1);
    const [contactRole, setContactRole] = useState('');
    const [contactUsage, setContactUsage] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [isContactLoading, setContactLoading] = useState(false);
    const [interpretation, setInterpretation] = useState('');
    const [emailPreview, setEmailPreview] = useState('');
     const [emailError, setEmailError] = useState('');

    // --- Scroll Animation Logic ---
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
        handleScrollAnimation(); // Trigger on mount
        return () => window.removeEventListener("scroll", handleScrollAnimation);
    }, []);
    
    // --- Recommendation Modal Logic ---
    const handlePathButtonClick = (path, title) => {
        setRecCategory(path);
        setRecStep(1);
        setRecRole('');
        setRecProblem('');
        setRecModalOpen(true);
    };

    const handleFindSolution = () => {
        if (!recRole || !recProblem) {
            alert('Please fill in both fields.');
            return;
        }
        setRecLoading(true);
        setRecStep(2);
        // Simulate API call
        setTimeout(() => {
            setRecLoading(false);
        }, 1500);
    };
    
    // --- Contact Modal Logic ---
    const handleGetStarted = () => {
        setContactStep(1);
        setContactRole('');
        setContactUsage('');
        setContactEmail('');
        setEmailError('');
        setContactModalOpen(true);
    };
    
    const handleSubmitContactInfo = () => {
        if (!contactRole || !contactUsage) {
            alert('Please fill in both fields.');
            return;
        }
        setContactLoading(true);
        setContactStep(2);
        // Simulate AI analysis
        setTimeout(() => {
            const generatedInterpretation = `As a <strong>${contactRole}</strong>, you want to solve the problem: <strong>${contactUsage}</strong>. Our goal will be to show you how our tools can help with this.`;
            setInterpretation(generatedInterpretation);
            setContactLoading(false);
        }, 1500);
    };

    const handleAcceptInterpretation = () => {
        setContactStep(3);
        const plainText = document.createElement("div");
        plainText.innerHTML = interpretation;
        const generatedEmail = `Dear Sir/Madam,\n\nAs a ${contactRole}, I am interested in a demonstration of your platform. I would like to discuss how you can help in the context of:\n\n"${plainText.textContent || ""}"\n\nPlease contact me.\n\nSincerely,`;
        setEmailPreview(generatedEmail);
    };

    const handleProceedToCalendar = () => {
         const freeEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
         const isValidCorporateEmail = (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) return false;
            const domain = email.split('@')[1];
            return !freeEmailDomains.includes(domain.toLowerCase());
        };

        if (!isValidCorporateEmail(contactEmail)) {
            setEmailError("Please provide a valid corporate email address.");
            return;
        }
        setEmailError('');
        setContactLoading(true);
        setTimeout(() => {
            setContactLoading(false);
            setContactStep(4);
        }, 1500);
    };


    return (
        <div className="main-container">
            {/* Hero Section */}
            <section className="hero-section-platform">
                <h1 className="platform-headline">Unleash Your Company's Potential with the <span className="highlight">AMC Platform</span></h1>
                <p className="platform-subheadline">Transform data into strategic decisions, automate processes with intelligent agents, and develop your team's skills. Complete solutions for modern industry.</p>
                <button id="getStartedFreeBtn" className="platform-cta-button" onClick={handleGetStarted}>Get Started for Free</button>
            </section>

            {/* Choose Path Section */}
            <section className="choose-path-section scroll-animate">
                <h2 className="choose-path-title">Choose Your Path</h2>
                <p className="choose-path-subtitle">Select an area of interest to discover tailored solutions or start exploring the possibilities.</p>
                <div className="path-buttons-container">
                    <button className="path-button" data-path="digital-twins" onClick={() => handlePathButtonClick('digital-twins', 'Digital Twins')}>
                        <DigitalTwinIcon />
                        Digital Twins
                        <span className="path-button-description">Visualize & Optimize</span>
                    </button>
                    <button className="path-button" data-path="ai-agents" onClick={() => handlePathButtonClick('ai-agents', 'AI Agents')}>
                        <AIAgentIcon />
                        AI Agents
                        <span className="path-button-description">Automate & Analyze</span>
                    </button>
                    <button className="path-button" data-path="training" onClick={() => handlePathButtonClick('training', 'Training')}>
                        <TrainingIcon />
                        Training
                        <span className="path-button-description">Develop Skills</span>
                    </button>
                </div>
            </section>
            
            <p className="footer-text">&copy; 2024-2025 Advanced Manufacturing Consulting. All rights reserved. Created with a passion for innovation.</p>
        
            {/* Recommendation Modal */}
            {isRecModalOpen && (
                <div className="modal-overlay active">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">Recommendation for: {recCategory.replace('-', ' ')}</h2>
                            <button className="modal-close-btn" onClick={() => setRecModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                           {recStep === 1 && (
                               <div className="modal-step active">
                                    <p>Describe your role and the problem, and our agent will find the best solution for you.</p>
                                    <div>
                                        <label htmlFor="recUserRole" className="form-label">Your role in the company:</label>
                                        <input type="text" id="recUserRole" className="form-input" placeholder="E.g., Maintenance Manager" value={recRole} onChange={e => setRecRole(e.target.value)} />
                                    </div>
                                    <div>
                                        <label htmlFor="recProblemDescription" className="form-label">Describe the problem or goal:</label>
                                        <textarea id="recProblemDescription" className="form-textarea" placeholder="E.g., 'Frequent, unplanned downtime of a key machine'" value={recProblem} onChange={e => setRecProblem(e.target.value)}></textarea>
                                    </div>
                                    <div className="modal-footer">
                                        <button className="modal-btn modal-btn-primary" onClick={handleFindSolution} disabled={isRecLoading}>
                                            {isRecLoading ? <Spinner /> : 'Find Solution'}
                                        </button>
                                    </div>
                                </div>
                           )}
                           {recStep === 2 && (
                                <div className="modal-step active">
                                    {isRecLoading ? (
                                        <p className="agent-thinking">Agent is analyzing...<span>.</span><span>.</span><span>.</span></p>
                                    ) : (
                                        <p>Display recommendation results here...</p> 
                                    )}
                                     <div className="modal-footer" style={{justifyContent: 'space-between'}}>
                                        <button onClick={() => setRecStep(1)} className="modal-btn modal-btn-secondary">Back</button>
                                        <button onClick={() => alert("Contact Requested")} className="modal-btn modal-btn-primary">Request Contact</button>
                                    </div>
                                </div>
                           )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Contact Modal */}
            {isContactModalOpen && (
                 <div className="modal-overlay active">
                    <div className="modal-content">
                         <div className="modal-header">
                            <h2 className="modal-title">Let's Talk About Your Needs</h2>
                            <button className="modal-close-btn" onClick={() => setContactModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {contactStep === 1 && (
                                <div className="modal-step active">
                                    <p>To help the AI agent accurately interpret your needs, describe your role in the company and the key challenges you want to solve.</p>
                                    <div><label htmlFor="userRole" className="form-label">Your role in the company:</label><input type="text" id="userRole" className="form-input" placeholder="E.g., Operations Director" value={contactRole} onChange={e => setContactRole(e.target.value)} /></div>
                                    <div><label htmlFor="demoUsage" className="form-label">What goals or problems do you want to solve with our help?</label><textarea id="demoUsage" className="form-textarea" placeholder="Describe your goals..." value={contactUsage} onChange={e => setContactUsage(e.target.value)}></textarea></div>
                                    <div className="modal-footer"><button className="modal-btn modal-btn-primary" onClick={handleSubmitContactInfo} disabled={isContactLoading}>{isContactLoading ? <Spinner/> : "Submit for AI Analysis"}</button></div>
                                </div>
                            )}
                            {contactStep === 2 && (
                                <div className="modal-step active">
                                     {isContactLoading ? (
                                        <p className="agent-thinking">Analyzing...<span>.</span><span>.</span><span>.</span></p>
                                    ) : (
                                        <>
                                            <p>The AI agent has analyzed your request. Here is its interpretation. You can edit it if you want to clarify anything.</p>
                                            <div className="interpretation-box" dangerouslySetInnerHTML={{ __html: interpretation }}></div>
                                            <p>Does this interpretation accurately reflect your expectations?</p>
                                        </>
                                    )}
                                    <div className="modal-footer">
                                        <button className="modal-btn modal-btn-secondary" onClick={() => setContactStep(1)}>Back</button>
                                        <button className="modal-btn modal-btn-primary" onClick={handleAcceptInterpretation}>Yes, that's correct</button>
                                    </div>
                                </div>
                            )}
                            {contactStep === 3 && (
                                <div className="modal-step active">
                                    <p>Excellent. Please provide your corporate email address. The agent will prepare a personalized inquiry message that you can review and edit below.</p>
                                    <div><label htmlFor="companyEmail" className="form-label">Corporate email address:</label><input type="email" id="companyEmail" className="form-input" placeholder="john.doe@yourcompany.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} /></div>
                                    <div><label htmlFor="emailPreview" className="form-label">Generated message content (you can edit):</label><textarea id="emailPreview" className="form-textarea" value={emailPreview} onChange={e => setEmailPreview(e.target.value)} style={{minHeight: '150px'}}></textarea></div>
                                    {emailError && <div className="text-red-400 text-sm mt-2 mb-3">{emailError}</div>}
                                    <div className="modal-footer">
                                        <button className="modal-btn modal-btn-primary" onClick={handleProceedToCalendar} disabled={isContactLoading}>{isContactLoading ? <Spinner /> : "Approve and proceed"}</button>
                                    </div>
                                </div>
                            )}
                            {contactStep === 4 && (
                                 <div className="modal-step active">
                                    <div className="final-step-container">
                                        <div className="success-icon"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg></div>
                                        <h3>Thank you!</h3>
                                        <p>Your inquiry has been processed. Please choose your preferred next step.</p>
                                        <div className="action-grid">
                                            <a href="https://calendly.com/yourlink" target="_blank" rel="noopener noreferrer" className="action-card">
                                                <div className="action-card-icon">{/* Calendar Icon */}</div>
                                                <div><div className="action-card-title">Schedule a Call</div><div className="action-card-desc">Choose a convenient time in our calendar.</div></div>
                                            </a>
                                            <a href="https://www.linkedin.com/in/your-ceo-profile/" target="_blank" rel="noopener noreferrer" className="action-card">
                                                <div className="action-card-icon">{/* LinkedIn Icon */}</div>
                                                <div><div className="action-card-title">Strategic Contact</div><div className="action-card-desc">Talk to the CEO about partnerships.</div></div>
                                            </a>
                                        </div>
                                        <div className="modal-footer" style={{border:'none', paddingTop:0, marginTop:'1.5rem', justifyContent:'center'}}>
                                            <button className="modal-btn modal-btn-secondary" onClick={() => setContactModalOpen(false)}>Finish</button>
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

export default WelcomePage;
