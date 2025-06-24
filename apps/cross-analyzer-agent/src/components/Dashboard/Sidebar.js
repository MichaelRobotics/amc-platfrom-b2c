// ========================================================================
// Plik: src/components/Dashboard/Sidebar.js
// Opis: Ostateczna, w pełni funkcjonalna wersja Sidebar. Wyświetla listę 
// Analiz, a pod wybraną analizą listę jej Tematów. Zawiera przycisk
// do analizy nowego pliku, zgodny z oryginalnym designem.
// ========================================================================
import React, { useState } from 'react';

const Sidebar = ({
    userAnalyses,
    activeAnalysisId,
    onSelectAnalysis,
    topics,
    activeTopicId,
    onSelectTopic,
    onTopicSubmit,
    onNavigateToLanding,
    isReadyForTopic
}) => {
    const [newTopicName, setNewTopicName] = useState('');
    const [isAddingTopic, setIsAddingTopic] = useState(false);

    const handleTopicFormSubmit = (e) => {
        e.preventDefault();
        if (newTopicName.trim()) {
            onTopicSubmit(newTopicName.trim());
            setNewTopicName('');
            setIsAddingTopic(false);
        }
    };
    
    return (
        <aside className="w-full md:w-64 lg:w-80 p-4 space-y-4 shrink-0 flex flex-col bg-gray-800 text-gray-300">
            <div className="flex-grow overflow-y-auto pr-2">
                {/* Section for Analyses List */}
                <h2 className="text-lg font-semibold mb-2 px-2">Moje Analizy</h2>
                <nav>
                    <ul>
                        {userAnalyses.length > 0 ? (
                            userAnalyses.map(analysis => (
                                <li key={analysis.id}>
                                    <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); onSelectAnalysis(analysis.id); }}
                                        className={`sidebar-item block px-4 py-2 text-sm font-medium rounded-md truncate ${activeAnalysisId === analysis.id ? 'active bg-gray-700 text-white' : 'hover:bg-gray-700'}`}
                                        title={analysis.analysisName}
                                    >
                                        {analysis.analysisName}
                                    </a>
                                </li>
                            ))
                        ) : (
                             <li className="px-4 py-2 text-sm text-gray-400">Brak analiz.</li>
                        )}
                    </ul>
                </nav>

                {/* Divider */}
                <hr className="my-4 border-gray-700" />

                {/* Section for Topics List for the Active Analysis */}
                <h2 className="text-lg font-semibold mb-2 px-2">Tematy w tej Analizie</h2>
                <nav>
                    <ul>
                        {topics.length > 0 ? (
                            topics.map(topic => (
                                <li key={topic.id}>
                                    <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); onSelectTopic(topic); }}
                                        className={`sidebar-item block px-4 py-2 text-sm font-medium rounded-md truncate ${activeTopicId === topic.id ? 'active bg-blue-600 text-white' : 'hover:bg-gray-700'}`}
                                        title={topic.topicDisplayName}
                                    >
                                        {topic.topicDisplayName}
                                        {topic.status === 'analyzing' && <span className="text-xs text-yellow-400 ml-2">(Analizuję...)</span>}
                                        {topic.status === 'submitted' && <span className="text-xs text-yellow-400 ml-2">(W kolejce...)</span>}
                                    </a>
                                </li>
                            ))
                        ) : (
                            isReadyForTopic && <li className="px-4 py-2 text-sm text-gray-400">Brak tematów.</li>
                        )}
                    </ul>
                </nav>

                {/* Topic Creation Form */}
                {isReadyForTopic && (
                     <div className="mt-4 px-2">
                        {isAddingTopic ? (
                             <form onSubmit={handleTopicFormSubmit}>
                                <input
                                    type="text"
                                    value={newTopicName}
                                    onChange={(e) => setNewTopicName(e.target.value)}
                                    placeholder="Nazwa nowego tematu..."
                                    className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <div className="flex justify-end space-x-2 mt-2">
                                     <button type="button" onClick={() => setIsAddingTopic(false)} className="px-3 py-1 text-xs rounded bg-gray-600 hover:bg-gray-500">Anuluj</button>
                                     <button type="submit" className="px-3 py-1 text-xs rounded bg-blue-600 hover:bg-blue-500" disabled={!newTopicName.trim()}>Dodaj</button>
                                </div>
                            </form>
                        ) : (
                            <button
                                onClick={() => setIsAddingTopic(true)}
                                className="w-full text-left px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-700 text-blue-400"
                            >
                                + Utwórz Nowy Temat
                            </button>
                        )}
                    </div>
                )}
            </div>
            
            {/* "Analyze New File" button at the bottom, as in the old version */}
            <div className="mt-auto pt-4 border-t border-gray-700">
                <button
                    className="bottom-button w-full py-2.5 px-4 rounded-md text-sm font-medium bg-gray-600 hover:bg-gray-500 text-white"
                    onClick={onNavigateToLanding}
                >
                    Analizuj Nowy Plik
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
