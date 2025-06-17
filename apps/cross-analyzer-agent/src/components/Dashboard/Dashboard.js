import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, setDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../firebase-helpers/client';
import { useAuth } from '@amc-platfrom/shared-contexts'; // FIX: Using the correct, centralized hook.
import Sidebar from './Sidebar';
import AnalysisContent from './AnalysisContent';
import Chat from './Chat';
import apiClient from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import CustomMessage from '../UI/CustomMessage';
import { AnalysisProvider } from '../../contexts/AnalysisContext';

const Dashboard = () => {
    const { analysisId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth(); // FIX: Using useAuth() instead of useContext(AuthContext).
    const { showToast } = useToast();

    // All original state management is preserved.
    const [analysisData, setAnalysisData] = useState(null);
    const [status, setStatus] = useState('loading');
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    
    const [allUserAnalyses, setAllUserAnalyses] = useState([]);
    const [activeTopics, setActiveTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [monitoringMessage, setMonitoringMessage] = useState('Loading...');

    // Legacy state for block-based analysis backward compatibility is preserved.
    const [currentAnalysisIndex, setCurrentAnalysisIndex] = useState(0);

    // Effect 1: Fetch all user's analyses for the sidebar.
    useEffect(() => {
        if (!currentUser) return;

        apiClient.getAnalyses(currentUser.uid) // Assumes uid is the correct parameter.
            .then(result => {
                if (result.data?.success) {
                    setAllUserAnalyses(result.data.analyses);
                    if (!analysisId && result.data.analyses.length > 0) {
                        navigate(`/app/analyzer/workspace/${result.data.analyses[0].analysisId}`);
                    }
                } else {
                    throw new Error(result.data.message || "Failed to fetch analyses list.");
                }
            })
            .catch(error => {
                console.error("Error fetching analyses list:", error);
                showToast(error.message, "error");
            });
    // FIX: Added all external variables used in the effect to the dependency array.
    }, [currentUser, analysisId, navigate, showToast]);

    // Effect 2: Enhanced analysis monitoring with original security checks.
    useEffect(() => {
        if (!currentUser) {
            showToast("Please log in to view this page.", "error");
            navigate('/');
            return;
        }

        if (!analysisId) {
            setStatus('initial'); // A more descriptive status than 'error'
            setMonitoringMessage('No analysis selected. Please choose one from the sidebar.');
            return;
        }

        setStatus('loading');
        setMonitoringMessage('Verifying access and analysis status...');
        
        const docRef = doc(db, 'analyses', analysisId);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                
                if (data.userId !== currentUser.uid) {
                    showToast("You don't have permission to view this analysis.", "error");
                    setStatus('error');
                    setMonitoringMessage('Access denied: You do not have permission to view this analysis.');
                    navigate('/');
                    return;
                }
                
                setAnalysisData({ id: docSnap.id, ...data });
                const currentStatus = data.status || 'completed';
                setStatus(currentStatus);
                
                if (currentStatus.startsWith('error')) {
                    setMonitoringMessage(`Processing error: ${data.errorMessage || 'Unknown error'}`);
                } else if (currentStatus !== 'ready_for_topic_analysis' && currentStatus !== 'completed') {
                    setMonitoringMessage(`Status: ${currentStatus.replace(/_/g, ' ')}...`);
                } else {
                    setMonitoringMessage('');
                }
            } else {
                showToast("Analysis not found.", "error");
                setStatus('error');
                setMonitoringMessage('Analysis not found');
            }
        }, (error) => {
            console.error("Error fetching analysis:", error);
            showToast("Error fetching analysis.", "error");
            setStatus('error');
            setMonitoringMessage('Server error while loading analysis');
        });

        return () => unsubscribe();
    // FIX: Added all external variables used in the effect to the dependency array.
    }, [analysisId, currentUser, navigate, showToast]);

    // Effect 3: Listen to topics subcollection, logic preserved.
    useEffect(() => {
        if (!analysisId || (status !== 'ready_for_topic_analysis' && status !== 'completed')) {
            setActiveTopics([]);
            setSelectedTopic(null);
            return;
        }

        const topicsCollectionRef = collection(db, "analyses", analysisId, "topics");
        const unsubTopics = onSnapshot(topicsCollectionRef, (snapshot) => {
            const topicsData = snapshot.docs.map(t => ({ id: t.id, ...t.data() }));
            setActiveTopics(topicsData);
            
            const currentTopicExists = selectedTopic && topicsData.some(t => t.id === selectedTopic.id);
            if (!currentTopicExists && topicsData.length > 0) {
                setSelectedTopic(topicsData[0]);
            } else if (topicsData.length === 0) {
                setSelectedTopic(null);
            }
        });

        return () => unsubTopics();
    // FIX: Added all external variables used in the effect to the dependency array.
    }, [analysisId, status, selectedTopic]);

    // useMemo and useCallback hooks are preserved to maintain performance.
    const analysisBlocks = useMemo(() => {
        if (!analysisData || !analysisData.blocks) return [];
        return analysisData.blocks.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
    }, [analysisData]);

    const chatMessages = useMemo(() => {
        if (!analysisData || !analysisData.chatHistory) return [];
        return analysisData.chatHistory.sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
    }, [analysisData]);

    const handleTopicSubmit = useCallback(async (topicName) => {
        if (!topicName.trim() || !analysisId) {
            showToast("Topic name cannot be empty.", "error");
            return;
        }
        
        const topicId = uuidv4();
        const topicDocRef = doc(db, 'analyses', analysisId, 'topics', topicId);
        try {
            await setDoc(topicDocRef, {
                topicDisplayName: topicName,
                status: "submitted",
                createdAt: serverTimestamp(),
                lastUpdatedAt: serverTimestamp(),
            });
            showToast(`Topic "${topicName}" created.`, "info");
        } catch (error) {
            console.error("Error submitting new topic:", error);
            showToast(`Error: ${error.message}`, "error");
        }
    }, [analysisId, showToast]);

    const handleSendMessage = useCallback(async (messageText) => {
        if (!analysisId || !currentUser) {
            showToast("Cannot send message: Missing context.", "error");
            return;
        }
        
        setIsSendingMessage(true);
        try {
            if (selectedTopic) {
                await apiClient.chatOnTopic(analysisId, selectedTopic.id, messageText);
            } else {
                // Fallback for old chat system.
                await apiClient.chatOnTopic(analysisId, null, messageText); // Assuming API handles null topicId
            }
        } catch (error) {
            console.error("Error sending message:", error);
            showToast(`Error: ${error.message}`, "error");
        } finally {
            setIsSendingMessage(false);
        }
    }, [analysisId, currentUser, selectedTopic, showToast]);

    // RENDER LOGIC - All original states and messages are preserved.
    if (status === 'loading' || status === 'initial') {
        return <CustomMessage message={monitoringMessage} />;
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen text-white">
                <CustomMessage message={monitoringMessage} type="error" />
                <Link to="/" className="text-blue-400 hover:underline mt-4">Go to Welcome Page</Link>
            </div>
        );
    }
    
    if (status === 'processing' || status === 'preprocessing_data' || status === 'processing_started') {
        return <CustomMessage message={`Your analysis is being processed... Status: ${status.replace(/_/g, ' ')}`} />;
    }

    // The original render functions are preserved to handle all UI states.
    const renderMainContent = () => {
        if (status === 'ready_for_topic_analysis' || status === 'completed') {
            if (selectedTopic) {
                return <AnalysisContent activeTopic={selectedTopic} analysisDetails={analysisData} />;
            } else if (activeTopics.length === 0) {
                return <CustomMessage message="Create a new topic to start analysis" type="info" />;
            } else {
                return <CustomMessage message="Select a topic from the sidebar" type="info" />;
            }
        }
        if (analysisBlocks.length > 0) {
            return <AnalysisContent blocks={analysisBlocks} currentIndex={currentAnalysisIndex} />;
        }
        return <div className="analysis-content-area text-center p-8 text-gray-400">No analysis content available yet.</div>;
    };

    const renderChat = () => {
        if (selectedTopic) {
            return <Chat key={selectedTopic.id} analysisId={analysisId} topicId={selectedTopic.id} isSending={isSendingMessage} onSendMessage={handleSendMessage} />;
        } else if (chatMessages.length > 0) {
            return <Chat messages={chatMessages} onSendMessage={handleSendMessage} isSending={isSendingMessage} />;
        } else {
            return <CustomMessage message="No chat available. Create or select a topic to start chatting." />;
        }
    };

    return (
        <AnalysisProvider analysisDataInitial={analysisData}>
            <div className="flex h-screen bg-gray-100 font-sans">
                <Sidebar
                    activeTopic={selectedTopic?.topicDisplayName || analysisData?.name || 'Analysis'}
                    onNavigateToLanding={() => navigate('/')}
                    userAnalyses={allUserAnalyses}
                    activeAnalysisId={analysisId}
                    onSelectAnalysis={(id) => navigate(`/app/analyzer/workspace/${id}`)}
                    topics={activeTopics}
                    activeTopicId={selectedTopic?.id}
                    onSelectTopic={setSelectedTopic}
                    onTopicSubmit={handleTopicSubmit}
                    isReadyForTopic={status === 'ready_for_topic_analysis' || status === 'completed'}
                />
                
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                    <div className="main-content-bg p-6 md:p-8">
                        <div className="title-and-navigation-container">
                            <h1 id="main-analysis-title-react" className="text-2xl md:text-3xl font-bold text-white">
                                {selectedTopic?.topicDisplayName || analysisData?.name || "Analysis"}
                            </h1>
                            {analysisBlocks.length > 1 && !selectedTopic && (
                                <div className="analysis-navigation-arrows">
                                    <button className="nav-arrow" onClick={() => setCurrentAnalysisIndex(prev => Math.max(0, prev - 1))} disabled={currentAnalysisIndex === 0}>&lt;</button>
                                    <button className="nav-arrow" onClick={() => setCurrentAnalysisIndex(prev => Math.min(analysisBlocks.length - 1, prev + 1))} disabled={currentAnalysisIndex >= analysisBlocks.length - 1}>&gt;</button>
                                </div>
                            )}
                        </div>
                        {renderMainContent()}
                        {renderChat()}
                    </div>
                </main>
            </div>
        </AnalysisProvider>
    );
};

export default Dashboard;
