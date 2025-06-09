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

    // Auto-scroll to the latest message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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
            <div className="chat-input flex items-center border-t border-gray-600 pt-4">
                <textarea
                    className="flex-1 bg-gray-800 text-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Zadaj pytanie dotyczące analizy..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows={2}
                    disabled={isSending}
                />
                <button
                    onClick={handleSend}
                    disabled={isSending || !currentMessage.trim()}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                    {isSending ? 'Wysyłanie...' : 'Wyślij'}
                </button>
            </div>
        </div>
    );
};

export default Chat;