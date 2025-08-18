import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { FaMicrophone, FaArrowUp, FaPlus } from 'react-icons/fa';
import Sidebar from './Sidebar'; // Import the new Sidebar component
import JLogo from './JLogo';

const TextAI = () => {
  // State for user input
  const [prompt, setPrompt] = useState('');
  // State for chat messages (array of { role: 'user'/'ai', text?: string, imageSrc?: string, timestamp: string })
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
  // State for source menu
  const [showMenu, setShowMenu] = useState(false);
  // State for sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Ref for auto-scrolling to the latest message
  const messagesEndRef = useRef(null);
  // Ref for speech recognition instance
  const recognitionRef = useRef(null);
  // Ref for file input
  const fileInputRef = useRef(null);

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

  // Handle form submission (for text AI)
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
    } catch {
      setError('Failed to connect to AI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle generate image
  const handleGenerateImage = async () => {
    setShowMenu(false);
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image.');
      return;
    }

    const userMessage = {
      role: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages([...messages, userMessage]);
    setPrompt('');
    setLoading(true);
    setError(null);

    if (messages.length === 0) {
      setIsFirstMessageSent(true);
    }

    try {
      const res = await axios.post('http://localhost:5000/ai/imgai', { prompt });
      const aiMessage = {
        role: 'ai',
        imageSrc: res.data.image, // Base64 string
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setError('Failed to generate image. Check backend.');
    } finally {
      setLoading(false);
    }
  };

  // Handle choose file
  const handleChooseFile = () => {
    setShowMenu(false);
    fileInputRef.current.click();
  };

  // Handle file change (read as base64)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      const userMessage = {
        role: 'user',
        imageSrc: base64,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, userMessage]);
    };
    reader.readAsDataURL(file);
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
    <div className="chat-app relative min-h-screen bg-black text-white flex flex-col">
      {/* Sidebar component: pass onClose so Sidebar can close itself */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Chat header */}
      <header className="chat-app__header p-4 bg-[#1A1A1A] flex justify-between items-center">
        <h1
          className="text-2xl font-bold cursor-pointer"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {/* JERRY */}
          <JLogo size={50} />
        </h1>
      </header>

      {/* Messages area */}
      <div className="chat-app__messages flex-1 p-4 overflow-y-auto space-y-4 pb-24">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-app__message flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'
              }`}
          >
            <div
              className={`p-3 rounded-lg max-w-xs ${msg.role === 'ai' ? 'bg-gray text-white' : 'bg-blue text-white'
                }`}
            >
              {msg.role === 'ai' ? (
                <>
                  {msg.text && <ReactMarkdown>{msg.text}</ReactMarkdown>}
                  {msg.imageSrc && (
                    <img
                      src={msg.imageSrc}
                      alt="Generated image"
                      className="max-w-xs rounded-md mt-2"
                    />
                  )}
                </>
              ) : (
                <>
                  {msg.text && <p>{msg.text}</p>}
                  {msg.imageSrc && (
                    <img
                      src={msg.imageSrc}
                      alt="User image"
                      className="max-w-xs rounded-md mt-2"
                    />
                  )}
                </>
              )}
              <span className="text-xs text-gray-400 block mt-1">{msg.timestamp}</span>
            </div>
          </div>
        ))}
        {isTyping && !loading && (
          <div className="chat-app__typing text-gray-400">User is typing...</div>
        )}
        {loading && <div className="chat-app__loading text-gray-400">Thinking...</div>}
        {error && (
          <div className="chat-app__error text-red-500 bg-red-100 p-2 rounded">{error}</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="chat-app__form">
        <div className="chat-app__input-container flex items-center fixed bottom-0 left-0 right-0 p-4 bg-black z-10">
          <div className="relative flex-1">
            {/* Source button (plus icon) */}
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <FaPlus />
            </button>

            {/* Source menu */}
            {showMenu && (
              <div className="absolute bottom-full mb-2 left-0 bg-[#2D2D2D] p-2 rounded shadow-lg z-20">
                <button
                  onClick={handleGenerateImage}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-600"
                >
                  Generate Image
                </button>
                <button
                  onClick={handleChooseFile}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-600"
                >
                  Choose Other Files
                </button>
              </div>
            )}

            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything..."
              className="chat-app__input w-full p-3 pl-10 pr-24 rounded-full bg-[#2D2D2D] text-white border-none focus:outline-none focus:border-blue-500 disabled:opacity-50"
              disabled={loading}
            />
            {/* Microphone icon */}
            <button
              type="button"
              onClick={handleVoiceInput}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <FaMicrophone className={isListening ? 'text-red-500' : ''} />
            </button>
            {/* Up arrow icon */}
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white disabled:opacity-50"
            >
              <FaArrowUp />
            </button>
          </div>
        </div>
      </form>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        hidden
      />
    </div>
  );
};

export default TextAI;
