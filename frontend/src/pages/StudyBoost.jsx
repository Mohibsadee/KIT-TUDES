import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const priorityOptions = [
  { value: 'high', name: 'High', color: 'bg-red-200' },
  { value: 'medium', name: 'Medium', color: 'bg-yellow-200' },
  { value: 'low', name: 'Low', color: 'bg-green-200' }
];
const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

const StudyBoost = () => {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    subject: '', topic: '', priority: 'medium', deadline: '',
    timeRequired: 60, day: 'Monday', timeSlot: '09:00'
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${auth.currentUser?.stsTokenManager?.accessToken}` }
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/api/study-tasks`, getAuthHeader());
      setTasks(response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.currentUser) fetchTasks();
    const unsubscribe = auth.onAuthStateChanged(user => { if (user) fetchTasks(); });
    return unsubscribe;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, completed: false };
      if (editingId) {
        await axios.put(`${API_BASE_URL}/api/study-tasks/${editingId}`, payload, getAuthHeader());
      } else {
        await axios.post(`${API_BASE_URL}/api/study-tasks`, payload, getAuthHeader());
      }
      resetForm();
      fetchTasks();
    } catch (err) {
      console.error('Error saving task:', err);
      setError(err.response?.data?.message || 'Failed to save task');
    }
  };

  const handleEdit = (task) => {
    setFormData({ ...task });
    setEditingId(task._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/study-tasks/${id}`, getAuthHeader());
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleComplete = async (id, completed) => {
    try {
      setTasks(prev => prev.map(t => t._id === id ? { ...t, completed: !completed } : t));
      await axios.patch(`${API_BASE_URL}/api/study-tasks/${id}`, { completed: !completed }, getAuthHeader());
    } catch (err) {
      console.error('Error updating task completion:', err);
      setError('Failed to update task completion');
      fetchTasks();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ subject: '', topic: '', priority: 'medium', deadline: '', timeRequired: 60, day: 'Monday', timeSlot: '09:00' });
    setEditingId(null);
  };

  const getPriorityColor = (priority) => priorityOptions.find(p => p.value === priority)?.color || 'bg-gray-500';

  // ✅ Progress counts
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.length - completedCount;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">StudyBoost</h1>
      <p className="text-lg mb-6 text-black">Break down big study goals into smaller, manageable tasks.</p>

      {/* ✅ Progress Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-red-600">{pendingCount}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center col-span-2 sm:col-span-1">
          <p className="text-2xl font-bold text-blue-600">{progress}%</p>
          <p className="text-sm text-gray-500">Progress</p>
        </div>
      </div>

      {/* Form */}
      <div className="card bg-base-100 shadow-md mb-6">
        <div className="card-body">
          <h2 className="card-title">{editingId ? 'Edit Task' : 'Add New Task'}</h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <input className="input input-bordered" type="text" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="Subject" required />
            <input className="input input-bordered" type="text" name="topic" value={formData.topic} onChange={handleInputChange} placeholder="Topic/Chapter" required />
            <select className="select select-bordered" name="priority" value={formData.priority} onChange={handleInputChange}>
              {priorityOptions.map(p => <option key={p.value} value={p.value}>{p.name}</option>)}
            </select>
            <input className="input input-bordered" type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} />
            <input className="input input-bordered" type="number" name="timeRequired" min="15" max="240" step="15" value={formData.timeRequired} onChange={handleInputChange} placeholder="Time Required (mins)" />
            <select className="select select-bordered" name="day" value={formData.day} onChange={handleInputChange}>
              {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="select select-bordered" name="timeSlot" value={formData.timeSlot} onChange={handleInputChange}>
              {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <div className="md:col-span-2 flex gap-2 mt-2">
              <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Add'} Task</button>
              {editingId && <button type="button" onClick={resetForm} className="btn btn-ghost">Cancel</button>}
            </div>
          </form>
        </div>
      </div>

      {/* Tasks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map(task => (
          <div
            key={task._id}
            className={`card shadow-md border-l-4 ${getPriorityColor(task.priority)}`}
          >
            <div className="card-body flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex-1">
                {/* Responsive badges */}
                <div className="flex flex-wrap bg-none  items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-1 rounded-md   text-xs sm:text-sm font-medium border ${getPriorityColor(
                      task.priority
                    )} text-black`}
                  >
                    {task.priority.toUpperCase()}
                  </span>
                  {task.deadline && (
                    <span className="px-2 py-1 rounded-md text-xs sm:text-sm font-medium border border-gray-400 text-gray-700 bg-gray-100">
                      Deadline: {new Date(task.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <h3 className="card-title">{task.subject}</h3>
                <p className="text-black">{task.topic}</p>

                {/* Time details */}
                <div className="flex flex-wrap gap-4 mt-1 text-sm text-black-500">
                  <span>
                    ⏰ {task.timeSlot} • {task.day}
                  </span>
                  <span>⏱️ {task.timeRequired} mins</span>
                </div>
              </div>

              {/* Status + buttons */}
              <div className="flex flex-col items-end gap-2 mt-3 sm:mt-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm">Status:</p>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleComplete(task._id, task.completed)}
                    className="checkbox checkbox-success"
                  />
                </div>
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => handleEdit(task)}
                    className="btn btn-sm btn-ghost"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="btn btn-sm btn-ghost text-error"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>


      {tasks.length === 0 && !loading && <p className="text-center py-8 text-black-500">No study tasks added yet.</p>}
    </div>
  );
};

export default StudyBoost;
