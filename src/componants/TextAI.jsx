import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { FaMicrophone, FaArrowUp } from 'react-icons/fa'; // Import icons

const TextAI = () => {
  // State for user input
  const [prompt, setPrompt] = useState('');
  // State for chat messages (array of { role: 'user'/'ai', text: string, timestamp: string })
  const [messages, setMessages] = useState([]);
  // State for loading status
  const [loading, setLoading] = useState(false);
  // State for error messages
  const [error, setError] = useState(null);
  // State for typing indicator
  const [isTyping, setIsTyping] = useState(false);
  // State for speech recognition
  const [isListening, setIsListening] = useState(false);
  // State to track if first message has been sent
  const [isFirstMessageSent, setIsFirstMessageSent] = useState(false);
  // Ref for auto-scrolling to the latest message
  const messagesEndRef = useRef(null);
  // Ref for speech recognition instance
  const recognitionRef = useRef(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('chatMessages');
    if (saved) {
      setMessages(JSON.parse(saved));
      setIsFirstMessageSent(true); // If messages exist, assume first message was sent
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to the bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing indicator
  useEffect(() => {
    if (prompt.trim()) {
      setIsTyping(true);
      const timeout = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [prompt]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMessage = {
      role: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages([...messages, userMessage]);
    setPrompt('');
    setLoading(true);
    setError(null);

    // Set first message sent flag if it's the first message
    if (messages.length === 0) {
      setIsFirstMessageSent(true);
    }

    try {
      const res = await axios.post('http://localhost:5000/ai/askai', { prompt });
      const aiMessage = {
        role: 'ai',
        text: res.data,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setError('Failed to connect to AI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Clear chat history
  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    setPrompt('');
    localStorage.removeItem('chatMessages');
    setIsFirstMessageSent(false); // Reset position on clear
  };

  // Handle voice input
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Try Chrome or Edge.');
      return;
    }

    if (!recognitionRef.current) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setPrompt(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="chat-app__container flex flex-col h-screen bg-[#1A1A1A] text-white">
      {/* Chat header */}
      <div className="chat-app__header flex justify-between items-center p-4 bg-[#1A1A1A]">
        <h1 className="text-xl font-semibold">AI Chat</h1>
        <button
          onClick={handleClearChat}
          className="chat-app__clear-btn px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition disabled:opacity-50"
          disabled={loading || messages.length === 0}
        >
          Clear Chat
        </button>
      </div>

      {/* Messages area */}
      <div className="chat-app__messages flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`chat-message__bubble max-w-xs p-3 rounded-lg shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
              }`}
            >
              <div className="chat-message__text">
                {msg.role === 'ai' ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  <p>{msg.text}</p>
                )}
              </div>
              <span className="chat-message__timestamp text-xs opacity-70">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        {isTyping && !loading && (
          <div className="chat-message flex justify-end">
            <div className="chat-message__bubble max-w-xs p-3 rounded-lg bg-blue-100 dark:bg-blue-900 text-gray-800 dark:text-gray-100">
              <p className="chat-message__text animate-pulse">User is typing...</p>
            </div>
          </div>
        )}
        {loading && (
          <div className="chat-message flex justify-start">
            <div className="chat-message__bubble max-w-xs p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
              <p className="chat-message__text animate-pulse">Thinking...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="chat-message__error text-center text-red-500 p-2">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className={`chat-app__input-form p-4 ${
          isFirstMessageSent
            ? 'fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md transition-all duration-500'
            : 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md transition-all duration-500'
        }`}
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask anything..."
            className="chat-app__input w-full p-3 pr-24 rounded-full bg-[#2D2D2D] text-white border-none focus:outline-none focus:border-blue-500 disabled:opacity-50"
            disabled={loading}
          />
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`chat-app__mic-btn absolute right-12 top-1/2 -translate-y-1/2 p-2 rounded-full ${
              isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'
            } text-white transition`}
            disabled={loading}
          >
            <FaMicrophone size={16} /> {/* Microphone icon */}
          </button>
          <button
            type="submit"
            className="chat-app__send-btn absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition disabled:opacity-50"
            disabled={loading || !prompt.trim()}
          >
            <FaArrowUp size={16} /> {/* Up arrow icon */}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TextAI;