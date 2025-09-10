import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import FinancialHealth from '../components/FinancialHealth';
import StudyGoals from '../components/StudyGoals';
import UpComingClass from '../components/UpcomingClass';
import MockExam from '../components/MockExam';
import TimeTracker from '../components/TimeTracker';
import Particles from '@tsparticles/react';
import { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import '../css/glass.css';
import Quote from '../components/Quote';
import ZenMode from '../components/ZenMode';
import Chatbot from '../components/Chatbot';

// Import React Icons
import {
  FiPieChart,
  FiBookOpen,
  FiDollarSign,
  FiTarget,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiX,
  FiAward,
  FiArrowRight,
  FiCalendar,
  FiBarChart2,
  FiArrowUpRight
} from 'react-icons/fi';
import { GoZap } from "react-icons/go";
import { IoIosTimer } from "react-icons/io";
import { LuNotebookPen } from "react-icons/lu";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [init, setInit] = useState(false);
  const navigate = useNavigate();

  // Initialize particles engine
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUser(user);
      else navigate('/login');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const particlesLoaded = useCallback((container) => {
    console.log('Particles loaded:', container);
  }, []);

  const particlesOptions = {
    background: { color: { value: "transparent" } },
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" },
        onClick: { enable: true, mode: "push" },
        resize: true,
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
        push: { quantity: 4 },
      },
    },
    particles: {
      color: { value: "#3b82f6" },
      links: {
        color: "#9ca3af",
        distance: 150,
        enable: true,
        opacity: 0.5,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: { default: "bounce" },
        random: false,
        speed: 2,
        straight: false,
      },
      number: { value: 50, density: { enable: true, area: 800 } },
      opacity: { value: 0.5 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const handleNavigation = (section) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };
  const navigateToQuizForge = () => navigate('/quizforge');

  const [showZenMode, setShowZenMode] = useState(false);

  if (showZenMode) {
    return <ZenMode onClose={() => setShowZenMode(false)} />;
  }

  const renderSection = () => {
    if (!user) return <div>Loading...</div>;

    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Quiz Inspiration Section */}
            <div className="glass-card p-6 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border border-white/10 relative overflow-hidden">
              {init && (
                <Particles
                  id="quiz-particles"
                  particlesLoaded={particlesLoaded}
                  options={particlesOptions}
                  className="absolute inset-0 z-0"
                />
              )}

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">Test Your Knowledge!</h2>
                    <p className="text-blue-100 mb-4">
                      Take our interactive quiz to assess your understanding and discover personalized study recommendations.
                    </p>
                    <button
                      onClick={navigateToQuizForge}
                      className="flex items-center gap-2 px-5 py-3 bg-white text-indigo-700 rounded-full font-medium hover:bg-indigo-50 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25"
                    >
                      <span>Start Quiz Now</span>
                      <FiArrowRight className="animate-pulse" />
                    </button>
                  </div>

                  <div className="hidden md:flex items-center justify-center">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
                        <FiAward className="text-white text-4xl" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center">
                        <span className="text-indigo-900 font-bold">!</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 w-full space-y-6">
                <div className="glass-card p-6 rounded-2xl border border-white/10">
                  <UpComingClass userId={user.uid} compact />
                </div>
                <div className="glass-card p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-500 rounded-full">
                        <GoZap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Zen Mode</h3>
                        <p className="text-sm text-gray-600">Focus without distractions</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowZenMode(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors group"
                    >
                      <span>Enter</span>
                      <FiArrowUpRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-white/10">
                  <StudyGoals userId={user.uid} compact />
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-card p-6 rounded-2xl border border-white/10">
                  <Quote />
                </div>
                <div className="glass-card p-6 rounded-2xl border border-white/10">
                  <FinancialHealth userId={user.uid} compact />
                </div>
                <div className="glass-card p-6 rounded-2xl border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Time Tracker</h3>
                  <TimeTracker userId={user.uid} compact />
                </div>
              </div>
            </div>
          </div>
        );
      case 'classes':
        return (
          <div className="glass-card p-6 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <FiCalendar className="text-indigo-400 text-2xl" />
              <h2 className="text-2xl font-bold text-white">My Classes</h2>
            </div>
            <UpComingClass userId={user.uid} />
          </div>
        );
      case 'finance':
        return (
          <div className="glass-card p-6 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <FiDollarSign className="text-indigo-400 text-2xl" />
              <h2 className="text-2xl font-bold text-white">Financial Health</h2>
            </div>
            <FinancialHealth userId={user.uid} detailed />
          </div>
        );
      case 'study':
        return (
          <div className="glass-card p-6 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <FiTarget className="text-indigo-400 text-2xl" />
              <h2 className="text-2xl font-bold text-white">Study Goals</h2>
            </div>
            <StudyGoals userId={user.uid} detailed />
          </div>
        );
      case 'tracker':
        return (
          <div className="glass-card p-6 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <FiBarChart2 className="text-indigo-400 text-2xl" />
              <h2 className="text-2xl font-bold text-white">Time Tracker</h2>
            </div>
            <TimeTracker userId={user.uid} detailed />
          </div>
        );
      case 'exam':
        return (
          <div className="glass-card p-6 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <FiBarChart2 className="text-indigo-400 text-2xl" />
              <h2 className="text-2xl font-bold text-white">Mock Exam</h2>
            </div>
            <MockExam userId={user.uid} detailed />
          </div>
        );
      default:
        return <div>Select a section</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-indigo-200">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-slate-900 via-blue-950 to-gray-700 relative">
      {init && (
        <Particles
          id="background-particles"
          particlesLoaded={particlesLoaded}
          options={particlesOptions}
          className="absolute inset-0 z-0"
        />
      )}

      <div className="relative z-10 flex flex-col md:flex-row w-full">
        {/* Mobile header */}
        <header className="md:hidden glass-header flex items-center justify-between p-4 backdrop-blur-md border-b border-white/10">
          <h1 className="text-xl font-bold text-white">KitÉtudes</h1>
          <button
            onClick={toggleMobileMenu}
            className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </header>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black bg-opacity-70"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
            <div className="absolute right-0 top-0 h-full w-3/4 max-w-xs glass-sidebar p-4 backdrop-blur-md border-l border-white/10">
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
              <nav className="flex flex-col space-y-2">
                {[
                  { key: 'overview', icon: <FiPieChart size={20} />, label: 'Overview' },
                  { key: 'classes', icon: <FiBookOpen size={20} />, label: 'My Classes' },
                  { key: 'finance', icon: <FiDollarSign size={20} />, label: 'Finance' },
                  { key: 'study', icon: <FiTarget size={20} />, label: 'Study Goals' },
                  { key: 'tracker', icon: <IoIosTimer size={20} />, label: 'Tracker' },
                  { key: 'exam', icon: <LuNotebookPen size={20} />, label: 'Exam' },
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => handleNavigation(item.key)}
                    className={`w-full px-4 py-3 flex items-center justify-start gap-3 rounded-lg transition-all ${activeSection === item.key
                      ? 'bg-indigo-600 text-white'
                      : 'text-white/70 hover:bg-white/5'
                      }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-4 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full text-white/70 hover:text-white border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center gap-2 py-3 rounded-lg"
                >
                  <FiLogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <aside
          className={`hidden md:flex glass-sidebar flex-col backdrop-blur-md transition-all duration-300 border-r border-white/10 ${sidebarCollapsed ? 'w-20' : 'w-64'
            }`}
        >
          <div className="h-20 flex items-center justify-between border-b border-white/10 px-4">
            {!sidebarCollapsed && <h1 className="text-xl font-bold text-white">KitÉtudes</h1>}
            <button
              onClick={toggleSidebar}
              className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {sidebarCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
            </button>
          </div>
          <nav className="flex-1 flex flex-col mt-4 space-y-1 p-2">
            {[
              { key: 'overview', icon: <FiPieChart size={20} />, label: 'Overview' },
              { key: 'classes', icon: <FiBookOpen size={20} />, label: 'My Classes' },
              { key: 'finance', icon: <FiDollarSign size={20} />, label: 'Finance' },
              { key: 'study', icon: <FiTarget size={20} />, label: 'Study Goals' },
              { key: 'tracker', icon: <IoIosTimer size={20} />, label: 'Tracker' },
              { key: 'exam', icon: <LuNotebookPen size={20} />, label: 'Exam' },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`w-full px-4 py-3 flex items-center justify-start gap-3 rounded-lg transition-all ${activeSection === item.key
                  ? 'bg-indigo-600 text-white'
                  : 'text-white/70 hover:bg-white/5'
                  }`}
              >
                <span>{item.icon}</span>
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full text-white/70 hover:text-white border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center gap-2 py-3 rounded-lg"
            >
              <FiLogOut size={18} />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main content with Top Bar */}
        <div className="flex-1 flex flex-col overflow-auto pb-16 md:pb-0 md:pt-0 pt-16">
          {/* Top bar */}
          <div className="w-full bg-white/10 backdrop-blur-md border-b border-white/10 px-6 py-7 flex justify-between items-center">
            <h2 className="text-white font-semibold text-lg">
              Hello {user?.displayName || "User"}
            </h2>
          </div>

          {/* Dashboard content */}
          <main className="p-4 md:p-6 w-full max-w-full mx-auto">{renderSection()}</main>
        </div>

        {/* Mobile bottom navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
          <div className="glass-header flex flex-row justify-around p-2 backdrop-blur-md border-t border-white/10">
            {[
              { key: 'overview', icon: <FiPieChart size={20} />, label: 'Overview' },
              { key: 'classes', icon: <FiBookOpen size={20} />, label: 'Classes' },
              { key: 'finance', icon: <FiDollarSign size={20} />, label: 'Finance' },
              { key: 'study', icon: <FiTarget size={20} />, label: 'Study' },
              { key: 'tracker', icon: <IoIosTimer size={20} />, label: 'Tracker' },
              { key: 'exam', icon: <LuNotebookPen size={20} />, label: 'Exam' },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeSection === item.key
                  ? 'text-indigo-400'
                  : 'text-white/70 hover:text-white'
                  }`}
              >
                {item.icon}
                <span className="text-[10px] mt-1">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chatbot Component */}
        <Chatbot />
      </div>
    </div>
  );
};

export default Dashboard;