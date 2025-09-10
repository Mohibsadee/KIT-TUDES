import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { auth } from '../firebase';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { FiClock, FiCoffee } from 'react-icons/fi';
import { FaPlay, FaPause, FaStop, FaSave } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// Create Timer Context
const TimerContext = createContext();

// Custom hook to use the timer
export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

// Timer Provider Component
export const TimerProvider = ({ children }) => {
  const POMODORO_WORK_TIME = 25 * 60;
  const POMODORO_BREAK_TIME = 5 * 60;

  // Load state from localStorage or use defaults
  const loadState = () => {
    try {
      const savedState = localStorage.getItem('timerState');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (e) {
      console.error('Failed to load timer state:', e);
    }

    return {
      time: 0,
      isRunning: false,
      mode: 'normal',
      pomodoroCount: 0,
      pomodoroPhase: 'work'
    };
  };

  const [time, setTime] = useState(loadState().time);
  const [isRunning, setIsRunning] = useState(loadState().isRunning);
  const [mode, setMode] = useState(loadState().mode);
  const [pomodoroCount, setPomodoroCount] = useState(loadState().pomodoroCount);
  const [pomodoroPhase, setPomodoroPhase] = useState(loadState().pomodoroPhase);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const timerState = {
      time,
      isRunning,
      mode,
      pomodoroCount,
      pomodoroPhase
    };

    localStorage.setItem('timerState', JSON.stringify(timerState));
  }, [time, isRunning, mode, pomodoroCount, pomodoroPhase]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    if (mode === 'pomodoro') {
      setPomodoroPhase('work');
    }
  };

  const toggleMode = () => {
    const newMode = mode === 'normal' ? 'pomodoro' : 'normal';
    setMode(newMode);
    setTime(0);
    setIsRunning(false);

    if (newMode === 'pomodoro') {
      setPomodoroPhase('work');
    }
  };

  // Timer logic - runs every second when isRunning is true
  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;

          // Pomodoro logic
          if (mode === 'pomodoro') {
            const timeLimit = pomodoroPhase === 'work'
              ? POMODORO_WORK_TIME
              : POMODORO_BREAK_TIME;

            if (newTime >= timeLimit) {
              // Play alarm sound
              try {
                const audio = new Audio('/alarm-sound.mp3');
                audio.play().catch(e => console.log("Audio play failed:", e));
              } catch (e) {
                console.error("Failed to play alarm:", e);
              }

              // Show notification if permitted
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(
                  `Pomodoro ${pomodoroPhase === 'work' ? 'Break' : 'Work'} Time!`,
                  { body: `Your ${pomodoroPhase} session is complete.` }
                );
              }

              // Switch phase
              if (pomodoroPhase === 'work') {
                setPomodoroPhase('break');
                setPomodoroCount(prev => prev + 1);
                setTime(0);
                return 0;
              } else {
                setPomodoroPhase('work');
                setTime(0);
                return 0;
              }
            }
          }

          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, mode, pomodoroPhase, POMODORO_WORK_TIME, POMODORO_BREAK_TIME]);

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

// TimeTracker Component with built-in TimerProvider
const TimeTracker = ({ userId, compact, detailed }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);

  // Use timer from context
  const {
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
  } = useTimer();

  useEffect(() => {
    fetchSessions();

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const handleBeforeUnload = (e) => {
      if (time > 0 && isRunning) {
        e.preventDefault();
        e.returnValue = 'You have an active timer running. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [time, isRunning]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        console.warn("No authenticated user, skipping fetchSessions");
        return;
      }
      const token = await user.getIdToken();
      const res = await axios.get(`${API_BASE_URL}/api/study-sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(res.data);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const playAlarm = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  useEffect(() => {
    const handleAuthStateChange = (user) => {
      if (!user && time > 0 && isRunning) {
        handleEnd();
      }
    };

    const unsubscribe = auth.onAuthStateChanged(handleAuthStateChange);
    return unsubscribe;
  }, [time, isRunning]);

  const handleEnd = async () => {
    if (time <= 0) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(`${API_BASE_URL}/api/study-sessions`, { duration: time }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newSession = {
        duration: time,
        createdAt: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      };
      setSessions(prev => [...prev, newSession]);
      handleReset();
      setTimeout(() => fetchSessions(), 300);
    } catch (err) {
      console.error("Error saving session:", err);
    }
  };

  useEffect(() => {
    const handleUnload = async (e) => {
      if (time > 0 && isRunning) {
        e.preventDefault();
        if (window.confirm('You have an active timer. Save before leaving?')) {
          await handleEnd();
        } else {
          handleReset();
        }
      }
    };
    window.addEventListener('unload', handleUnload);
    return () => window.removeEventListener('unload', handleUnload);
  }, [time, isRunning]);

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const getPomodoroProgress = () => {
    if (mode !== 'pomodoro') return 0;
    const total = pomodoroPhase === 'work' ? POMODORO_WORK_TIME : POMODORO_BREAK_TIME;
    return (time / total) * 100;
  };

  const getPomodoroRemaining = () => {
    if (mode !== 'pomodoro') return null;
    const total = pomodoroPhase === 'work' ? POMODORO_WORK_TIME : POMODORO_BREAK_TIME;
    return total - time;
  };

  const formatMinutes = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const totalSeconds = sessions.reduce((acc, s) => acc + s.duration, 0);

  const { weeklyData, todayMinutes } = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const weekData = Array(7).fill(0).map((_, idx) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + idx);
      return { date: d.toISOString().split('T')[0], minutes: 0 };
    });

    let todayTotal = 0;
    const todayDate = today.toISOString().split('T')[0];

    sessions.forEach(s => {
      const sDate = new Date(s.createdAt || s.date).toISOString().split('T')[0];
      const minutes = Math.floor(s.duration / 60);
      const index = weekData.findIndex(d => d.date === sDate);
      if (index !== -1) weekData[index].minutes += minutes;
      if (sDate === todayDate) todayTotal += minutes;
    });

    const formatted = weekData.map((d, idx) => ({ day: days[idx], minutes: d.minutes }));
    return { weeklyData: formatted, todayMinutes: todayTotal };
  }, [sessions]);

  const goal = 1440;
  const dynamicTodayMinutes = todayMinutes + (time / 60);
  const progress = Math.min((dynamicTodayMinutes / goal) * 100, 100);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-gray-800"></span>
      </div>
    );
  }

  // --- Compact View ---
  if (compact) {
    return (
      <div className="rounded-2xl p-5 bg-gradient-to-br from-[#DDE6ED] to-[#F8FAFC] border border-[#9DB2BF] shadow-sm flex flex-row justify-between items-center">

        {/* LEFT SECTION */}
        <div className="flex flex-col items-center">
          {/* Mode Selector */}
          <div className="flex gap-2 mb-3 text-xs">
            <button
              onClick={() => {
                if (mode !== "normal") toggleMode();
              }}
              className={`px-3 py-1 rounded-full transition ${mode === "normal"
                ? "bg-[#27374D] text-white"
                : "bg-white/70 text-[#27374D] border border-[#9DB2BF]"
                }`}
            >
              Normal
            </button>
            <button
              onClick={() => {
                if (mode !== "pomodoro") toggleMode();
              }}
              className={`px-3 py-1 rounded-full transition flex items-center gap-1 ${mode === "pomodoro"
                ? "bg-[#27374D] text-white"
                : "bg-white/70 text-[#27374D] border border-[#9DB2BF]"
                }`}
            >
              <FiCoffee size={12} />
              Pomodoro
            </button>
          </div>

          {/* Radial Progress */}
          <div className="w-28 mb-2">
            <CircularProgressbar
              value={mode === "pomodoro" ? getPomodoroProgress() : progress}
              text={
                mode === "pomodoro"
                  ? `${formatMinutes(getPomodoroRemaining())}`
                  : `${dynamicTodayMinutes.toFixed(0)}m`
              }
              styles={buildStyles({
                textSize: "14px",
                pathColor:
                  mode === "pomodoro"
                    ? pomodoroPhase === "work"
                      ? "#ef4444"
                      : "#22c55e"
                    : "#27374D",
                textColor: "#27374D",
                trailColor: "#E2E8F0",
              })}
            />
          </div>

          {/* Sub Info */}
          {mode === "pomodoro" && (
            <p className="text-xs text-[#27374D] font-medium mb-1">
              {pomodoroPhase === "work" ? "Focus Time" : "Break Time"}
            </p>
          )}
          <p className="text-[11px] text-[#526D82]">
            {Math.floor(totalSeconds / 3600)}h{" "}
            {Math.floor((totalSeconds % 3600) / 60)}m total
          </p>
        </div>

        {/* RIGHT SECTION - CONTROL BUTTONS */}
        <div className="flex flex-col gap-3 ml-6">
          <button
            onClick={handleStart}
            disabled={isRunning}
            className="p-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40"
            title="Start"
          >
            <FaPlay size={14} />
          </button>

          <button
            onClick={handlePause}
            disabled={!isRunning}
            className="p-3 rounded-xl bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-40"
            title="Pause"
          >
            <FaPause size={14} />
          </button>

          <button
            onClick={handleReset}
            className="p-3 rounded-xl bg-gray-400 text-white hover:bg-gray-500"
            title="Reset"
          >
            <FaStop size={14} />
          </button>

          <button
            onClick={handleEnd}
            disabled={time === 0}
            className="p-3 rounded-xl bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-40"
            title="Save"
          >
            <FaSave size={14} />
          </button>
        </div>
      </div>
    );
  }

  // --- Default/Detailed Layout ---
  return (
    <div className="max-w-6xl rounded-md mx-auto p-4 sm:p-6 bg-gray-200">
      {/* Hidden audio element for alarms */}
      <audio ref={audioRef} src="/alarm-sound.mp3" preload="auto" />

      <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 text-gray-800">
        <FiClock size={25} /> Time Tracker
      </h2>

      {/* Mode selector */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-lg p-1 shadow-inner flex">
          <button
            onClick={() => {
              if (mode !== 'normal') toggleMode();
            }}
            className={`px-4 py-2 rounded-md transition-colors ${mode === 'normal' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
          >
            Normal Timer
          </button>
          <button
            onClick={() => {
              if (mode !== 'pomodoro') toggleMode();
            }}
            className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${mode === 'pomodoro' ? 'bg-red-500 text-white' : 'text-gray-700'}`}
          >
            <FiCoffee /> Pomodoro
          </button>
        </div>
      </div>

      {/* Pomodoro info */}
      {mode === 'pomodoro' && (
        <div className="mb-4 p-3 bg-white border border-gray-300 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <span className={`font-semibold ${pomodoroPhase === 'work' ? 'text-red-500' : 'text-green-500'}`}>
                {pomodoroPhase === 'work' ? 'Work Time' : 'Break Time'}
              </span>
              <span className="text-sm text-gray-600 ml-2">
                {pomodoroPhase === 'work' ? `${POMODORO_WORK_TIME / 60} min` : `${POMODORO_BREAK_TIME / 60} min`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Pomodoros:</span>
              <span className="font-bold text-red-500">{pomodoroCount}</span>
            </div>
          </div>

          {isRunning && (
            <div className="mt-2 bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${pomodoroPhase === 'work' ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${getPomodoroProgress()}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {/* Timer & Buttons */}
      {detailed && (
        <div className="text-center mb-6">
          {/* Timer Display */}
          <div className="text-5xl font-mono mb-4 text-gray-800 tracking-wider">
            {formatTime(time)}
          </div>

          {/* Pomodoro remaining time */}
          {mode === 'pomodoro' && isRunning && (
            <div className="mb-4 text-lg font-semibold">
              <span className={pomodoroPhase === 'work' ? 'text-red-500' : 'text-green-500'}>
                {pomodoroPhase === 'work' ? 'Work' : 'Break'}: {formatMinutes(getPomodoroRemaining())}
              </span>
            </div>
          )}

          {/* Status Indicator */}
          {isRunning && (
            <div className="mb-4 flex items-center justify-center gap-2 text-green-600">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold">Timer Running (persists across pages)</span>
            </div>
          )}

          {/* Modern Control Buttons */}
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={handleStart}
              disabled={isRunning}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-500 text-white shadow-lg hover:bg-green-600 hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPlay />
              <span>Start</span>
            </button>

            <button
              onClick={handlePause}
              disabled={!isRunning}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-yellow-500 text-white shadow-lg hover:bg-yellow-600 hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPause />
              <span>Pause</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-500 text-white shadow-lg hover:bg-gray-600 hover:scale-105 transition-transform duration-200"
            >
              <FaStop />
              <span>Reset</span>
            </button>

            <button
              onClick={handleEnd}
              disabled={time === 0}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-500 text-white shadow-lg hover:bg-red-600 hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSave />
              <span>Save to Database</span>
            </button>
          </div>
        </div>
      )}

      {/* Radial Progress */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className={detailed ? "w-48" : "w-40"}>
          <CircularProgressbar
            value={mode === 'pomodoro' ? getPomodoroProgress() : progress}
            text={mode === 'pomodoro' ?
              `${formatMinutes(getPomodoroRemaining())}` :
              `${dynamicTodayMinutes.toFixed(1)}m`
            }
            styles={buildStyles({
              textSize: '16px',
              pathColor: mode === 'pomodoro' ?
                (pomodoroPhase === 'work' ? "#ef4444" : "#22c55e") :
                "#27374D",
              textColor: "#27374D",
              trailColor: "#d6d6d6"
            })}
          />
        </div>
        {mode === 'normal' && (
          <p className="text-gray-700">
            Today: <span className="font-semibold">{dynamicTodayMinutes.toFixed(1)}m</span>
          </p>
        )}
      </div>

      {/* Weekly Chart */}
      {detailed && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Weekly Study Time (minutes)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={v => [`${v} minutes`, 'Study Time']} labelFormatter={l => `Day: ${l}`} />
              <Bar dataKey="minutes" fill="#27374D" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Total Study */}
      {detailed && (
        <div className="p-4 rounded-lg bg-white shadow border text-gray-800">
          <h3 className="text-lg font-semibold mb-2">All-Time Study</h3>
          <p className="text-2xl font-bold">{Math.floor(totalSeconds / 3600)}h {Math.floor((totalSeconds % 3600) / 60)}m</p>
          <p className="text-sm text-gray-600">(Only includes saved sessions)</p>
        </div>
      )}
    </div>
  );
};

// Export a wrapped version of TimeTracker
export default function WrappedTimeTracker(props) {
  return (
    <TimerProvider>
      <TimeTracker {...props} />
    </TimerProvider>
  );
}