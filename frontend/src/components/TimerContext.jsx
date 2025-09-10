// TimerContext.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const TimerContext = createContext();

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('normal');
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [pomodoroPhase, setPomodoroPhase] = useState('work');
  const timerRef = useRef(null);

  // Pomodoro settings
  const POMODORO_WORK_TIME = 25 * 60;
  const POMODORO_BREAK_TIME = 5 * 60;

  // Load timer state from localStorage on provider mount
  useEffect(() => {
    const savedTime = parseInt(localStorage.getItem('timerTime') || '0');
    const savedIsRunning = localStorage.getItem('timerRunning') === 'true';
    const savedStartTime = parseInt(localStorage.getItem('timerStartTime') || '0');
    const savedMode = localStorage.getItem('timerMode') || 'normal';
    const savedPomodoroCount = parseInt(localStorage.getItem('pomodoroCount') || '0');
    const savedPomodoroPhase = localStorage.getItem('pomodoroPhase') || 'work';
    
    setTime(savedTime);
    setMode(savedMode);
    setPomodoroCount(savedPomodoroCount);
    setPomodoroPhase(savedPomodoroPhase);
    
    if (savedIsRunning && savedStartTime > 0) {
      const elapsedSeconds = Math.floor((Date.now() - savedStartTime) / 1000);
      setTime(savedTime + elapsedSeconds);
      setIsRunning(true);
      startTimer();
    }
  }, []);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('timerTime', time.toString());
    localStorage.setItem('timerRunning', isRunning.toString());
    localStorage.setItem('timerMode', mode);
    localStorage.setItem('pomodoroCount', pomodoroCount.toString());
    localStorage.setItem('pomodoroPhase', pomodoroPhase);
    
    if (isRunning) {
      localStorage.setItem('timerStartTime', Date.now().toString());
    } else {
      localStorage.removeItem('timerStartTime');
    }
  }, [time, isRunning, mode, pomodoroCount, pomodoroPhase]);

  const startTimer = () => {
    timerRef.current = setInterval(updateTimer, 1000);
  };

  const updateTimer = () => {
    setTime(prev => {
      const newTime = prev + 1;
      
      // Pomodoro logic
      if (mode === 'pomodoro') {
        const timeLimit = pomodoroPhase === 'work' ? POMODORO_WORK_TIME : POMODORO_BREAK_TIME;
        
        if (newTime >= timeLimit) {
          // Timer completed current phase
          if (pomodoroPhase === 'work') {
            // Completed a work session
            const newCount = pomodoroCount + 1;
            setPomodoroCount(newCount);
            setPomodoroPhase('break');
            
            // Notify user
            if (Notification.permission === 'granted') {
              new Notification('Pomodoro Completed!', {
                body: `Take a ${POMODORO_BREAK_TIME / 60} minute break. You've completed ${newCount} pomodoros.`
              });
            }
            
            return 0; // Reset timer for break
          } else {
            // Break completed
            setPomodoroPhase('work');
            
            // Notify user
            if (Notification.permission === 'granted') {
              new Notification('Break Over!', {
                body: 'Time to get back to work.'
              });
            }
            
            return 0; // Reset timer for work
          }
        }
      }
      
      return newTime;
    });
  };

  const handleStart = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTimer();
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    clearInterval(timerRef.current);
  };

  const handleReset = () => {
    setIsRunning(false);
    clearInterval(timerRef.current);
    setTime(0);
    setPomodoroPhase('work');
  };

  const toggleMode = () => {
    if (isRunning) {
      handlePause();
    }
    setMode(prev => prev === 'normal' ? 'pomodoro' : 'normal');
    setTime(0);
    setPomodoroPhase('work');
  };

  const value = {
    time,
    isRunning,
    mode,
    pomodoroCount,
    pomodoroPhase,
    handleStart,
    handlePause,
    handleReset,
    toggleMode,
    POMODORO_WORK_TIME,
    POMODORO_BREAK_TIME
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};