/**
 * @fileoverview The main landing page component for the cross-analyzer.
 * MERGED VERSION: This component combines the original, full-featured UI/UX with the
 * new, secure, and asynchronous backend architecture.
 */
import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

// Import shared services and contexts from the monorepo structure
import { storage } from '../../firebase-helpers/client';
import { AuthContext } from '@amc-platfrom/shared-contexts';

// Import local components and services
import NewStyledButton from '../UI/NewStyledButton';
import NewWitnessModal from '../Modals/NewWitnessModal';
import AnalysisNameModal from '../Modals/AnalysisNameModal';
import apiClient from '../../services/apiClient'; // Using the updated apiClient
import { useToast } from '../../contexts/ToastContext'; // Using modern toast for consistency

// SVG Paths from original for UI consistency
const UploadIconPath = "M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 10.5a2.25 2.25 0 002.25 2.25c1.004 0 1.875-.694 2.148-1.683A5.25 5.25 0 0112 6.75c2.118 0 3.906 1.226 4.602 3.017.273.989 1.144 1.683 2.148 1.683A2.25 2.25 0 0021 10.5M3 16.5v-6M21 16.5v-6";
const AnalyzeIconPath = "M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75";
const BrowseIconPath = "M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776";
const WitnessIconPath = "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244";


