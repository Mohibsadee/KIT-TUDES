import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { FaEdit } from "react-icons/fa";
import { useNavigate, useLocation } from 'react-router-dom';

const UpcomingClass = ({ compact = false }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // Added useLocation

  const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });

  useEffect(() => {
    if (auth.currentUser) fetchClasses();
  }, [location.state]); // Added location.state as dependency

  const fetchClasses = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.get(`${API_BASE_URL}/api/classes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(response.data);
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-gray-800"></span>
      </div>
    );
  }

  const classesByDay = days.reduce((acc, day) => {
    acc[day] = classes
      .filter(cls => cls.day === day)
      .sort((a, b) => a.time.localeCompare(b.time));
    return acc;
  }, {});

  const renderClassCard = (cls, isToday) => {
    const isSelected = selectedSubject === cls.subject;

    return (
      <div
        key={cls._id}
        onClick={() =>
          setSelectedSubject(prev =>
            prev === cls.subject ? null : cls.subject
          )
        }
        className={`cursor-pointer p-3 rounded-lg items-center border transition-all flex flex-col gap-1
          ${isSelected
            ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
            : isToday
              ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-white'
              : 'bg-gray-50 border-gray-100 hover:bg-gray-100 text-gray-800'}
        `}
      >
        <span className="font-semibold text-base">{cls.subject}</span>
        <span className="text-sm">{cls.time}</span>
        {cls.instructor && <span className="text-sm">{cls.instructor}</span>}
      </div>
    );
  };

  if (compact) {
    return (
      <div className="max-w-6xl rounded-md mx-auto p-4 sm:p-6 bg-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Class Calendar</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-6">
          {days.map(day => {
            const isToday = day === today;

            return (
              <div
                key={day}
                className={`rounded-xl p-4 shadow-sm border transition-all duration-300
                  ${isToday
                    ? 'bg-gray-900 text-white border-gray-800 shadow-lg scale-[1.02]'
                    : 'bg-white border-gray-200 hover:shadow-md hover:scale-[1.01]'}
                `}
              >
                <h3 className="font-semibold text-lg text-center mb-4 tracking-wide">
                  {day}
                </h3>

                {classesByDay[day].length > 0 ? (
                  <div className="space-y-3">
                    {classesByDay[day].map(cls => renderClassCard(cls, isToday))}
                  </div>
                ) : (
                  <p
                    className={`text-center text-sm mt-3 italic 
                      ${isToday ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    No classes
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-6">
        {days.map(day => {
          const isToday = day === today;

          return (
            <div
              key={day}
              className={`rounded-xl p-4 shadow-sm border transition-all duration-300
                ${isToday
                  ? 'bg-gray-900 text-white border-gray-800 shadow-lg scale-[1.02]'
                  : 'bg-white border-gray-200 hover:shadow-md hover:scale-[1.01]'}
              `}
            >
              <h3 className="font-semibold text-lg text-center mb-4 tracking-wide">
                {day}
              </h3>

              {classesByDay[day].length > 0 ? (
                <div className="space-y-3">
                  {classesByDay[day].map(cls => renderClassCard(cls, isToday))}
                </div>
              ) : (
                <p
                  className={`text-center text-sm mt-3 italic 
                    ${isToday ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  No classes
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className='flex flex-col w-full justify-center p-6  items-right'>
        {!compact && (
          <button
            onClick={() => navigate('/classflow')}
            title="Edit Study Goals"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 
                  bg-white shadow-md border border-gray-200 rounded-xl 
                  hover:shadow-lg hover:bg-gray-50 transition-all text-gray-800 font-medium"
          >
            <FaEdit size={20} className="text-blue-600" />
            <span>Edit Classes</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default UpcomingClass;