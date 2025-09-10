import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiVolume2, FiVolumeX } from 'react-icons/fi';

const ZenMode = ({ onClose }) => {
  const [ambient, setAmbient] = useState(true);
  const [focusMessage, setFocusMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const audioRef = useRef(null);

  const messages = [
    "Stay focused, you're doing great!",
    "One task at a time, you've got this!",
    "Deep work leads to great results!",
    "Every minute counts - keep going!",
    "Your future self will thank you!",
    "Progress, not perfection!",
    "Stay in the flow!",
    "You're building something amazing!"
  ];

  useEffect(() => {
    // Set initial message
    setFocusMessage(messages[0]);
    
    // Rotate messages every 2 minutes
    const messageInterval = setInterval(() => {
      setFocusMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 120000);

    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      clearInterval(messageInterval);
      clearInterval(timeInterval);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    // Handle ambient sounds
    if (ambient && audioRef.current) {
      audioRef.current.play().catch(() => {});
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [ambient]);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white flex flex-col items-center justify-center p-8">
      {/* Ambient Sound */}
      <audio ref={audioRef} src="/medieval-ambient-236809.mp3" loop />

      {/* Top Bar - Date, Time and Controls */}
      <div className="absolute top-4 w-full px-8 flex justify-between items-center">
        {/* Date and Time */}
        <div className="text-center">
          <div className="text-3xl font-light text-white/90">
            {formatTime(currentTime)}
          </div>
          <div className="text-lg text-white/70">
            {formatDate(currentTime)}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex gap-3">
          {/* Music Toggle */}
          <button 
            onClick={() => setAmbient(!ambient)} 
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm"
            title={ambient ? "Mute ambient sounds" : "Play ambient sounds"}
          >
            {ambient ? <FiVolume2 size={20} /> : <FiVolumeX size={20} />}
          </button>
          
          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm"
            title="Exit Zen Mode"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>

      {/* Main Content - Motivation Message */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-4xl font-light text-white/80 text-center max-w-4xl leading-relaxed transition-opacity duration-1000">
          {focusMessage}
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-4 text-white/40 text-sm">
        Press <kbd className="px-2 py-1 bg-white/10 rounded mx-1">Esc</kbd> to exit
      </div>
    </div>
  );
};

export default ZenMode;