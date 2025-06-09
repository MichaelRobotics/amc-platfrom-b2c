/**
 * @fileoverview The AnalysisContent component.
 * This component is responsible for rendering the main analysis blocks.
 * It is a "dumb" component that receives all its data via props and
 * should not contain any Firebase initialization logic.
 */
import React from 'react';
import AnalysisBlock from './AnalysisBlock';

const AnalysisContent = ({ blocks, currentIndex }) => {
    if (!blocks || blocks.length === 0) {
        return (
            <div className="analysis-content-area text-center p-8 text-gray-400">
                Oczekiwanie na dane analizy...
            </div>
        );
    }
    
    // Ensure currentIndex is valid
    const safeIndex = Math.max(0, Math.min(currentIndex, blocks.length - 1));
    const activeBlock = blocks[safeIndex];

    return (
        <div className="analysis-content-area">
            {activeBlock ? (
                <AnalysisBlock
                    key={activeBlock.id}
                    title={activeBlock.question}
                    findingsHeading={activeBlock.findingsHeading}
                    findingsContent={activeBlock.findingsContent}
                    thoughtProcessContent={activeBlock.thoughtProcessContent}
                    newSuggestionsContent={activeBlock.newSuggestionsContent}
                />
            ) : (
                 <div className="text-center p-8 text-gray-400">Wybierz blok analizy.</div>
            )}
        </div>
    );
};

export default AnalysisContent;