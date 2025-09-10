import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import AuthModal from '../Authentication/AuthModal';
import '../css/navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const authenticatedNavItems = [
    { name: 'Dashboard', path: '/', key: 'dashboard' },
    { name: 'ClassFlow', path: '/classflow', key: 'classflow' },
    { name: 'StudyBoost', path: '/studyboost', key: 'studyboost' },
    { name: 'QuizForge', path: '/quizforge', key: 'quizforge' },
    { name: 'CashTrack', path: '/cashtrack', key: 'cashtrack' },
  ];

  const publicNavItems = [
    { name: 'Home', path: '/home', section: 'home', key: 'home-nav' },
    { name: 'Why us?', path: '/home', section: 'why-us', key: 'why-us-nav' },
    { name: 'Features', path: '/home', section: 'features', key: 'features-nav' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setMobileOpen(false); // Close mobile menu after logout
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handlePublicNavClick = (sectionId) => {
    if (window.location.pathname === '/home' || window.location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/home', { state: { scrollTo: sectionId } });
    }
    setMobileOpen(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const renderNavLinks = (isMobile = false) => {
    const navItems = user ? authenticatedNavItems : publicNavItems;
    const linkClass = isMobile
      ? 'block py-2 px-4 text-black hover:bg-gray-100 rounded'
      : 'px-3 py-2 text-navbar-dark hover:text-black transition-colors';

    return navItems.map((item) => (
      <li key={item.key}>
        {user ? (
          <NavLink
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `${linkClass} ${isActive ? 'font-bold' : ''}`}
          >
            {item.name}
          </NavLink>
        ) : (
          <a
            onClick={() => handlePublicNavClick(item.section)}
            className={`${linkClass} cursor-pointer`}
          >
            {item.name}
          </a>
        )}
      </li>
    ));
  };

  const renderUserSection = () => {
    if (user) {
      return (
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="font-medium text-black">{user.displayName || 'Student'}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          {/*<button
            onClick={handleLogout}
            className="px-3 py-2 bg-gray-100 rounded text-black hover:bg-gray-200"
          >
            Logout
          </button>*/}
        </div>
      );
    } else {
      return (
        <NavLink
          to="/login"
          className="hidden md:inline-block navbar-btn px-6 py-2 text-sm md:px-8 md:py-3 md:text-base font-medium shadow-md hover:shadow-lg transition-all duration-300 rounded-xl text-black"
        >
          Get Started
        </NavLink>
      );
    }
  };

  return (
    <>
      <nav className="navbar-header backdrop-blur-md px-6 py-4 bg-white shadow">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Left: Brand */}
          <div className="flex flex-col items-center">
            <NavLink to="/" className="text-2xl font-bold normal-case text-black">
              KitÉtudes
            </NavLink>
            <span className="text-xs text-gray-500 ml-2">Student Life Toolkit</span>
          </div>

          {/* Center: Desktop nav */}
          <div className="hidden md:flex">
            <ul className="menu menu-horizontal px-1 gap-2">{renderNavLinks()}</ul>
          </div>

          {/* Right: User / Mobile Toggle */}
          <div className="flex items-center gap-3">
            {renderUserSection()}
            <button
              className="md:hidden p-2 text-black"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden mt-3 bg-white border-t border-gray-200 shadow rounded-lg">
            <ul className="flex flex-col gap-1 p-3">{renderNavLinks(true)}</ul>
            {user ? (
              // Logout button for mobile when user is logged in
              <div className="px-3 py-2 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="block w-full text-center py-2 text-sm font-medium bg-gray-100 text-black rounded hover:bg-gray-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              // Get Started button for mobile when user is not logged in
              <div className="px-3 py-2">
                <NavLink
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center py-2 text-sm font-medium bg-black text-white rounded"
                >
                  Get Started
                </NavLink>
              </div>
            )}
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
};

export default Navbar;