import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const CashTrack = () => {


  const [transactions, setTransactions] = useState([]);
  const [showAlert, setShowAlert] = useState(false);



  const formatMoney = (value) => {
    if (Number.isInteger(value)) {
      return value.toLocaleString("en-BD");
    }
    return value.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };



  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });



  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');





  const expenseCategories = [
    'Food', 'Transport', 'Books', 'Entertainment', 'Rent',
    'Utilities', 'Clothing', 'Healthcare', 'Other'
  ];
  const incomeCategories = [
    'Allowance', 'Part-time Job', 'Scholarship', 'Gift', 'Other Income'
  ];





  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${auth.currentUser?.stsTokenManager?.accessToken}` }
  });

  // Fetch transactions from backend
  const fetchTransactions = async () => {
    if (!auth.currentUser) return;
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_BASE_URL}/api/transactions`, {
        params: { userId: auth.currentUser.uid },
        ...getAuthHeader()
      });
      setTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) fetchTransactions();
    });
    return unsubscribe;
  }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newTransaction.category || !newTransaction.amount || !newTransaction.description) {
      setError('Please fill all fields');
      return;
    }

    if (parseFloat(newTransaction.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      const payload = {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      };
      const res = await axios.post(`${API_BASE_URL}/api/transactions`, payload, getAuthHeader());
      setTransactions(prev => [...prev, res.data]);
      setNewTransaction({
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setError('');
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError('Failed to add transaction');
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/transactions/${id}`, getAuthHeader());
      setTransactions(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction');
    }
  };






  // Financial summaries
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;



  // Show popup if expenses exceed income

  useEffect(() => {
    if (!loading && totalExpenses > totalIncome) {
      setShowAlert(true);
    }
  }, [loading, totalExpenses, totalIncome]);





  // Group by category
  const expensesByCategory = transactions.filter(t => t.type === 'expense')
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});
  const incomeByCategory = transactions.filter(t => t.type === 'income')
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});

  if (loading) return <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="bg-white">
      <div className="max-w-6xl bg-gray-200 rounded-md mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">CashTrack</h1>
        {error && <div className="alert alert-error mb-6">{error}</div>}

        {/* Custom Alert Modal */}
        {showAlert && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm text-center">
              <h3 className="text-xl font-bold text-red-600 mb-4">Warning!</h3>
              <p className="text-gray-700 mb-4">
                Your expenses have exceeded your income. Consider reviewing your spending.
              </p>
              <button
                onClick={() => setShowAlert(false)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-green-50 text-center p-4">
            <h3 className="text-green-700 font-bold">Total Income</h3>
            <p className="text-2xl font-bold text-green-700">৳{formatMoney(totalIncome)}</p>
          </div>
          <div className="card bg-red-50 text-center p-4">
            <h3 className="text-red-700 font-bold">Total Expenses</h3>
            <p className="text-2xl font-bold text-red-700">৳{formatMoney(totalExpenses)}</p>
          </div>
          <div className={`card text-center p-4 ${balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
            <h3 className="font-bold">Balance</h3>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>৳{formatMoney(balance)}</p>
          </div>
        </div>

        {/* Add Transaction Form */}
        <div className="card bg-white shadow-lg rounded-2xl p-8 mb-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Add New Transaction</h2>

          <form onSubmit={handleAddTransaction} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Type */}
              <div className="form-control">
                <label className="label text-gray-700 font-medium">Type</label>
                <select
                  value={newTransaction.type}
                  onChange={e => setNewTransaction(prev => ({ ...prev, type: e.target.value, category: '' }))}
                  className="select select-bordered w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 hover:border-gray-400 transition"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              {/* Category */}
              <div className="form-control">
                <label className="label text-gray-700 font-medium">Category</label>
                <select
                  value={newTransaction.category}
                  onChange={e => setNewTransaction(prev => ({ ...prev, category: e.target.value }))}
                  className="select select-bordered w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 hover:border-gray-400 transition"
                  required
                >
                  <option value="">Select Category</option>
                  {(newTransaction.type === 'income' ? incomeCategories : expenseCategories).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="form-control">
                <label className="label text-gray-700 font-medium">Amount (৳)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newTransaction.amount}
                  onChange={e => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                  className="input input-bordered w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 hover:border-gray-400 transition"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Date */}
              <div className="form-control">
                <label className="label text-gray-700 font-medium">Date</label>
                <input
                  type="date"
                  value={newTransaction.date}
                  onChange={e => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                  className="input input-bordered w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 hover:border-gray-400 transition"
                  required
                />
              </div>

              {/* Description */}
              <div className="form-control md:col-span-2">
                <label className="label text-gray-700 font-medium">Description</label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={e => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                  className="input input-bordered w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 hover:border-gray-400 transition"
                  placeholder="Brief description..."
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full md:w-auto px-8 py-3 font-semibold text-lg rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200"
            >
              Add Transaction
            </button>
          </form>
        </div>


        {/* Transactions Table */}
        <div className="card bg-base-100 shadow-md p-4">
          <h2 className="text-xl font-bold mb-4">Transaction History</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).map(t => (
                  <tr key={t._id}>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                    <td><span className={`badge ${t.type === 'income' ? 'badge-success' : 'badge-error'}`}>{t.type}</span></td>
                    <td>{t.category}</td>
                    <td className="max-w-xs truncate">{t.description}</td>
                    <td className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}${formatMoney(t.amount)}
                    </td>
                    <td>
                      <button onClick={() => handleDeleteTransaction(t._id)} className="btn btn-sm btn-error">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && <p className="text-center text-gray-500 py-6">No transactions yet.</p>}
          </div>
        </div>
      </div>
    </div>

  );
};

export default CashTrack;
