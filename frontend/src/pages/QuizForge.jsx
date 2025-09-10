import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';

const QuizForge = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();



  const [newQuestion, setNewQuestion] = useState({
    question: '',
    type: 'mcq',
    correctAnswer: '',
    options: ['', '', '', ''],
    difficulty: 'easy',
    subject: '' 
  });




  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingLocalStorage, setUsingLocalStorage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  
  
  const questionTypes = [
    { value: 'mcq', label: 'Multiple Choice (MCQ)' },
    { value: 'true_false', label: 'True/False' },
    { value: 'short_answer', label: 'Short Answer' }
  ];

  // Function to get authentication token
  const getAuthToken = async () => {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  // Load questions from localStorage if API fails
  useEffect(() => {
    if (auth.currentUser) {
      fetchQuestions();
    }
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError('');

      // Get authentication token
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Include the token in the request headers
      const response = await axios.get(`${API_BASE_URL}/api/quiz-questions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setQuestions(response.data);
      setUsingLocalStorage(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      // Fallback to localStorage
      const localQuestions = localStorage.getItem(`quizQuestions_${auth.currentUser.uid}`);
      if (localQuestions) {
        setQuestions(JSON.parse(localQuestions));
      } else {
        setQuestions(getDemoQuestions());
      }
      setUsingLocalStorage(true);
      setError('Using local storage - questions will not be saved to cloud');
    } finally {
      setLoading(false);
    }
  };

  const saveQuestionsToLocal = (updatedQuestions) => {
    if (auth.currentUser && usingLocalStorage) {
      localStorage.setItem(`quizQuestions_${auth.currentUser.uid}`, JSON.stringify(updatedQuestions));
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
      }
    ];
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();

    if (!newQuestion.question.trim()) {
      setError('Question text is required');
      return;
    }

    if (newQuestion.type === 'mcq' && newQuestion.options.some(opt => !opt.trim())) {
      setError('All MCQ options must be filled');
      return;
    }

    if (!newQuestion.correctAnswer.trim()) {
      setError('Correct answer is required');
      return;
    }

    try {
      const questionData = {
        ...newQuestion,
        userId: auth.currentUser.uid,
        timesAnswered: 0,
        timesCorrect: 0
      };

      if (usingLocalStorage) {
        // Local storage fallback
        const newQuestionWithId = {
          ...questionData,
          _id: Date.now().toString()
        };
        const updatedQuestions = [...questions, newQuestionWithId];
        setQuestions(updatedQuestions);
        saveQuestionsToLocal(updatedQuestions);
        setSuccessMessage('Question added successfully!');
      } else {
        // API call with authentication token
        const token = await getAuthToken();
        if (!token) {
          throw new Error('No authentication token available');
        }

        const response = await axios.post(`${API_BASE_URL}/api/quiz-questions`, questionData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setQuestions(prev => [...prev, response.data]);
        setSuccessMessage('Question saved to database!');
      }

      // Reset form
      setNewQuestion({
        question: '',
        type: 'mcq',
        correctAnswer: '',
        options: ['', '', '', ''],
        difficulty: 'easy'
      });
      setError('');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      console.error('Error adding question:', error);
      setError('Failed to add question');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      if (usingLocalStorage) {
        // Delete from local storage
        const updatedQuestions = questions.filter(q => q._id !== questionId);
        setQuestions(updatedQuestions);
        saveQuestionsToLocal(updatedQuestions);
        setSuccessMessage('Question deleted successfully!');
      } else {
        // Delete from database with authentication token
        const token = await getAuthToken();
        if (!token) {
          throw new Error('No authentication token available');
        }

        await axios.delete(`${API_BASE_URL}/api/quiz-questions/${questionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setQuestions(prev => prev.filter(q => q._id !== questionId));
        setSuccessMessage('Question deleted from database!');
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting question:', error);
      setError('Failed to delete question');
    }
  };

  const handleSaveAllToDatabase = async () => {
    try {
      // Get authentication token
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Save all questions to database
      for (const question of questions) {
        // Remove the _id to let the database generate a new one
        const { _id, ...questionData } = question;
        await axios.post(`${API_BASE_URL}/api/quiz-questions`, {
          ...questionData,
          userId: auth.currentUser.uid
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      // Refresh questions from database
      await fetchQuestions();
      setSuccessMessage('All questions saved to database!');
      setUsingLocalStorage(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving questions to database:', error);
      setError('Failed to save questions to database');
    }
  };
  const startQuiz = (difficulty = 'all', count = 5) => {
    let filteredQuestions = questions;

    if (difficulty !== 'all') {
      filteredQuestions = questions.filter(q => q.difficulty === difficulty);
    }

    // Shuffle questions and take specified count
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    const quizQuestions = shuffled.slice(0, Math.min(count, shuffled.length));

    setCurrentQuiz(quizQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizFinished(false);
    setScore(0);
  };

  const handleAnswer = (answer) => {
    const currentQuestion = currentQuiz[currentQuestionIndex];
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

    // Update question statistics
    const updatedQuestions = questions.map(q => {
      if (q._id === currentQuestion._id) {
        const timesAnswered = (q.timesAnswered || 0) + 1;
        const timesCorrect = (q.timesCorrect || 0) + (isCorrect ? 1 : 0);
        const accuracy = timesCorrect / timesAnswered;

        let newDifficulty = 'easy';
        if (accuracy < 0.3) newDifficulty = 'hard';
        else if (accuracy < 0.7) newDifficulty = 'medium';

        return {
          ...q,
          timesAnswered,
          timesCorrect,
          difficulty: newDifficulty
        };
      }
      return q;
    });

    setQuestions(updatedQuestions);

    // Update score
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Move to next question or finish quiz
    if (currentQuestionIndex < currentQuiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'badge-success';
      case 'medium': return 'badge-warning';
      case 'hard': return 'badge-error';
      default: return 'badge-neutral';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }





  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <header className="flex flex-col items-center justify-center text-center py-12 px-4 bg-gradient-to-b from-white via-gray-50 to-gray-100">
        {/* Logo / Title */}
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
          QuizForge
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 mt-4 max-w-xl text-base md:text-lg leading-relaxed">
          Craft and master questions for any exam with powerful tools designed to help you practice smarter.
        </p>

        {/* CTA Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate("/exam")}
            className="px-6 py-3 rounded-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            🚀 Take Mock Exam Now
          </button>
        </div>
      </header>


      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex justify-between items-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex justify-between items-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-700">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-green-500 hover:text-green-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Question Form */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Add New Question
            </h2>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                <textarea
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition"
                  placeholder="Enter your question..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                <select
                  value={newQuestion.type}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition"
                >
                  {questionTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {newQuestion.type === 'mcq' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                  <div className="space-y-2">
                    {newQuestion.options.map((option, index) => (
                      <input
                        key={index}
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newQuestion.options];
                          newOptions[index] = e.target.value;
                          setNewQuestion(prev => ({ ...prev, options: newOptions }));
                        }}
                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition"
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correct Answer {newQuestion.type === 'true_false' ? '(true/false)' : ''}
                </label>
                {newQuestion.type === 'true_false' ? (
                  <select
                    value={newQuestion.correctAnswer}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition"
                    required
                  >
                    <option value="">Select</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={newQuestion.correctAnswer}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition"
                    required
                  />
                )}
              </div>
              

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition"
              >
                Add Question
              </button>
            </form>
          </div>

          {/* Quiz Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Practice Quiz
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => startQuiz('all', 5)} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition text-sm">
                Mixed (5)
              </button>
              <button onClick={() => startQuiz('easy', 5)} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition text-sm">
                Easy (5)
              </button>
              <button onClick={() => startQuiz('medium', 5)} className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium py-2.5 px-4 rounded-lg transition text-sm">
                Medium (5)
              </button>
              <button onClick={() => startQuiz('hard', 5)} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition text-sm">
                Hard (5)
              </button>

            </div>
          </div>
        </div>

        {/* Right Column - Question Bank */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              Question Bank
              <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {questions.length}
              </span>
            </h2>
            {usingLocalStorage && (
              <button onClick={handleSaveAllToDatabase} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-1.5 px-3 rounded-lg transition flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Save All
              </button>
            )}
          </div>

          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Question</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Difficulty</th>
                    <th className="px-4 py-3 text-left">Accuracy</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {questions.map((question) => (
                    <tr key={question._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 max-w-xs truncate">{question.question}</td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                          {question.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {question.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {question.timesAnswered > 0 ? (
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                              <div
                                className="bg-green-600 h-1.5 rounded-full"
                                style={{ width: `${(question.timesCorrect / question.timesAnswered) * 100}%` }}
                              ></div>
                            </div>
                            {Math.round((question.timesCorrect / question.timesAnswered) * 100)}%
                          </div>
                        ) : (
                          <span className="text-gray-400">Not attempted</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteQuestion(question._id)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Current Quiz Display */}
      {currentQuiz.length > 0 && !quizFinished && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500">
                Question {currentQuestionIndex + 1} of {currentQuiz.length}
              </span>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${currentQuiz[currentQuestionIndex].difficulty === 'easy' ? 'bg-green-100 text-green-800' :
              currentQuiz[currentQuestionIndex].difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
              {currentQuiz[currentQuestionIndex].difficulty}
            </span>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            {currentQuiz[currentQuestionIndex].question}
          </h3>

          <div className="space-y-3">
            {currentQuiz[currentQuestionIndex].type === 'true_false' ? (
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
            ) : currentQuiz[currentQuestionIndex].type === 'mcq' ? (
              currentQuiz[currentQuestionIndex].options.map((option, index) => (
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
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition p-3"
                  placeholder="Type your answer and press Enter"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quiz Results */}
      {quizFinished && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Completed!</h2>
          <p className="text-3xl font-bold text-blue-600 mb-2">
            {score} / {currentQuiz.length}
          </p>
          <p className="text-gray-600 mb-6">
            Accuracy: {Math.round((score / currentQuiz.length) * 100)}%
          </p>
          <button
            onClick={() => startQuiz()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};
export default QuizForge;