import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { NavLink, useNavigate } from "react-router-dom";

const ClassFlow = () => {
  const navigate = useNavigate();
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

  const daysOfWeek = ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];

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
    if (auth.currentUser) fetchClasses();
    else setLoading(false);
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
      console.error(err);
      setError('Failed to fetch classes.');
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
      color: 'white',
    });
    setEditingId(cls._id);
    setOverlapWarning('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this class?')) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(`${API_BASE_URL}/api/classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchClasses();
      // Navigate back with refresh flag
      navigate('/', { state: { refreshClasses: true } });
    } catch (err) {
      console.error(err);
      setError('Failed to delete class.');
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
        await axios.put(`${API_BASE_URL}/api/classes/${editingId}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API_BASE_URL}/api/classes`, formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      setFormData({ subject: '', time: '', duration: 60, day: 'Monday', instructor: '', color: 'white' });
      setEditingId(null);
      fetchClasses();
      // Navigate back with refresh flag
      navigate('/', { state: { refreshClasses: true } });
    } catch (err) {
      console.error(err);
      setError('Failed to save class.');
    }
  };

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  if (loading) return <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg text-gray-800"></span></div>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-[#f2f2f2] min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">ClassFlow</h1>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      <div className="bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-md mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Class' : 'Add New Class'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input className="input input-bordered bg-white/30 text-gray-800" placeholder="Subject" name="subject" value={formData.subject} onChange={handleInputChange} required />
            <input className="input input-bordered bg-white/30 text-gray-800" type="time" name="time" value={formData.time} onChange={handleInputChange} required />
            <input className="input input-bordered bg-white/30 text-gray-800" type="number" name="duration" value={formData.duration} onChange={handleInputChange} min="15" max="240" step="15" required placeholder="Duration" />
            <select className="select select-bordered bg-white/30 text-gray-800" name="day" value={formData.day} onChange={handleInputChange} required>
              {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
            </select>
            <input className="input input-bordered bg-white/30 text-gray-800" name="instructor" value={formData.instructor} onChange={handleInputChange} placeholder="Instructor" />
          </div>

          {overlapWarning && <div className="alert alert-warning">{overlapWarning}</div>}

          <div className="flex space-x-4 mt-4">
            <button className="btn btn-primary bg-[#b6b09f] border-none hover:bg-[#eae4d5] text-gray-800">{editingId ? 'Update' : 'Add'}</button>
            {editingId && <button type="button" className="btn btn-ghost text-gray-800" onClick={() => { setFormData({ subject: '', time: '', duration: 60, day: 'Monday', instructor: '', color: 'white' }); setEditingId(null); setOverlapWarning(''); }}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="grid gap-4">
        {classes.length > 0 ? classes.map(cls => (
          <div key={cls._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">{cls.subject}</h3>
                <p className="text-gray-600">{cls.time} • {cls.duration} mins • {cls.day}</p>
                {cls.instructor && <p className="text-gray-500">Instructor: {cls.instructor}</p>}
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(cls)} className="btn btn-sm btn-ghost text-gray-800">Edit</button>
                <button onClick={() => handleDelete(cls._id)} className="btn btn-sm btn-ghost text-gray-800">Delete</button>
              </div>
            </div>
          </div>
        )) : <p className="text-gray-500 text-center py-8">No classes added yet.</p>}
      </div>
    </div>
  );
};

export default ClassFlow;