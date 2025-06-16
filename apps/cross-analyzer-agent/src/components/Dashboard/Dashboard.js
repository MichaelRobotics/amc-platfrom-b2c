/**
 * @fileoverview The main Dashboard component.
 * CORRECTED: This version ensures no unnecessary calls to Firebase initialization
 * functions are present within the component's lifecycle hooks.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { firestore as db } from '../../services/firebase';
import Sidebar from './Sidebar';
import AnalysisContent from './AnalysisContent';
import Chat from './Chat';
import * as apiClient from '../../services/apiClient';

const Dashboard = ({ params, onNavigateToLanding }) => {
    const [analysisBlocksStore, setAnalysisBlocksStore] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [currentAnalysisIndex, setCurrentAnalysisIndex] = useState(0);
    const [currentDashboardContextTitle, setCurrentDashboardContextTitle] = useState("Moje Analizy");
    const [currentAnalysisId, setCurrentAnalysisId] = useState(null);
    const [currentTopicId, setCurrentTopicId] = useState(null);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [questionIdCounter, setQuestionIdCounter] = useState(0);
    const [monitoringStatus, setMonitoringStatus] = useState('initializing');
    const [monitoringMessage, setMonitoringMessage] = useState('Ładowanie dashboardu...');

    const formatBlockDataFromBackend = useCallback((backendBlockData, type = 'initial', analysisName = '', blockIdSuffix = null) => {
        if (!backendBlockData) return null;
        let questionText, findingsHeading, findingsContent, thoughtProcessContent, newSuggestionsContent, id;
        if (type === 'initial') {
            id = 'initial-analysis';
            questionText = analysisName || "Analiza Początkowa";
            findingsHeading = backendBlockData.initialFindings ? `Wyniki dla "${analysisName}"` : (backendBlockData.detailedFindings ? "Wynik" : "Analiza Początkowa");
            const hasInitialFindings = backendBlockData.initialFindings && backendBlockData.initialFindings.trim() !== "";
            const hasDetailedFindings = backendBlockData.detailedFindings && backendBlockData.detailedFindings.trim() !== "";
            findingsContent = hasInitialFindings ? backendBlockData.initialFindings : (hasDetailedFindings ? backendBlockData.detailedFindings : "<p>Brak danych.</p>");
            const hasThoughtProcess = backendBlockData.thoughtProcess && backendBlockData.thoughtProcess.trim() !== "";
            thoughtProcessContent = hasThoughtProcess ? backendBlockData.thoughtProcess : "<p>Brak danych.</p>";
            newSuggestionsContent = backendBlockData.questionSuggestions || [];
        } else {
            id = `analysis-q-${blockIdSuffix || Date.now()}`;
            questionText = backendBlockData.questionAsked || "Odpowiedź na pytanie";
            findingsHeading = "Wynik";
            const hasDetailedFindings = backendBlockData.detailedFindings && backendBlockData.detailedFindings.trim() !== "";
            findingsContent = hasDetailedFindings ? backendBlockData.detailedFindings : "<p>Brak danych.</p>";
            const hasSpecificThoughtProcess = backendBlockData.specificThoughtProcess && backendBlockData.specificThoughtProcess.trim() !== "";
            thoughtProcessContent = hasSpecificThoughtProcess ? backendBlockData.specificThoughtProcess : "<p>Brak danych.</p>";
            newSuggestionsContent = backendBlockData.followUpSuggestions || [];
        }
        return { id, titleForBlock: questionText, question: questionText, findingsHeading, findingsContent, thoughtProcessContent, newSuggestionsContent };
    }, []);

    const processAndSetBackendData = useCallback((topicData, analysisName) => {
        let blocks = [];
        let newChatMessages = [];
        let newQuestionIdCounter = 0;
        const initialBlockData = topicData.initialAnalysisResult;
        if (initialBlockData) {
            const formattedInitialBlock = formatBlockDataFromBackend(initialBlockData, 'initial', analysisName);
            if (formattedInitialBlock) blocks.push(formattedInitialBlock);
            newChatMessages.push({ sender: 'ai', text: initialBlockData.conciseInitialSummary || "Rozpoczęto analizę.", id: `msg-initial-${Date.now()}` });
        }
        if (topicData.chatHistory && Array.isArray(topicData.chatHistory)) {
            topicData.chatHistory.forEach(msg => {
                newChatMessages.push({ sender: msg.role === 'user' ? 'user' : 'ai', text: msg.parts[0]?.text || "", id: msg.messageId || `msg-${Date.now()}-${Math.random()}`});
                if (msg.role === 'model' && msg.detailedAnalysisBlock) {
                    newQuestionIdCounter++;
                    const formattedChatBlock = formatBlockDataFromBackend(msg.detailedAnalysisBlock, 'chat', analysisName, newQuestionIdCounter);
                    if (formattedChatBlock) blocks.push(formattedChatBlock);
                }
            });
        }
        setAnalysisBlocksStore(blocks);
        setChatMessages(newChatMessages);
        setQuestionIdCounter(newQuestionIdCounter);
        setCurrentAnalysisIndex(blocks.length > 0 ? blocks.length - 1 : 0);
    }, [formatBlockDataFromBackend]);

    useEffect(() => {
        const { analysisId, analysisName } = params;
        if (!analysisId) {
            setMonitoringStatus('error');
            setMonitoringMessage('Błąd: Brak ID analizy.');
            return;
        }

        setCurrentAnalysisId(analysisId);
        setCurrentDashboardContextTitle(analysisName);

        const unsubAnalysis = onSnapshot(doc(db, "analyses", analysisId), async (analysisDoc) => {
            if (!analysisDoc.exists()) {
                setMonitoringStatus('error');
                setMonitoringMessage(`Błąd: Analiza o ID ${analysisId} nie została znaleziona.`);
                return;
            }
            const analysisData = analysisDoc.data();
            switch (analysisData.status) {
                case 'processing_started':
                    setMonitoringMessage('Przetwarzanie pliku CSV...');
                    setMonitoringStatus('monitoring');
                    break;
                case 'preprocessing_data':
                    setMonitoringMessage('Analizowanie struktury danych...');
                    setMonitoringStatus('monitoring');
                    break;
                case 'error_processing':
                    setMonitoringStatus('error');
                    setMonitoringMessage(`Błąd przetwarzania: ${analysisData.errorMessage}`);
                    break;
                case 'ready_for_topic_analysis':
                    const topicsRef = collection(db, 'analyses', analysisId, 'topics');
                    const q = query(topicsRef, where("topicDisplayName", "==", analysisName));
                    const existingTopics = await getDocs(q);
                    if (existingTopics.empty) {
                        setMonitoringMessage('Tworzenie analizy początkowej...');
                        await addDoc(topicsRef, {
                            topicDisplayName: analysisName,
                            status: "analyzing",
                            createdAt: serverTimestamp(),
                            lastUpdatedAt: serverTimestamp(),
                        });
                    } else {
                         setMonitoringMessage('Oczekiwanie na wyniki analizy...');
                    }
                    break;
                default:
            }
        });

        const topicsQuery = query(collection(db, "analyses", analysisId, "topics"));
        const unsubTopics = onSnapshot(topicsQuery, (topicsSnapshot) => {
            if (topicsSnapshot.empty) return;
            const initialTopicDoc = topicsSnapshot.docs.find(doc => doc.data().topicDisplayName === analysisName);
            if (initialTopicDoc) {
                const topicData = initialTopicDoc.data();
                setCurrentTopicId(initialTopicDoc.id);
                switch (topicData.status) {
                    case 'analyzing':
                        setMonitoringMessage('Generowanie wniosków przez AI...');
                        setMonitoringStatus('monitoring');
                        break;
                    case 'error_analysis':
                        setMonitoringStatus('error');
                        setMonitoringMessage(`Błąd analizy AI: ${topicData.errorMessage}`);
                        break;
                    case 'completed':
                        setMonitoringStatus('ready');
                        processAndSetBackendData(topicData, analysisName);
                        break;
                    default:
                }
            }
        });

        return () => {
            unsubAnalysis();
            unsubTopics();
        };
    }, [params.analysisId, params.analysisName, processAndSetBackendData]);

    const handleSendMessage = async (messageText) => {
        if (!currentAnalysisId || !currentTopicId) {
            setChatMessages(prev => [...prev, {sender: 'ai', text: "Błąd: Kontekst analizy nie jest ustawiony.", id: `ctx-error-${Date.now()}`}]);
            return;
        }
        const userMessageId = `msg-user-${Date.now()}`;
        setChatMessages(prev => [...prev, { sender: 'user', text: messageText, id: userMessageId }]);
        setIsSendingMessage(true);
        const thinkingMessageId = `msg-ai-thinking-${Date.now()}`;
        setChatMessages(prev => [...prev, { sender: 'ai', text: `Agent analizuje: "${messageText.substring(0, 25)}..."`, id: thinkingMessageId }]);
        try {
            const response = await apiClient.chatOnTopic(currentAnalysisId, currentTopicId, messageText);
            setChatMessages(prev => prev.filter(msg => msg.id !== thinkingMessageId));
            if (response && response.success) {
                if (response.chatMessage?.parts?.[0]?.text) {
                    setChatMessages(prev => [...prev, { sender: 'ai', text: response.chatMessage.parts[0].text, id: response.chatMessage.messageId || `msg-ai-${Date.now()}` }]);
                }
                if (response.detailedBlock) {
                    const newQId = questionIdCounter + 1;
                    const newBlock = formatBlockDataFromBackend(response.detailedBlock, 'chat', currentDashboardContextTitle, newQId);
                    if (newBlock) {
                        setAnalysisBlocksStore(prevBlocks => {
                            const updatedBlocks = [...prevBlocks, newBlock];
                            setCurrentAnalysisIndex(updatedBlocks.length - 1);
                            return updatedBlocks;
                        });
                        setQuestionIdCounter(newQId);
                    }
                }
            } else {
                throw new Error(response?.message || "Nie udało się uzyskać odpowiedzi od agenta.");
            }
        } catch (error) {
            setChatMessages(prev => prev.filter(msg => msg.id !== thinkingMessageId));
            setChatMessages(prev => [...prev, { sender: 'ai', text: `Błąd odpowiedzi: ${error.message}`, id: `msg-ai-error-${Date.now()}` }]);
        } finally {
            setIsSendingMessage(false);
        }
    };
    
    return (
        <div id="dashboard-view-content" className="dashboard-view-wrapper">
            <Sidebar activeTopic={currentDashboardContextTitle} onNavigateToLanding={onNavigateToLanding} />
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                <div className="main-content-bg p-6 md:p-8">
                    <div className="title-and-navigation-container">
                        <h1 id="main-analysis-title-react" className="text-2xl md:text-3xl font-bold text-white">
                            {currentDashboardContextTitle}
                        </h1>
                        {analysisBlocksStore.length > 1 && (
                            <div className="analysis-navigation-arrows">
                                <button className="nav-arrow" onClick={() => setCurrentAnalysisIndex(prev => Math.max(0, prev - 1))} disabled={currentAnalysisIndex === 0}>&lt;</button>
                                <button className="nav-arrow" onClick={() => setCurrentAnalysisIndex(prev => Math.min(analysisBlocksStore.length - 1, prev + 1))} disabled={currentAnalysisIndex >= analysisBlocksStore.length - 1}>&gt;</button>
                            </div>
                        )}
                    </div>
                    {monitoringStatus !== 'ready' ? (
                        <div className="analysis-content-area text-center p-8 text-gray-400">
                           {monitoringStatus === 'error' ? `Błąd: ${monitoringMessage}` : monitoringMessage}
                        </div>
                    ) : (
                        <>
                            {analysisBlocksStore.length > 0 ? (
                                <AnalysisContent blocks={analysisBlocksStore} currentIndex={currentAnalysisIndex} />
                            ) : (
                                <div className="analysis-content-area text-center p-8 text-gray-400">Brak bloków analizy do wyświetlenia.</div>
                            )}
                            <Chat messages={chatMessages} onSendMessage={handleSendMessage} isSending={isSendingMessage} />
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;