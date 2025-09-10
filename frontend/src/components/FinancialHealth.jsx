import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const FinancialHealth = ({ userId, compact = false, detailed = false }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);


  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId]);

  const fetchTransactions = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.get(`${API_BASE_URL}/api/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: { userId: userId }
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate financial data
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  useEffect(() => {
    if (!loading && totalExpenses > totalIncome) {
      setShowAlert(true);
    }
  }, [loading, totalExpenses, totalIncome]);


  //Money Format
  const formatMoney = (value) => {
    if (Number.isInteger(value)) {
      return value.toLocaleString("en-BD");
    }
    return value.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };



  // Prepare data for expense pie chart
  const expenseCategories = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {});

  const expenseChartData = {
    labels: Object.keys(expenseCategories),
    datasets: [
      {
        data: Object.values(expenseCategories),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FFCD56'
        ],
        hoverBackgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FFCD56'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const expenseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#1f2937' // gray-800
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-gray-800"></span>
      </div>
    );
  }

  // Compact view for dashboard
  if (compact) {
    return (
      <div className="rounded-2xl p-6 bg-white/80 backdrop-blur-lg border border-gray-100 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium tracking-wide text-gray-600 uppercase">
            Financial Health
          </h3>
          <span
            className={`text-2xl font-semibold ${balance >= 0 ? "text-emerald-500" : "text-rose-500"
              }`}
          >
            ৳{formatMoney(balance)}
          </span>
        </div>

        {/* Sub Info */}
        <p className="text-xs text-gray-500 mt-1">Current Balance</p>

        {/* Income & Expense */}
        <div className="flex items-center justify-between mt-5 text-sm font-medium">
          <span className="text-emerald-600">+৳{formatMoney(totalIncome)}</span>
          <span className="text-rose-600">-৳{formatMoney(totalExpenses)}</span>
        </div>

        {/* Expense Breakdown */}
        <div className="mt-8">
          {Object.keys(expenseCategories).length > 0 ? (
            <div className="rounded-xl p-5 bg-gradient-to-b from-white/90 to-gray-50/60 border border-gray-100">
              <h4 className="text-sm font-semibold text-[#27374D] mb-4">
                Expense Breakdown
              </h4>
              <div className="h-56">
                <Doughnut data={expenseChartData} options={expenseChartOptions} />
              </div>
            </div>
          ) : (
            <div className="rounded-xl p-6 bg-gradient-to-b from-white/90 to-gray-50/60 border border-gray-100 h-44 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-3xl mb-2">📊</div>
                <p className="text-sm font-light">No expense data available</p>
              </div>
            </div>
          )}
        </div>

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
      </div>
    );
  }


  return (
    <div className="max-w-6xl rounded-md mx-auto p-4 sm:p-6 bg-gray-200">

      <div className="bg-white/80 backdrop-blur-md rounded-lg p-6 border border-gray-200 mb-6">
        <div className="text-center mb-4">
          <div className={`text-3xl font-bold ৳{balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ৳{formatMoney(balance)}
          </div>
          <p className="text-sm text-gray-600">Current Balance</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-green-600 font-semibold text-lg">৳{formatMoney(totalIncome)}</div>
            <p className="text-xs text-gray-600">Total Income</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-red-600 font-semibold text-lg">৳{formatMoney(totalExpenses)}</div>
            <p className="text-xs text-gray-600">Total Expenses</p>
          </div>
        </div>
      </div>

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

      {Object.keys(expenseCategories).length > 0 ? (
        <div className="bg-white/80 backdrop-blur-md rounded-lg p-6 border border-gray-200 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Expense Breakdown</h3>
          <div className="h-64">
            <Doughnut data={expenseChartData} options={expenseChartOptions} />
          </div>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-md rounded-lg p-6 border border-gray-200 mb-6 h-48 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>No expense data yet</p>
          </div>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={() => window.location.href = '/cashtrack'}
          className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-colors"
        >
          {transactions.length === 0 ? 'Start Tracking' : 'View Details'}
        </button>
      </div>


    </div>
  );
};

export default FinancialHealth;