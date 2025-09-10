import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router';

import { FaEdit } from "react-icons/fa";
import { FiTarget, FiCalendar, FiBook } from 'react-icons/fi';
import { BsCalendar3Week } from "react-icons/bs";

const StudyGoals = ({ userId, compact, detailed }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = new Date().getDay();

  useEffect(() => {
    if (auth.currentUser) fetchTasks();
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) fetchTasks();
    });
    return unsubscribe;
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken();
      const response = await axios.get(`${API_BASE_URL}/api/study-tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const todayTasks = tasks.filter(task => !task.completed && task.day === days[todayIndex]);

  const nextDayTasks = (() => {
    for (let i = 1; i <= 7; i++) {
      const nextIndex = (todayIndex + i) % 7;
      const tasksForDay = tasks.filter(task => !task.completed && task.day === days[nextIndex]);
      if (tasksForDay.length > 0) return { day: days[nextIndex], tasks: tasksForDay };
    }
    return null;
  })();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-gray-800"></span>
      </div>
    );
  }

  /** ---------- compact/detailed content ---------- */
  const Content = () => (
    <div className="max-w-6xl rounded-md mx-auto p-4 sm:p-6 bg-gray-200">


      {/* Today's Tasks */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold flex items-center gap-2 mb-4 text-gray-800">
          <FiCalendar size={25} className="text-gray-800" />
          Today's Study Plan
        </h3>
        {todayTasks.length === 0 ? (
          <p className="text-gray-500 italic bg-white/80 p-4 rounded-lg border border-gray-200">
            No study plan for today. Enjoy your free time!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayTasks.map(task => (
              <div
                key={task._id}
                className="p-3 rounded-md shadow-sm border border-gray-100 bg-white text-gray-800 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{task.subject}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${task.priority === "high"
                      ? "bg-red-100 text-red-700"
                      : task.priority === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                      }`}
                  >
                    {task.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2 truncate">{task.topic}</p>
                <div className="flex flex-wrap justify-between gap-2 text-gray-500 text-xs">
                  <span>⏰ {task.timeSlot}</span>
                  <span>⏱️ {task.timeRequired} mins</span>
                  {task.deadline && (
                    <span>📅 {new Date(task.deadline).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Next Day Tasks */}
      {nextDayTasks && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold flex items-center gap-2 mb-4 text-gray-800">
            <FiBook size={25} className="text-gray-800" />
            Next Study Plan: {nextDayTasks.day}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nextDayTasks.tasks.map(task => (
              <div
                key={task._id}
                className="p-3 rounded-md shadow-sm border border-gray-100 bg-white text-gray-800 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{task.subject}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${task.priority === "high"
                      ? "bg-red-100 text-red-700"
                      : task.priority === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                      }`}
                  >
                    {task.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2 truncate">{task.topic}</p>
                <div className="flex flex-wrap justify-between gap-2 text-gray-500 text-xs">
                  <span>⏰ {task.timeSlot}</span>
                  <span>⏱️ {task.timeRequired} mins</span>
                  {task.deadline && (
                    <span>📅 {new Date(task.deadline).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Overview */}
      {(detailed || compact) && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold flex items-center gap-2 mb-4 text-gray-800">
            <BsCalendar3Week size={25} className="text-gray-800" />
            Weekly Study Overview
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {days.map(day => {
              const dayTasks = tasks.filter(
                task => !task.completed && task.day === day
              );
              const isToday = day === days[todayIndex];

              return (
                <div
                  key={day}
                  className={`rounded-lg p-4 text-center flex flex-col border border-gray-200 ${isToday
                    ? "bg-gray-900 text-white"
                    : "bg-white/80 backdrop-blur-md text-gray-800"
                    }`}
                >
                  <h4 className="font-semibold text-center mb-3">
                    {day.substring(0, 3)}
                  </h4>

                  {dayTasks.length > 0 ? (
                    <div className="space-y-2 text-center">
                      {dayTasks.slice(0, 3).map(task => (
                        <div
                          key={task._id}
                          className={`p-2 rounded-md text-xs ${isToday
                            ? "bg-gray-800 text-white"
                            : "bg-white text-gray-800"
                            }`}
                        >
                          <div className="flex flex-col items-center">
                            <span className="font-medium truncate">{task.subject}</span>
                            <p className="truncate">{task.timeSlot}</p>
                          </div>
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <p
                          className={`text-xs text-center ${isToday ? "text-gray-300" : "text-gray-500"
                            }`}
                        >
                          +{dayTasks.length - 3} more
                        </p>
                      )}
                    </div>
                  ) : (
                    <p
                      className={`text-xs mt-2 ${isToday ? "text-gray-300" : "text-gray-500"
                        }`}
                    >
                      No tasks
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  /** ---------- Final Return ---------- */
  return (
    <>

      <Content />
      
      <div className='flex flex-col w-full justify-center p-6  items-center'>

        {!compact && (
          <button
            onClick={() => navigate('/studyboost')}
            title="Edit Study Goals"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 
               bg-white shadow-md border border-gray-200 rounded-xl 
               hover:shadow-lg hover:bg-gray-50 transition-all text-gray-800 font-medium"
          >
            <FaEdit size={20} className="text-blue-600" />
            <span>Edit Study Goals</span>
          </button>
        )}
      </div>


    </>
  );
};

export default StudyGoals;
