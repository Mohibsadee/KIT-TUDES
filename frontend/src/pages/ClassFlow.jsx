import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const ClassFlow = () => {
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    subject: '',
    time: '',
    duration: 60,
    day: 'Mon',
    instructor: '',
    color: 'white',
  });
  const [editingId, setEditingId] = useState(null);
  const [overlapWarning, setOverlapWarning] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const convertTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const checkForOverlap = (newTime, newDuration, newDay, editingId) => {
    const newStart = convertTimeToMinutes(newTime);
    const newEnd = newStart + parseInt(newDuration);
    for (const cls of classes) {
      if (editingId && cls._id === editingId) continue;
      if (cls.day !== newDay) continue;
      const existingStart = convertTimeToMinutes(cls.time);
      const existingEnd = existingStart + cls.duration;
      if (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      ) {
        return `This class overlaps with ${cls.subject} (${cls.time} - ${formatTime(existingEnd)}).`;
      }
    }
    return null;
  };

  useEffect(() => {
    if (auth.currentUser) {
      fetchClasses();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError('');
      const token = await auth.currentUser.getIdToken();
      const response = await axios.get(`${API_BASE_URL}/api/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(response.data);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to fetch classes. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cls) => {
    setFormData({
      subject: cls.subject,
      time: cls.time,
      duration: cls.duration,
      day: cls.day,
      instructor: cls.instructor || '',
      color: cls.color || 'white',
    });
    setEditingId(cls._id);
    setOverlapWarning('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(`${API_BASE_URL}/api/classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Just refresh the data, don't navigate away
      fetchClasses();
    } catch (err) {
      console.error('Error deleting class:', err);
      setError('Failed to delete class. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const overlap = checkForOverlap(formData.time, formData.duration, formData.day, editingId);
    if (overlap) return setOverlapWarning(overlap);
    
    setOverlapWarning('');
    try {
      const token = await auth.currentUser.getIdToken();
      if (editingId) {
        await axios.put(`${API_BASE_URL}/api/classes/${editingId}`, formData, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/classes`, formData, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
      }
      // Reset form and refresh data
      setFormData({ subject: '', time: '', duration: 60, day: 'Mon', instructor: '', color: 'white' });
      setEditingId(null);
      fetchClasses();
    } catch (err) {
      console.error('Error saving class:', err);
      setError('Failed to save class. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-gray-800"></span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">ClassFlow</h1>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
          <button onClick={() => setError('')} className="btn btn-sm btn-ghost">×</button>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Class' : 'Add New Class'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              className="input input-bordered w-full"
              placeholder="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
            />
            <input
              className="input input-bordered w-full"
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              required
            />
            <input
              className="input input-bordered w-full"
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              min="15"
              max="240"
              step="15"
              required
              placeholder="Duration (minutes)"
            />
            <select
              className="select select-bordered w-full"
              name="day"
              value={formData.day}
              onChange={handleInputChange}
              required
            >
              {daysOfWeek.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <input
              className="input input-bordered w-full"
              name="instructor"
              value={formData.instructor}
              onChange={handleInputChange}
              placeholder="Instructor (optional)"
            />
          </div>

          {overlapWarning && (
            <div className="alert alert-warning">
              <span>{overlapWarning}</span>
            </div>
          )}

          <div className="flex space-x-4">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update Class' : 'Add Class'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setFormData({ subject: '', time: '', duration: 60, day: 'Mon', instructor: '', color: 'white' });
                  setEditingId(null);
                  setOverlapWarning('');
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Your Classes</h2>
        {classes.length > 0 ? (
          classes.map(cls => (
            <div key={cls._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{cls.subject}</h3>
                  <p className="text-gray-600">
                    {cls.time} • {cls.duration} mins • {cls.day}
                  </p>
                  {cls.instructor && (
                    <p className="text-gray-500">Instructor: {cls.instructor}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(cls)}
                    className="btn btn-sm btn-outline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cls._id)}
                    className="btn btn-sm btn-error btn-outline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No classes added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassFlow;