import React, { useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { loadSlim } from "tsparticles-slim";
import { NavLink, useNavigate } from "react-router-dom";



const MockExam = () => {
  const [questions, setQuestions] = useState([]);
  const [currentExam, setCurrentExam] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [examFinished, setExamFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [customTime, setCustomTime] = useState(30); // Default 30 minutes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const navigate = useNavigate();

  // Particles.js initialization
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback((container) => {
    console.log('Particles loaded:', container);
  }, []);

  const particlesOptions = {
    background: {
      color: {
        value: "transparent",
      },
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse",
        },
        onClick: {
          enable: true,
          mode: "push",
        },
        resize: true,
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
        push: {
          quantity: 4,
        },
      },
    },
    particles: {
      color: {
        value: "#3b82f6",
      },
      links: {
        color: "#9ca3af",
        distance: 150,
        enable: true,
        opacity: 0.5,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 2,
        straight: false,
      },
      number: {
        value: 50,
        density: {
          enable: true,
          area: 800,
        },
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 3 },
      },
    },
    detectRetina: true,
  };

  // Load questions from database
  useEffect(() => {
    if (auth.currentUser) {
      fetchQuestions();
    }
  }, []);

  // Timer effect
  useEffect(() => {
    let timer = null;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      finishExam();
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError('');
      const token = await auth.currentUser.getIdToken();
      const response = await axios.get(`${API_BASE_URL}/api/quiz-questions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to load questions. Using demo questions instead.');
      setQuestions(getDemoQuestions());
    } finally {
      setLoading(false);
    }
  };

  const getDemoQuestions = () => {
    return [
      {
        _id: '1',
        question: 'What is 2 + 2?',
        type: 'mcq',
        correctAnswer: '4',
        options: ['3', '4', '5', '6'],
        difficulty: 'easy',
        timesAnswered: 0,
        timesCorrect: 0
      },
      {
        _id: '2',
        question: 'The capital of France is Paris.',
        type: 'true_false',
        correctAnswer: 'true',
        options: ['true', 'false'],
        difficulty: 'easy',
        timesAnswered: 0,
        timesCorrect: 0
      },
      {
        _id: '3',
        question: 'What is the chemical symbol for gold?',
        type: 'mcq',
        correctAnswer: 'Au',
        options: ['Au', 'Ag', 'Fe', 'Gd'],
        difficulty: 'medium',
        timesAnswered: 0,
        timesCorrect: 0
      },
      {
        _id: '4',
        question: 'Which planet is known as the Red Planet?',
        type: 'mcq',
        correctAnswer: 'Mars',
        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        difficulty: 'easy',
        timesAnswered: 0,
        timesCorrect: 0
      },
      {
        _id: '5',
        question: 'The Great Wall of China is visible from space with the naked eye.',
        type: 'true_false',
        correctAnswer: 'false',
        options: ['true', 'false'],
        difficulty: 'medium',
        timesAnswered: 0,
        timesCorrect: 0
      }
    ];
  };

  const startExam = () => {
    // Filter questions by difficulty if needed, or use all questions
    const examQuestions = [...questions].sort(() => Math.random() - 0.5);
    setCurrentExam(examQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setExamFinished(false);
    setScore(0);
    setTimeLeft(customTime * 60); // Convert minutes to seconds
    setIsTimerRunning(true);
  };

  const handleAnswer = (answer) => {
    const currentQuestion = currentExam[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;

    // Update user answers
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion._id]: {
        answer,
        correct: isCorrect,
        timestamp: new Date().toISOString()
      }
    }));

    // Update score
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Move to next question or finish exam
    if (currentQuestionIndex < currentExam.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishExam();
    }
  };

  const finishExam = () => {
    setIsTimerRunning(false);
    setExamFinished(true);
    
    // Update question statistics in the database
    updateQuestionStatistics();
  };

  const updateQuestionStatistics = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      
      for (const questionId in userAnswers) {
        const answerData = userAnswers[questionId];
        const question = questions.find(q => q._id === questionId);
        
        if (question) {
          const timesAnswered = (question.timesAnswered || 0) + 1;
          const timesCorrect = (question.timesCorrect || 0) + (answerData.correct ? 1 : 0);
          
          await axios.put(
            `${API_BASE_URL}/api/quiz-questions/${questionId}`,
            {
              timesAnswered,
              timesCorrect
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
        }
      }
      
      // Refresh questions to get updated statistics
      fetchQuestions();
    } catch (error) {
      console.error('Error updating question statistics:', error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Particles Background */}
      <div className="absolute inset-0 z-0">
        <Particles
          id="tsparticles"
          init={particlesInit}
          loaded={particlesLoaded}
          options={particlesOptions}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-6">
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Mock Exam
          </h1>
          <p className="text-gray-600 mt-2">Test your knowledge under timed conditions</p>
        </header>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Exam Setup */}
        {!isTimerRunning && !examFinished && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Exam Settings</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Exam Duration (minutes)</label>
              <input
                type="number"
                min="1"
                max="180"
                value={customTime}
                onChange={(e) => setCustomTime(parseInt(e.target.value) || 1)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                You have <span className="font-semibold">{questions.length}</span> questions available for this exam.
              </p>
            </div>
            
            <button
              onClick={startExam}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
            >
              Start Exam
            </button>
          </div>
        )}

        {/* Timer Display */}
        {isTimerRunning && (
          <div className="bg-white rounded-2xl shadow-md p-4 mb-6 flex justify-between items-center">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-lg font-semibold">{formatTime(timeLeft)}</span>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">
                Question {currentQuestionIndex + 1} of {currentExam.length}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentExam[currentQuestionIndex]?.difficulty)}`}>
                {currentExam[currentQuestionIndex]?.difficulty}
              </span>
            </div>
          </div>
        )}

        {/* Current Exam Question */}
        {isTimerRunning && currentExam.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              {currentExam[currentQuestionIndex].question}
            </h3>

            <div className="space-y-3">
              {currentExam[currentQuestionIndex].type === 'true_false' ? (
                <>
                  <button 
                    onClick={() => handleAnswer('true')} 
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition"
                  >
                    True
                  </button>
                  <button 
                    onClick={() => handleAnswer('false')} 
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition"
                  >
                    False
                  </button>
                </>
              ) : currentExam[currentQuestionIndex].type === 'mcq' ? (
                currentExam[currentQuestionIndex].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition"
                  >
                    {option}
                  </button>
                ))
              ) : (
                <div>
                  <input
                    type="text"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAnswer(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Type your answer and press Enter"
                  />
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-between">
              {currentQuestionIndex > 0 && (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Previous
                </button>
              )}
              
              <div className="flex-grow"></div>
              
              <button
                onClick={() => {
                  if (currentQuestionIndex < currentExam.length - 1) {
                    setCurrentQuestionIndex(prev => prev + 1);
                  } else {
                    finishExam();
                  }
                }}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                {currentQuestionIndex < currentExam.length - 1 ? 'Next' : 'Finish Exam'}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Exam Results */}
        {examFinished && (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Exam Completed!</h2>
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {score} / {currentExam.length}
            </p>
            <p className="text-gray-600 mb-6">
              Accuracy: {Math.round((score / currentExam.length) * 100)}%
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button 
                onClick={() => navigate("/quizforge") } 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 px-4 rounded-lg transition"
              >
                Back to Setup
              </button>
              <button 
                onClick={startExam} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockExam;