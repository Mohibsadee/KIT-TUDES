import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { FaUserCircle } from 'react-icons/fa';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = () => {
      if (auth.currentUser) {
        try {
          const user = auth.currentUser;
          setUserData({
            displayName: user.displayName || 'User',
            email: user.email,
            photoURL: user.photoURL
          });
        } catch (err) {
          console.error('Error getting user data:', err);
          setError('Failed to load user data');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError('No user logged in');
      }
    };
    fetchUser();
  }, []);

  const getInitials = (name) => {
    if (!name) return 'JD';
    return name.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) return <div className="p-4 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!userData) return <div className="p-4 text-center text-gray-500">No user data available</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl p-8 flex flex-col items-center text-center border border-white/20">
        {userData.photoURL ? (
          <img
            src={userData.photoURL}
            alt="avatar"
            className="w-28 h-28 rounded-full mb-6 border-4 border-white/30 shadow-md"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center mb-6 text-white text-4xl font-extrabold shadow-lg">
            {getInitials(userData.displayName)}
          </div>
        )}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{userData.displayName}</h2>
        <p className="text-gray-200 text-sm md:text-base mb-6">{userData.email}</p>

        <div className="flex gap-4 mt-4">
          <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg">
            Edit Profile
          </button>
          <button className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
