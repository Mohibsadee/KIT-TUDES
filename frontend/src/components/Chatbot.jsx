import React, { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiUser,  FiBook, FiClock, FiCoffee, FiTarget } from 'react-icons/fi';
import { LuBotMessageSquare } from "react-icons/lu";


const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI study assistant. I can help with study tips, motivation, and productivity advice. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Generate response with random delay
    setTimeout(() => {
      const botResponse = generateSmartResponse(inputText);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const generateSmartResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Study techniques
    if (input.includes('study technique') || input.includes('how to study') || input.includes('study method')) {
      const techniques = [
        "Try the Feynman Technique: Explain concepts in simple terms as if teaching someone else.",
        "Use spaced repetition with flashcards for better long-term retention.",
        "Active recall: Test yourself instead of just re-reading notes.",
        "Pomodoro method: 25min study + 5min break cycles work wonders!",
        "Create mind maps to visualize connections between concepts."
      ];
      return createBotMessage(techniques[Math.floor(Math.random() * techniques.length)]);
    }

    // Pomodoro related
    if (input.includes('pomodoro') || input.includes('timer') || input.includes('focus session')) {
      return createBotMessage("The Pomodoro Technique (25min work + 5min break) is great for maintaining focus. After 4 sessions, take a longer 15-30min break. Would you like me to suggest some focus tips?");
    }

    // Motivation
    if (input.includes('motivat') || input.includes('tired') || input.includes('burnout') || input.includes('exhaust')) {
      const motivations = [
        "Remember your 'why' - every study session brings you closer to your goals! 🌟",
        "Progress, not perfection! Even 15 minutes of focused study is valuable.",
        "Take a short break, stretch, and come back refreshed. You've got this! 💪",
        "The expert in anything was once a beginner. Keep going!",
        "Your future self will thank you for the effort you're putting in today."
      ];
      return createBotMessage(motivations[Math.floor(Math.random() * motivations.length)]);
    }

    // Breaks
    if (input.includes('break') || input.includes('rest') || input.includes('pause')) {
      return createBotMessage("Great idea! During breaks: stretch, hydrate, look away from screens, or take a short walk. Ideal break duration is 5-10 minutes every 25-50 minutes of study.");
    }

    // Time management
    if (input.includes('time management') || input.includes('schedule') || input.includes('plan')) {
      return createBotMessage("Try time blocking: allocate specific time slots for each subject. Start with the most challenging tasks first (eat the frog!). Use tools like Google Calendar or a physical planner.");
    }

    // Subject specific
    if (input.includes('math') || input.includes('calculus') || input.includes('algebra')) {
      return createBotMessage("For math: practice problems daily, understand concepts before memorizing formulas, and review mistakes. Would you like some problem-solving strategies?");
    }

    if (input.includes('language') || input.includes('vocabulary') || input.includes('grammar')) {
      return createBotMessage("Language learning tip: immerse yourself! Use apps, watch content in that language, practice speaking daily, and learn vocabulary in context.");
    }

    if (input.includes('science') || input.includes('biology') || input.includes('chemistry') || input.includes('physics')) {
      return createBotMessage("For sciences: focus on understanding concepts rather than memorization. Create diagrams, use analogies, and connect theories to real-world examples.");
    }

    // Greetings
    if (input.includes('hello') || input.includes('hi') || input.includes('hey') || input.includes('howdy')) {
      return createBotMessage("Hello! Ready to make today productive? What are you working on?");
    }

    if (input.includes('help') || input.includes('support') || input.includes('advice')) {
      return createBotMessage("I can help with: study techniques, time management, motivation, focus tips, and general study advice. What do you need help with?");
    }

    if (input.includes('thank') || input.includes('thanks')) {
      return createBotMessage("You're welcome! Keep up the great work. Remember, consistency is key to success! 🎯");
    }

    // Default intelligent response
    const defaultResponses = [
      "That's interesting! How's your study session going?",
      "I'm here to support your learning journey. What specific area are you focusing on?",
      "Great point! Have you tried breaking that down into smaller, manageable tasks?",
      "I understand. Would you like some tips on how to approach this?",
      "Learning is a journey! What's your main goal for this study session?",
      "That's a good question. Have you considered creating a study plan for it?"
    ];
    
    return createBotMessage(defaultResponses[Math.floor(Math.random() * defaultResponses.length)]);
  };

  const createBotMessage = (text) => {
    return {
      id: Date.now(),
      text: text,
      sender: 'bot',
      timestamp: new Date()
    };
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const quickReplies = [
    { text: "Study techniques", icon: FiBook },
    { text: "Time management", icon: FiClock },
    { text: "Need motivation", icon: FiTarget },
    { text: "Break suggestions", icon: FiCoffee }
  ];

  return (
    <>
      {/* Chatbot Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-40 hover:shadow-xl"
        >
          <FiMessageSquare size={24} />
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-96 bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <FiMessageSquare size={16} />
              </div>
              <div>
                <span className="font-semibold">Study Assistant</span>
                <p className="text-xs opacity-80">AI-powered study support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.sender === 'bot' && (
                      <LuBotMessageSquare  className="w-4 h-4 mt-1 flex-shrink-0 text-blue-500" />
                    )}
                    <p className="text-sm">{message.text}</p>
                    {message.sender === 'user' && (
                      <FiUser className="w-4 h-4 mt-1 flex-shrink-0 text-white" />
                    )}
                  </div>
                  <div
                    className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <LuBotMessageSquare  className="w-4 h-4 text-blue-500" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2 text-center">Quick options:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => setInputText(reply.text)}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <reply.icon size={12} />
                      {reply.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-gray-200 bg-white rounded-b-2xl"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about study tips, motivation..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiSend size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;