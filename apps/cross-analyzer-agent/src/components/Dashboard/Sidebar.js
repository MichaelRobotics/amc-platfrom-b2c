/**
 * @fileoverview The Sidebar component.
 * CORRECTED: This version now uses the real-time 'useAnalysisContext' hook
 * to display the list of all analyses and their live statuses.
 * It no longer contains any direct Firebase initialization calls.
 */
import React from 'react';
import { useAnalysisContext } from '../../contexts/AnalysisContext';

// Assuming you have a helper to get a status-based color
const getStatusColor = (status) => {
    switch (status) {
        case 'completed':
        case 'ready_for_topic_analysis':
            return 'bg-green-500';
        case 'analyzing':
        case 'preprocessing_data':
        case 'processing_started':
            return 'bg-blue-500';
        case 'error_analysis':
        case 'error_processing':
            return 'bg-red-500';
        default:
            return 'bg-gray-400';
    }
};

const Sidebar = ({ activeTopic, onNavigateToLanding, onSelectAnalysis, activeTopicId, onSelectTopic }) => {
    // Use the real-time context to get the list of all analyses.
    const { userCreatedAnalyses, isLoadingAnalyses } = useAnalysisContext();

    return (
        <aside className="sidebar-container bg-gray-800 text-white w-64 min-w-[256px] flex flex-col">
            <div className="sidebar-header p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold">Agent Lean AI</h2>
            </div>
            
            <nav className="flex-1 p-4 overflow-y-auto">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Moje Analizy</h3>
                {isLoadingAnalyses ? (
                    <div className="text-gray-400">Ładowanie listy...</div>
                ) : (
                    <ul>
                        {userCreatedAnalyses.map(analysis => (
                            <li key={analysis.id} className="mb-2">
                                <button 
                                    onClick={() => onSelectAnalysis(analysis.id)}
                                    className="w-full text-left p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:bg-gray-600 flex items-center"
                                >
                                    <span className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(analysis.status)}`}></span>
                                    <span className="flex-1 truncate">{analysis.analysisName}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </nav>

            <div className="sidebar-footer p-4 border-t border-gray-700">
                <button
                    onClick={() => onNavigateToLanding()}
                    className="w-full p-2 rounded-md bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    Nowa Analiza
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
