import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, setDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../../packages/firebase-helpers/client';
import { AuthContext } from '../../../../platform-shell/src/contexts/AuthContext';
import { useLayout } from '../../../../platform-shell/src/contexts/LayoutContext';
import Sidebar from './Sidebar';
import AnalysisContent from './AnalysisContent';
import Chat from './Chat';
import apiClient from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import CustomMessage from '../UI/CustomMessage';

const Dashboard = () => {
    const { analysisId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const { showToast } = useToast();
    const { setIsNavBarVisible } = useLayout();

    // Enhanced state management - keeping old structure but adding new capabilities
    const [analysisData, setAnalysisData] = useState(null);
    const [status, setStatus] = useState('loading');
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    
    // NEW: Multi-analysis support from new Dashboard
    const [allAnalyses, setAllAnalyses] = useState([]);
    const [activeTopics, setActiveTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [monitoringMessage, setMonitoringMessage] = useState('Loading...');

    // Keep the original navbar hiding functionality
    useEffect(() => {
        setIsNavBarVisible(false);
        return () => setIsNavBarVisible(true);
    }, [setIsNavBarVisible]);

    // NEW: Fetch all user's analyses for sidebar
    useEffect(() => {
        if (!currentUser) return;

        apiClient.getAnalyses()
            .then(result => {
                if (result.data.success) {
                    setAllAnalyses(result.data.analyses);
                    // If no analysisId in URL and user has analyses, navigate to first one
                    if (!analysisId && result.data.analyses.length > 0) {
                        navigate(`/dashboard/${result.data.analyses[0].analysisId}`);
                    }
                } else {
                    throw new Error(result.data.message || "Failed to fetch analyses list.");
                }
            })
            .catch(error => {
                console.error("Error fetching analyses list:", error);
                showToast(error.message, "error");
            });
    }, [currentUser, navigate, showToast]);

    // Enhanced analysis monitoring - keeping original security checks
    useEffect(() => {
        if (!currentUser) {
            showToast("Please log in to view this page.", "error");
            navigate('/');
            return;
        }

        if (!analysisId) {
            setStatus('error');
            setMonitoringMessage('No analysis selected');
            return;
        }

        setStatus('loading');
        setMonitoringMessage('Verifying access and analysis status...');
        
        const docRef = doc(db, 'analyses', analysisId);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                
                // KEEP: Original security check from old Dashboard
                if (data.userId !== currentUser.uid) {
                    showToast("You don't have permission to view this analysis.", "error");
                    setStatus('error');
                    setMonitoringMessage('Access denied: You do not have permission to view this analysis.');
                    navigate('/');
                    return;
                }
                
                setAnalysisData(data);
                const currentStatus = data.status || 'completed';
                setStatus(currentStatus);
                
                // Enhanced status monitoring from new Dashboard
                if (currentStatus.startsWith('error')) {
                    setMonitoringMessage(`Processing error: ${data.errorMessage || 'Unknown error'}`);
                } else if (currentStatus !== 'ready_for_topic_analysis' && currentStatus !== 'completed') {
                    setMonitoringMessage(`Status: ${currentStatus.replace(/_/g, ' ')}...`);
                } else {
                    setMonitoringMessage('Ready for analysis');
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
    }, [analysisId, currentUser, navigate, showToast]);

    // NEW: Listen to topics subcollection
    useEffect(() => {
        if (!analysisId || status !== 'ready_for_topic_analysis') {
            setActiveTopics([]);
            setSelectedTopic(null);
            return;
        }

        const topicsCollectionRef = collection(db, "analyses", analysisId, "topics");
        const unsubTopics = onSnapshot(topicsCollectionRef, (snapshot) => {
            const topicsData = snapshot.docs.map(t => ({ id: t.id, ...t.data() }));
            setActiveTopics(topicsData);
            
            // Auto-select first topic if none selected or current one was deleted
            if (!selectedTopic || !topicsData.find(t => t.id === selectedTopic.id)) {
                if (topicsData.length > 0) {
                    setSelectedTopic(topicsData[0]);
                } else {
                    setSelectedTopic(null);
                }
            }
        });

        return () => unsubTopics();
    }, [analysisId, status, selectedTopic]);

    // Keep original block navigation logic but adapt for topics
    const [currentAnalysisIndex, setCurrentAnalysisIndex] = useState(0);

    const analysisBlocks = useMemo(() => {
        if (!analysisData || !analysisData.blocks) return [];
        return analysisData.blocks.sort((a, b) => a.createdAt - b.createdAt);
    }, [analysisData]);

    const chatMessages = useMemo(() => {
        if (!analysisData || !analysisData.chatHistory) return [];
        return analysisData.chatHistory.sort((a, b) => a.timestamp - b.timestamp);
    }, [analysisData]);

    // NEW: Enhanced handlers from new Dashboard
    const handleSelectAnalysis = (newAnalysisId) => {
        if (newAnalysisId !== analysisId) {
            navigate(`/dashboard/${newAnalysisId}`);
        }
    };

    const handleTopicSubmit = async (topicName) => {
        if (!topicName.trim() || !analysisId) {
            showToast("Topic name cannot be empty.", "error");
            return;
        }
        
        const topicId = uuidv4();
        const topicDocRef = doc(db, 'analyses', analysisId, 'topics', topicId);

        try {
            await setDoc(topicDocRef, {
                topicDisplayName: topicName,
                status: "analyzing",
                createdAt: serverTimestamp(),
                lastUpdatedAt: serverTimestamp(),
            });
            showToast(`Topic "${topicName}" submitted for analysis.`, "info");
        } catch (error) {
            console.error("Error submitting new topic:", error);
            showToast(`Error: ${error.message}`, "error");
        }
    };

    // Enhanced message sending - support both old and new chat systems
    const handleSendMessage = async (messageText) => {
        if (!analysisId || !currentUser) {
            showToast("Cannot send message: Missing context.", "error");
            return;
        }
        
        setIsSendingMessage(true);
        try {
            if (selectedTopic) {
                // NEW: Topic-based chat
                await apiClient.chatOnTopic(analysisId, selectedTopic.id, messageText);
            } else {
                // OLD: Analysis-level chat (fallback)
                await apiClient.chatOnTopic(analysisId, messageText);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            showToast(`Error: ${error.message}`, "error");
        } finally {
            setIsSendingMessage(false);
        }
    };

    // Enhanced loading and error states
    if (status === 'loading') {
        return <CustomMessage message="Loading Analysis Dashboard..." />;
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

    // Enhanced rendering logic
    const renderMainContent = () => {
        // NEW: Support for topic-based analysis
        if (status === 'ready_for_topic_analysis') {
            if (selectedTopic) {
                return (
                    <AnalysisContent 
                        activeTopic={selectedTopic}
                        analysisDetails={analysisData}
                    />
                );
            } else if (activeTopics.length === 0) {
                return <CustomMessage message="Create a new topic to start analysis" type="info" />;
            } else {
                return <CustomMessage message="Select a topic from the sidebar" type="info" />;
            }
        }
        
        // OLD: Block-based analysis (fallback)
        if (analysisBlocks.length > 0) {
            return <AnalysisContent blocks={analysisBlocks} currentIndex={currentAnalysisIndex} />;
        }
        
        return <div className="analysis-content-area text-center p-8 text-gray-400">No analysis content available yet.</div>;
    };

    const renderChat = () => {
        if (selectedTopic) {
            // NEW: Topic-specific chat
            return (
                <Chat
                    key={selectedTopic.id}
                    analysisId={analysisId}
                    topicId={selectedTopic.id}
                    isSending={isSendingMessage}
                />
            );
        } else if (chatMessages.length > 0) {
            // OLD: Analysis-level chat (fallback)
            return (
                <Chat
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    isSending={isSendingMessage}
                />
            );
        } else {
            return <CustomMessage message="No chat available. Create or select a topic to start chatting." />;
        }
    };

    return (
        <div id="dashboard-view-content" className="dashboard-view-wrapper">
            <Sidebar
                // OLD: Simple topic display
                activeTopic={selectedTopic?.topicDisplayName || analysisData?.name || 'Analysis'}
                onNavigateToLanding={() => navigate('/')}
                
                // NEW: Enhanced sidebar with multi-analysis and topic support
                userAnalyses={allAnalyses}
                activeAnalysisId={analysisId}
                onSelectAnalysis={handleSelectAnalysis}
                topics={activeTopics}
                activeTopicId={selectedTopic?.id}
                onSelectTopic={setSelectedTopic}
                onTopicSubmit={handleTopicSubmit}
                isReadyForTopic={status === 'ready_for_topic_analysis'}
            />
            
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                <div className="main-content-bg p-6 md:p-8">
                    <div className="title-and-navigation-container">
                        <h1 id="main-analysis-title-react" className="text-2xl md:text-3xl font-bold text-white">
                            {selectedTopic?.topicDisplayName || analysisData?.name || "Analysis"}
                        </h1>
                        
                        {/* Keep original block navigation for backward compatibility */}
                        {analysisBlocks.length > 1 && !selectedTopic && (
                            <div className="analysis-navigation-arrows">
                                <button
                                    className="nav-arrow"
                                    onClick={() => setCurrentAnalysisIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentAnalysisIndex === 0}
                                >
                                    &lt;
                                </button>
                                <button
                                    className="nav-arrow"
                                    onClick={() => setCurrentAnalysisIndex(prev => Math.min(analysisBlocks.length - 1, prev + 1))}
                                    disabled={currentAnalysisIndex >= analysisBlocks.length - 1}
                                >
                                    &gt;
                                </button>
                            </div>
                        )}
                    </div>

                    {renderMainContent()}
                    {renderChat()}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;