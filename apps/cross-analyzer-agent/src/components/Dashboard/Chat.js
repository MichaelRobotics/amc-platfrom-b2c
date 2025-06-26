/**
 * @fileoverview The Chat component.
 * This component handles the chat interface. It is a "dumb" component
 * that receives all its data and handlers via props and should not
 * contain any Firebase initialization logic.
 */
import React, { useState, useRef, useEffect } from 'react';

const Chat = ({ messages, onSendMessage, isSending }) => {
    const [currentMessage, setCurrentMessage] = useState('');
    const chatEndRef = useRef(null);
    const textareaRef = useRef(null); // Ref for the textarea

    // Auto-scroll to the latest message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [currentMessage]);

    const handleSend = () => {
        if (currentMessage.trim() && !isSending) {
            onSendMessage(currentMessage.trim());
            setCurrentMessage('');
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-container mt-6 flex flex-col h-[400px] bg-gray-700/50 rounded-lg p-4">
            <div className="chat-messages flex-1 overflow-y-auto mb-4 pr-2">
                {messages.map((msg, index) => (
                    <div key={msg.id || index} className={`message mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg max-w-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-200'}`}>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isSending && (
                     <div className="message mb-3 flex justify-start">
                        <div className="p-3 rounded-lg max-w-lg bg-gray-600 text-gray-200">
                            <p className="thinking-indicator">
                                <span>.</span><span>.</span><span>.</span>
                            </p>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <div className="chat-input grid grid-cols-[1fr_auto] items-center gap-x-6 px-4 py-3">
                <textarea
                    ref={textareaRef} // Add the ref here
                    className="bg-gray-800/70 text-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ease-in-out placeholder-gray-400 overflow-y-auto"
                    placeholder="Zadaj pytanie dotyczące analizy..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows={1}
                    disabled={isSending}
                    style={{ minHeight: '48px', maxHeight: '200px' }}
                />
                <button
                    onClick={handleSend}
                    disabled={isSending || !currentMessage.trim()}
                    className="h-12 w-12 flex items-center justify-center bg-blue-600 text-white rounded-full disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shrink-0"
                >
                    {isSending ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Chat;