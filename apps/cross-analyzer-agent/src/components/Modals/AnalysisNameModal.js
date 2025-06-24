import React, { useState, useEffect, useRef } from 'react';
import { useAnalysisContext } from '../../contexts/AnalysisContext';

const AnalysisNameModal = ({ isOpen, onClose, onSubmit, initialName = '', showMessage }) => {
    const [analysisName, setAnalysisName] = useState(initialName);
    const [nameError, setNameError] = useState('');
    const inputRef = useRef(null);
    const { userCreatedAnalyses } = useAnalysisContext();

    useEffect(() => {
        if (isOpen) {
            setAnalysisName(initialName);
            setNameError('');
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 100);
        }
    }, [isOpen, initialName]);
    
    const validateAnalysisName = (name) => {
        if (!name.trim()) {
            return 'Proszę podać nazwę analizy.';
        }
        
        const normalizedNewName = name.trim().toLowerCase();
        
        // --- OSTATECZNA POPRAWKA JEST TUTAJ ---
        // Sprawdzamy, czy `userCreatedAnalyses` istnieje.
        // Następnie dla każdego elementu `analysis` sprawdzamy, czy `analysis.analysisName` istnieje,
        // ZANIM wywołamy na nim .toLowerCase().
        const isDuplicate = userCreatedAnalyses && userCreatedAnalyses.some(
            analysis => analysis.analysisName && analysis.analysisName.toLowerCase() === normalizedNewName
        );
        // --- KONIEC POPRAWKI ---
        
        if (isDuplicate) {
            return 'Analiza o tej nazwie już istnieje. Proszę wybrać inną nazwę.';
        }
        
        return '';
    };

    const handleNameChange = (e) => {
        const newName = e.target.value;
        setAnalysisName(newName);
        // Walidacja na bieżąco jest dobra, ale błąd pojawia się, gdy userCreatedAnalyses nie jest jeszcze gotowe
        // lub zawiera niepoprawne dane. Sprawdzanie przy submicie jest bezpieczniejsze.
        if (nameError) {
            setNameError(validateAnalysisName(newName));
        }
    };
    
    const handleSubmit = () => {
        const error = validateAnalysisName(analysisName);
        if (error) {
            setNameError(error);
            if(showMessage) showMessage(error, 'error');
            return;
        }
        onSubmit(analysisName.trim());
        setAnalysisName(''); 
        setNameError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal active">
            <div className="modal-content">
                <h2 className="modal-title">Nazwa Analizy</h2>
                <p className="text-sm text-gray-400 mb-3">Podaj nazwę dla tej analizy, aby łatwiej ją później zidentyfikować.</p>
                <div className="relative">
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={analysisName}
                        onChange={handleNameChange}
                        onBlur={() => setNameError(validateAnalysisName(analysisName))} // Waliduj po utracie focusu
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                        className={`modal-input ${nameError ? 'border-red-500' : ''}`}
                        placeholder="Np. Analiza sprzedaży Q1"
                    />
                    {nameError && (
                        <p className="text-red-500 text-sm mt-1">{nameError}</p>
                    )}
                </div>
                <div className="modal-buttons">
                    <button onClick={onClose} className="modal-button modal-button-secondary">Anuluj</button>
                    <button 
                        onClick={handleSubmit} 
                        className="modal-button modal-button-primary"
                        disabled={!analysisName.trim()}
                    >
                        Rozpocznij Analizę
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnalysisNameModal;