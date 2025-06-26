// ========================================================================
// Plik: src/components/Dashboard/Dashboard.js
// Opis: Ostateczna, w pełni naprawiona wersja hybrydowego Dashboardu.
// Łączy dynamiczny, "blokowy" interfejs z nową, uporządkowaną
// architekturą Analiz i Tematów, z poprawioną logiką renderowania.
// ========================================================================
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, setDoc, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { firestore as db } from '@amc-platfrom/firebase-helpers';
import { useAuth } from '@amc-platfrom/shared-contexts';

import Sidebar from './Sidebar';
import AnalysisContent from './AnalysisContent';
import Chat from './Chat';
import apiClient from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import CustomMessage from '../UI/CustomMessage';

// Helper function to format backend data into displayable blocks.
const formatBlockDataFromBackend = (backendBlockData, type = 'initial', topicName = '') => {
    if (!backendBlockData) return null;
    let id, questionText, findingsContent, thoughtProcessContent, newSuggestionsContent;

    if (type === 'initial') {
        id = 'initial-analysis-block';
        questionText = backendBlockData.questionAsked || topicName || "Analiza Początkowa";
        findingsContent = backendBlockData.initialFindings || "<p>Brak szczegółowych wniosków.</p>";
        thoughtProcessContent = backendBlockData.thoughtProcess || "<p>Brak opisu procesu myślowego.</p>";
        newSuggestionsContent = backendBlockData.questionSuggestions || [];
    } else { // 'chat' type
        id = `chat-analysis-block-${Date.now()}`;
        questionText = backendBlockData.questionAsked || "Odpowiedź na pytanie";
        findingsContent = backendBlockData.detailedFindings || "<p>Brak szczegółowych wniosków.</p>";
        thoughtProcessContent = backendBlockData.specificThoughtProcess || "<p>Brak opisu procesu myślowego.</p>";
        newSuggestionsContent = backendBlockData.followUpSuggestions || [];
    }
    
    return { id, titleForBlock: questionText, question: questionText, findingsHeading: "Wynik", findingsContent, thoughtProcessContent, newSuggestionsContent };
};

const Dashboard = () => {
    const { analysisId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

    // Data states
    const [analysisData, setAnalysisData] = useState(null);
    const [allUserAnalyses, setAllUserAnalyses] = useState([]);
    const [activeTopics, setActiveTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    
    // UI states (block-based logic)
    const [analysisBlocks, setAnalysisBlocks] = useState([]);
    const [currentBlockIndex, setCurrentBlockIndex] = useState(0);

    // Status & messaging states
    const [status, setStatus] = useState('loading');
    const [monitoringMessage, setMonitoringMessage] = useState('Ładowanie...');
    const [isSendingMessage, setIsSendingMessage] = useState(false);

    // Effect 1: Fetch list of all user analyses for the sidebar.
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'analyses'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const analyses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllUserAnalyses(analyses);
            if (!analysisId && analyses.length > 0) {
                navigate(`/dashboard/${analyses[0].id}`);
            } else if (!analysisId && analyses.length === 0) {
                 setStatus('no_analyses');
                 setMonitoringMessage('Nie masz jeszcze żadnych analiz. Zacznij od dodania pliku!');
            }
        }, (error) => {
            setStatus('error');
            setMonitoringMessage('Błąd serwera podczas ładowania listy analiz.');
            showToast(`Błąd ładowania listy analiz: ${error.message}`, 'error');
        });
        return () => unsubscribe();
    }, [user, analysisId, navigate, showToast]);

    // Effect 2: Monitor the main analysis document.
    useEffect(() => {
        if (!user || !analysisId) {
            if (!user) navigate('/');
            return;
        };
        const docRef = doc(db, 'analyses', analysisId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().userId === user.uid) {
                const data = { id: docSnap.id, ...docSnap.data() };
                setAnalysisData(data);
                const currentStatus = data.status || 'completed';
                setStatus(currentStatus);
                if (currentStatus !== 'ready_for_topic_analysis' && currentStatus !== 'completed' && !currentStatus.startsWith('error')) {
                    setMonitoringMessage(`Twoja analiza jest przetwarzana... Status: ${currentStatus.replace(/_/g, ' ')}`);
                } else if(currentStatus.startsWith('error')) {
                    setMonitoringMessage(`Wystąpił błąd: ${data.errorMessage || 'Nieznany błąd przetwarzania'}`);
                }
            } else {
                setStatus('error');
                setMonitoringMessage('Analiza nie znaleziona lub brak dostępu.');
            }
        });
        return () => unsubscribe();
    }, [analysisId, user, navigate]);


useEffect(() => {
    if (!analysisId) return;
    const topicsRef = collection(db, 'analyses', analysisId, 'topics');
    const q = query(topicsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const topicsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setActiveTopics(topicsData);


        // Use a functional update to safely handle state changes inside the listener
        setSelectedTopic(currentSelectedTopic => {
            // If a topic was already selected...
            if (currentSelectedTopic) {
                // ...find its newest version in the fresh data from Firestore.
                const updatedTopic = topicsData.find(t => t.id === currentSelectedTopic.id);
                // Return the updated topic to refresh the state.
                // If it was deleted, this will correctly return undefined (which becomes null below).
                return updatedTopic || null;
            }
            
            // If no topic was selected yet and we have topics, select the first one.
            if (topicsData.length > 0) {
                return topicsData[0];
            }

            // Otherwise, there's no topic to select.
            return null;
        });
    }, (error) => {
        showToast("Nie udało się załadować tematów.", "error");
    });

    return () => unsubscribe();
// This dependency array ensures the listener is only reset when you change analyses.
}, [analysisId, showToast]);

    // Effect 4: CORE LOGIC - Build Blocks & Chat from the selected topic's history.
    useEffect(() => {
        // Exit early if we don't have what we need.
        if (!selectedTopic || !analysisId) {
            setAnalysisBlocks([]);
            setChatMessages([]);
            return;
        }
    
        // Immediately prepare the initial block from the selectedTopic state.
        // This part no longer needs to wait for the chat listener to fire.
        const initialBlock = selectedTopic.initialAnalysisResult
            ? [formatBlockDataFromBackend(selectedTopic.initialAnalysisResult, 'initial', selectedTopic.topicDisplayName)]
            : [];
    
        // Set up the listener for chat history.
        const chatHistoryRef = collection(db, 'analyses', analysisId, 'topics', selectedTopic.id, 'chatHistory');
        const q = query(chatHistoryRef, orderBy('timestamp', 'asc'));
    
        const unsubscribe = onSnapshot(q, (snapshot) => {
            // Get chat messages and any analysis blocks from within the chat.
            const chatDocs = snapshot.docs;
            const newChatMessages = chatDocs.map(doc => ({ sender: doc.data().role === 'user' ? 'user' : 'ai', text: doc.data().parts[0].text, id: doc.id }));
            const modelBlocks = chatDocs
                .filter(doc => doc.data().role === 'model' && doc.data().detailedAnalysisBlock)
                .map(doc => formatBlockDataFromBackend(doc.data().detailedAnalysisBlock, 'chat'));
    
            // Combine the initial block with any blocks from the chat.
            const allBlocks = [...initialBlock, ...modelBlocks];
            const prevBlockCount = analysisBlocks.length; // Read previous length before setting
            
            setAnalysisBlocks(allBlocks);
            setChatMessages(newChatMessages);
    
            // Logic to navigate to the newest block when a chat response arrives.
            if (prevBlockCount > 0 && prevBlockCount < allBlocks.length) {
                 setCurrentBlockIndex(allBlocks.length - 1);
            } else if (allBlocks.length > 0 && currentBlockIndex >= allBlocks.length) {
                setCurrentBlockIndex(allBlocks.length - 1);
            } else if (prevBlockCount === 0 && allBlocks.length > 0) {
                setCurrentBlockIndex(0);
            }
        });
    
        return () => unsubscribe();
    }, [selectedTopic, analysisId]); // Removed showToast as it's not a true dependency here.
    


    const handleTopicSubmit = useCallback(async (topicName) => {
        if (!topicName.trim() || !analysisId) return;
        const topicId = uuidv4();
        const topicDocRef = doc(db, 'analyses', analysisId, 'topics', topicId);
        try {
            await setDoc(topicDocRef, { topicDisplayName: topicName, status: "submitted", createdAt: serverTimestamp(), isDefault: false });
            showToast(`Temat "${topicName}" został utworzony.`, "info");
        } catch(error) {
            showToast(`Błąd tworzenia tematu: ${error.message}`, "error");
        }
    }, [analysisId, showToast]);

    const handleSendMessage = useCallback(async (messageText) => {
        if (!analysisId || !selectedTopic) return;
        setIsSendingMessage(true);
        try {
            await apiClient.chatOnTopic({ analysisId, topicId: selectedTopic.id, userMessageText: messageText });
        } catch (error) {
            showToast(`Błąd odpowiedzi AI: ${error.message}`, "error");
        } finally {
            setIsSendingMessage(false);
        }
    }, [analysisId, selectedTopic, showToast]);
    
    // Main render logic function to prevent empty screen
    const renderContent = () => {
        if (status.startsWith('error')) {
            return <CustomMessage isActive={true} message={monitoringMessage} type="error" />;
        }
        if (status.startsWith('error')) {
            return <CustomMessage isActive={true} message={monitoringMessage} type="error" />;
        }
        if (status !== 'ready_for_topic_analysis' && status !== 'completed') {
            return <CustomMessage isActive={true} message={monitoringMessage} />;
        }
        
        if (!selectedTopic) {
            return <CustomMessage isActive={true} message="Wybierz temat z listy lub utwórz nowy, aby rozpocząć analizę." type="info" />;
        }
        
        return (
            <>
                <div className="title-and-navigation-container">
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        {analysisBlocks[currentBlockIndex]?.titleForBlock || selectedTopic?.topicDisplayName || "Analiza"}
                    </h1>
                    {analysisBlocks.length > 1 && (
                        <div className="analysis-navigation-arrows">
                            <button className="nav-arrow" onClick={() => setCurrentBlockIndex(prev => Math.max(0, prev - 1))} disabled={currentBlockIndex === 0}>&lt;</button>
                            <button className="nav-arrow" onClick={() => setCurrentBlockIndex(prev => Math.min(analysisBlocks.length - 1, prev + 1))} disabled={currentBlockIndex >= analysisBlocks.length - 1}>&gt;</button>
                        </div>
                    )}
                </div>
                
                {analysisBlocks.length > 0 ? (
                     <AnalysisContent blocks={analysisBlocks} currentIndex={currentBlockIndex} />
                ) : (
                    <CustomMessage isActive={true} message="Oczekiwanie na pierwszą analizę dla tego tematu..." type="info" />
                )}

                <Chat
                    key={selectedTopic.id}
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    isSending={isSendingMessage}
                />
            </>
        );
    }

    return (
        <div className="flex h-screen bg-gray-900 text-white font-sans">
            <Sidebar
                userAnalyses={allUserAnalyses}
                activeAnalysisId={analysisId}
                onSelectAnalysis={(id) => navigate(`/dashboard/${id}`)}
                topics={activeTopics}
                activeTopicId={selectedTopic?.id}
                onSelectTopic={setSelectedTopic}
                onTopicSubmit={handleTopicSubmit}
                // Corrected navigation path
                onNavigateToLanding={() => navigate('/')}
                isReadyForTopic={status === 'ready_for_topic_analysis' || status === 'completed'}
            />
            
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="main-content-bg flex-grow overflow-y-auto p-6 md:p-8">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;