const MainMenuCrossAnalyzer = () => {
    // State from original component
    const [selectedFile, setSelectedFile] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState('info');
    const [isLoading, setIsLoading] = useState(false);
    const [isWitnessModalOpen, setIsWitnessModalOpen] = useState(false);
    const [fileInputButtonLabel, setFileInputButtonLabel] = useState('Wybierz plik z danymi');
    const [analyzeButtonCueClass, setAnalyzeButtonCueClass] = useState('');
    const [isLogoVisible, setIsLogoVisible] = useState(false);
    const [isAnalysisNameModalOpen, setIsAnalysisNameModalOpen] = useState(false);
    const [initialModalAnalysisName, setInitialModalAnalysisName] = useState('');
    
    const csvFileInputRef = useRef(null);
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate(); // Using navigate hook from react-router-dom
    const { showToast } = useToast();

    useEffect(() => {
        const timer = setTimeout(() => { setIsLogoVisible(true); }, 300);
        return () => clearTimeout(timer);
    }, []);
    
    // Using modern toast for user feedback, but keeping internal status for multi-step processes
    const showAppStatusMessage = (message, type = 'info') => {
        setStatusMessage(message);
        setStatusType(type);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            const displayFileName = file.name.length > 25 ? `${file.name.substring(0, 22)}...` : file.name;
            setFileInputButtonLabel(displayFileName);
            showToast(`Wybrano plik: ${file.name}`, 'success');
            setInitialModalAnalysisName(file.name.replace(/\.[^/.]+$/, ""));
            setAnalyzeButtonCueClass('analyze-cue'); // Trigger animation
            setTimeout(() => setAnalyzeButtonCueClass(''), 1400);
        } else {
            setSelectedFile(null);
            setFileInputButtonLabel('Wybierz plik z danymi');
            setInitialModalAnalysisName('');
        }
        if (csvFileInputRef.current) {
            csvFileInputRef.current.value = "";
        }
    };

    const handleAnalyzeFileClick = () => {
        if (!currentUser) {
            showToast('Proszę się zalogować, aby rozpocząć analizę.', 'error');
            return;
        }
        if (!selectedFile) {
            showToast('Proszę wybrać plik z danymi.', 'error');
            return;
        }
        setIsAnalysisNameModalOpen(true);
    };

    // This function now implements the NEW asynchronous flow
    const processAnalysisWithName = async (analysisName) => {
        setIsAnalysisNameModalOpen(false);
        if (!selectedFile || !currentUser) {
            showToast('Błąd: Plik lub użytkownik nie jest już dostępny.', 'error');
            return;
        }

        setIsLoading(true);
        const analysisId = uuidv4();
        const originalFileName = selectedFile.name;
        const userId = currentUser.uid;

        try {
            showAppStatusMessage(`Krok 1/2: Wysyłanie pliku ${originalFileName}...`, 'info');
            const storagePath = `raw_csvs/${analysisId}/${originalFileName}`;
            const storageRef = ref(storage, storagePath);
            await uploadBytes(storageRef, selectedFile);
            
            showAppStatusMessage(`Krok 2/2: Inicjowanie analizy "${analysisName}"...`, 'info');
            
            // Calling the NEW backend function
            const result = await apiClient.requestAnalysis({ analysisId, originalFileName, analysisName, userId });

            if (result.data.success) {
                showAppStatusMessage(`Analiza rozpoczęta! Przekierowuję do pulpitu...`, 'success');
                setTimeout(() => {
                    navigate(`/dashboard/${result.data.analysisId}`);
                }, 1500);
            } else {
                throw new Error(result?.data?.message || 'Nie udało się zainicjować analizy.');
            }
        } catch (error) {
            showAppStatusMessage(`Błąd krytyczny: ${error.message || 'Nie udało się rozpocząć procesu.'}`, 'error');
            showToast(`Error: ${error.message}`, 'error');
            setIsLoading(false);
        }
    };
    
    const handleBrowseAnalyses = () => {
         if (!currentUser) {
            showToast('Proszę się zalogować, aby przeglądać analizy.', 'error');
            return;
        }
        navigate('/dashboard'); // Navigate to the general dashboard/list view
    };

    const handleWitnessButtonClick = () => {
        setIsWitnessModalOpen(true);
    };
    
    const isDisabled = !currentUser || isLoading;

    return (
        <div className="new-landing-page-body-wrapper">
            <div className="analyzer-card">
                <div className="analyzer-card-header">
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/csv-data-analyzer-e3207.firebasestorage.app/o/Twinn%20Agent%20AI.png?alt=media&token=08be442b-f6fb-4a00-9993-1fd3be2ddab7"
                        alt="Twinn Agent AI - Twinn Witness Logo"
                        className={`header-logo-img ${isLogoVisible ? 'logo-visible' : 'logo-hidden'}`}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x75/334155/CBD5E1?text=Logo+Error'; e.target.alt = 'Błąd ładowania logo'; }}
                    />
                </div>
                <p className="analyzer-subtitle">Zwiększ efektywność z Agent Lean AI. Analizuj dane lub przeglądaj gotowe raporty.</p>
                <input type="file" id="csvFileInput" accept=".csv" style={{ display: 'none' }} ref={csvFileInputRef} onChange={handleFileChange} disabled={isDisabled} />
                
                <NewStyledButton isFileInputLabel htmlFor="csvFileInput" id="fileSelectBtn" label={fileInputButtonLabel} variant="file-input" iconSvgPath={UploadIconPath} disabled={isDisabled} />
                <NewStyledButton id="analyzeFileBtn" label="Analizuj Plik" variant="primary" iconSvgPath={AnalyzeIconPath} onClick={handleAnalyzeFileClick} disabled={!selectedFile || isDisabled} isLoading={isLoading} loadingText="Przetwarzam..." className={analyzeButtonCueClass} />
                
                <div id="statusMessagesContainer">
                    {statusMessage && (<div className={`status-message status-${statusType}`}>{statusMessage}</div>)}
                </div>
                
                <div className="separator">LUB</div>

                <NewStyledButton id="browseAnalysesBtn" label="Przeglądaj Analizy" variant="secondary" iconSvgPath={BrowseIconPath} onClick={handleBrowseAnalyses} disabled={isDisabled} />
                <NewStyledButton id="witnessBtn" label="Połącz z Witness Digital Twin" variant="tertiary" iconSvgPath={WitnessIconPath} onClick={handleWitnessButtonClick} disabled={isDisabled} />
            </div>
            <p className="footer-text">&copy; 2024-2025 Advanced Manufacturing Consulting. Wszelkie prawa zastrzeżone.</p>
            
            <NewWitnessModal isOpen={isWitnessModalOpen} onClose={() => setIsWitnessModalOpen(false)} />
            <AnalysisNameModal isOpen={isAnalysisNameModalOpen} onClose={() => setIsAnalysisNameModalOpen(false)} onSubmit={processAnalysisWithName} initialName={initialModalAnalysisName} showMessage={showToast} />
        </div>
    );
};

export default MainMenuCrossAnalyzer;