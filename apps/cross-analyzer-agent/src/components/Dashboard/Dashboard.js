/**
 * @fileoverview The main Dashboard component.
 * FULLY REFACTORED AND RESTORED:
 * - Merges the original UI/UX with the new asynchronous multi-topic architecture.
 * - Fetches a list of all user's analyses for the sidebar.
 * - Uses real-time listeners for the selected analysis and its topics subcollection.
 * - Handles multiple topics per analysis, allowing users to create and switch between them.
 * - Implements security checks to ensure users can only view their own data.
 */
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { doc, onSnapshot, collection, setDoc, serverTimestamp } from "firebase/firestore";

// Import shared services and contexts from the monorepo structure
import { firestore } from '../../../../packages/firebase-helpers/client';
import { AuthContext } from '../../../../platform-shell/src/contexts/AuthContext';
import apiClient from '../../services/apiClient';

// Import local components
import Sidebar from './Sidebar';
import AnalysisContent from './AnalysisContent';
import Chat from './Chat';
import { useToast } from '../../contexts/ToastContext';
import CustomMessage from '../UI/CustomMessage';


const Dashboard = () => {
    const { currentUser } = useContext(AuthContext);
    const { analysisId: urlAnalysisId } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    // State
    const [allAnalyses, setAllAnalyses] = useState([]); // For the sidebar list
    const [activeAnalysis, setActiveAnalysis] = useState(null); // The full data object for the selected analysis
    const [activeTopics, setActiveTopics] = useState([]); // All topics for the active analysis
    const [selectedTopic, setSelectedTopic] = useState(null); // The currently selected topic object
    const [isLoading, setIsLoading] = useState(true);
    const [monitoringMessage, setMonitoringMessage] = useState('Wybierz analizę z listy...');
    const [monitoringStatus, setMonitoringStatus] = useState('idle'); // idle, monitoring, ready, error

    // 1. Fetch the list of all analyses for the current user once.
    useEffect(() => {
        if (!currentUser) return;

        setIsLoading(true);
        apiClient.getAnalyses()
            .then(result => {
                if (result.data.success) {
                    setAllAnalyses(result.data.analyses);
                    if (!urlAnalysisId && result.data.analyses.length > 0) {
                        // If no analysisId in URL, navigate to the first one in the list.
                        navigate(`/dashboard/${result.data.analyses[0].analysisId}`);
                    }
                } else {
                    throw new Error(result.data.message || "Failed to fetch analyses list.");
                }
            })
            .catch(error => {
                console.error("Error fetching analyses list:", error);
                showToast(error.message, "error");
            })
            .finally(() => {
                if (!urlAnalysisId) setIsLoading(false);
            });
    }, [currentUser, navigate, showToast]); // Removed urlAnalysisId dependency to prevent re-fetching list on navigation

    // 2. Listen to the specific analysis document identified by the URL
    useEffect(() => {
        if (!currentUser || !urlAnalysisId) {
            setMonitoringStatus('idle');
            setMonitoringMessage(currentUser ? 'Wybierz analizę z listy...' : 'Zaloguj się, aby zobaczyć analizy.');
            return;
        }

        setIsLoading(true);
        setMonitoringMessage('Weryfikacja dostępu i statusu analizy...');
        const analysisDocRef = doc(firestore, "analyses", urlAnalysisId);
        
        const unsubAnalysis = onSnapshot(analysisDocRef, (doc) => {
            if (!doc.exists()) {
                setMonitoringStatus('error');
                setMonitoringMessage(`Błąd: Analiza o ID ${urlAnalysisId} nie została znaleziona.`);
                setActiveAnalysis(null);
                setIsLoading(false);
                return;
            }
            
            const analysisData = doc.data();
            
            if (analysisData.userId !== currentUser.uid) {
                setMonitoringStatus('error');
                setMonitoringMessage('Błąd: Brak uprawnień do wyświetlenia tej analizy.');
                showToast("You do not have permission to view this analysis.", "error");
                setActiveAnalysis(null);
                setIsLoading(false);
                navigate('/');
                return;
            }
            
            setActiveAnalysis({ id: doc.id, ...analysisData });

            if (analysisData.status.startsWith('error')) {
                setMonitoringStatus('error');
                setMonitoringMessage(`Błąd przetwarzania: ${analysisData.errorMessage || 'Nieznany błąd'}`);
            } else if (analysisData.status !== 'ready_for_topic_analysis') {
                setMonitoringStatus('monitoring');
                setMonitoringMessage(`Status: ${analysisData.status.replace(/_/g, ' ')}...`);
            } else {
                 setMonitoringStatus('ready');
                 setMonitoringMessage('Gotowe do analizy tematu.');
            }

            setIsLoading(false);
        }, (error) => {
            console.error("Error listening to analysis doc:", error);
            setMonitoringStatus('error');
            setMonitoringMessage('Błąd serwera podczas ładowania analizy.');
            setIsLoading(false);
        });

        // Also listen to the topics subcollection for this analysis
        const topicsCollectionRef = collection(firestore, "analyses", urlAnalysisId, "topics");
        const unsubTopics = onSnapshot(topicsCollectionRef, (snapshot) => {
            const topicsData = snapshot.docs.map(t => ({ id: t.id, ...t.data() }));
            setActiveTopics(topicsData);
            
            // If there's no selected topic yet, or the selected one was deleted, select the first available.
            if (!selectedTopic || !topicsData.find(t => t.id === selectedTopic.id)) {
                 if (topicsData.length > 0) {
                    setSelectedTopic(topicsData[0]);
                } else {
                    setSelectedTopic(null); // No topics exist
                }
            }
        });

        return () => {
            unsubAnalysis();
            unsubTopics();
        };

    }, [urlAnalysisId, currentUser, navigate, showToast]);


    const handleSelectAnalysis = (analysisId) => {
        if (analysisId !== urlAnalysisId) {
            // Clear old state before navigating to give user feedback
            setActiveAnalysis(null);
            setActiveTopics([]);
            setSelectedTopic(null);
            setIsLoading(true);
            navigate(`/dashboard/${analysisId}`);
        }
    };

    const handleTopicSubmit = async (topicName) => {
        if (!topicName.trim() || !urlAnalysisId) {
            showToast("Nazwa tematu nie może być pusta.", "error");
            return;
        }
        const topicId = uuidv4();
        const topicDocRef = doc(firestore, 'analyses', urlAnalysisId, 'topics', topicId);

        try {
            await setDoc(topicDocRef, {
                topicDisplayName: topicName,
                status: "analyzing",
                createdAt: serverTimestamp(),
                lastUpdatedAt: serverTimestamp(),
            });
            showToast(`Temat "${topicName}" został przesłany do analizy.`, "info");
        } catch (error) {
            console.error("Error submitting new topic:", error);
            showToast(`Błąd: ${error.message}`, "error");
        }
    };
    
    // Render logic
    const renderContent = () => {
        if (isLoading) {
            return <CustomMessage message="Ładowanie pulpitu analizy..." />;
        }
        if (!activeAnalysis) {
            return <CustomMessage message={monitoringMessage || "Wybierz analizę z listy."} type={monitoringStatus === 'error' ? 'error' : 'info'} />;
        }
        if (monitoringStatus !== 'ready' && activeTopics.length === 0) {
             return <CustomMessage message={monitoringMessage} type={monitoringStatus === 'error' ? 'error' : 'info'} />;
        }
        return (
             <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div style={{ flex: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <AnalysisContent
                        key={selectedTopic ? selectedTopic.id : 'no-topic'}
                        activeTopic={selectedTopic}
                        analysisDetails={activeAnalysis}
                    />
                </div>
                <div style={{ flex: 2, borderLeft: '1px solid #ccc', overflowY: 'auto' }}>
                    {selectedTopic ? (
                        <Chat
                            key={selectedTopic.id}
                            analysisId={urlAnalysisId}
                            topicId={selectedTopic.id}
                        />
                    ) : (
                        <CustomMessage message="Wybierz temat z listy lub utwórz nowy, aby rozpocząć czat." />
                    )}
                </div>
             </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 64px)' /* Adjust for navbar */, backgroundColor: '#f0f2f5' }}>
            <Sidebar
                userAnalyses={allAnalyses}
                activeAnalysisId={urlAnalysisId}
                onSelectAnalysis={handleSelectAnalysis}
                topics={activeTopics}
                activeTopicId={selectedTopic?.id}
                onSelectTopic={setSelectedTopic}
                onTopicSubmit={handleTopicSubmit}
                isReadyForTopic={activeAnalysis?.status === 'ready_for_topic_analysis'}
            />
            {renderContent()}
        </div>
    );
};

export default Dashboard;