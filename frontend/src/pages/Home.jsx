import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Particles from '@tsparticles/react';
import { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import startImg from "../assets/start.png";
import Footer from '../components/Footer';
import { 
  FiPieChart, 
  FiBookOpen, 
  FiDollarSign, 
  FiTarget, 
  FiClock,
  FiAward,
  FiCalendar,
  FiBarChart2,
  FiCoffee,
  FiZap,
  FiMessageSquare,
  FiUser,
  FiCheckCircle
} from 'react-icons/fi';
import { GoZap } from "react-icons/go";
import { IoIosTimer } from "react-icons/io";
import { LuNotebookPen } from "react-icons/lu";

const Home = () => {
  const [init, setInit] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  // Initialize particles engine
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

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

  const features = [
    {
      icon: <FiBookOpen className="w-8 h-8" />,
      title: "Class Management",
      description: "Organize your classes, track assignments, and never miss deadlines with smart reminders",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <FiTarget className="w-8 h-8" />,
      title: "Study Goals",
      description: "Set and track academic goals with progress monitoring and achievement badges",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <FiDollarSign className="w-8 h-8" />,
      title: "Financial Health",
      description: "Manage your student budget, track expenses, and get financial insights",
      color: "from-amber-500 to-amber-600"
    },
    {
      icon: <IoIosTimer className="w-8 h-8" />,
      title: "Time Tracker",
      description: "Pomodoro timer with session tracking and productivity analytics",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <LuNotebookPen className="w-8 h-8" />,
      title: "Mock Exams",
      description: "Practice with customizable mock tests and performance analysis",
      color: "from-red-500 to-red-600"
    },
    {
      icon: <GoZap className="w-8 h-8" />,
      title: "Zen Mode",
      description: "Distraction-free focus environment with ambient sounds and motivation",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: <FiMessageSquare className="w-8 h-8" />,
      title: "AI Study Assistant",
      description: "Get instant study tips, motivation, and academic support",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: <FiBarChart2 className="w-8 h-8" />,
      title: "Analytics Dashboard",
      description: "Comprehensive insights into your study patterns and progress",
      color: "from-cyan-500 to-cyan-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-gray-900 relative">
      {/* Particles Background */}
      {init && (
        <div className="absolute inset-0 z-0">
          <Particles
            id="tsparticles-hero"
            particlesLoaded={particlesLoaded}
            options={particlesOptions}
          />
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="hero min-h-screen relative z-10 px-4 sm:px-6">
        <div className="hero-content text-center relative w-full max-w-6xl mx-auto">
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6">
              Your Complete
              <span className="text-blue-400 block mt-2 sm:mt-3">
                Student Success Platform
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-10 max-w-2xl mx-auto px-2 sm:px-0">
              KitÉtudes combines class management, study tracking, financial tools, and AI assistance 
              in one powerful platform designed for academic excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <NavLink 
                to="/register" 
                className="btn bg-blue-600 hover:bg-blue-700 text-white btn-lg px-6 sm:px-8 text-sm sm:text-base border-0"
              >
                Get Started Free
              </NavLink>
              <a 
                href="#features" 
                className="btn bg-white/10 hover:bg-white/20 text-white btn-lg px-6 sm:px-8 text-sm sm:text-base border border-white/20"
              >
                Explore Features
              </a>
            </div>
          </div>
        </div>

        {/* Scroll arrow */}
        <div className="absolute bottom-8 sm:bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 relative z-10 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything You Need to Succeed</h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
              Comprehensive tools designed specifically for modern students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="glass-card p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white mb-4 mx-auto`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white text-center mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-sm text-center">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-900/50 to-purple-900/50 relative z-10">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">See It in Action</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Experience the power of integrated student tools with our interactive demo
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <FiCheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Smart Class Tracking</h4>
                  <p className="text-gray-300 text-sm">Never miss an assignment or deadline</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
                  <FiClock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Productivity Analytics</h4>
                  <p className="text-gray-300 text-sm">Track your study patterns and optimize your time</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center">
                  <FiCoffee className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Focus Environment</h4>
                  <p className="text-gray-300 text-sm">Zen mode for distraction-free studying</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="glass-card p-8 rounded-3xl border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Dashboard Overview</span>
                    <span className="text-green-400 text-sm">Live</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-600/20 rounded-xl p-3">
                      <div className="text-white text-sm">Classes</div>
                      <div className="text-2xl font-bold text-white">5</div>
                    </div>
                    <div className="bg-green-600/20 rounded-xl p-3">
                      <div className="text-white text-sm">Study Hours</div>
                      <div className="text-2xl font-bold text-white">28h</div>
                    </div>
                  </div>
                  <div className="bg-purple-600/20 rounded-xl p-4">
                    <div className="text-white text-sm mb-2">Current Focus</div>
                    <div className="text-white font-semibold">Mathematics Revision</div>
                    <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                      <div className="bg-purple-400 h-2 rounded-full" style={{width: '65%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 relative z-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-8 sm:p-12 rounded-3xl border border-white/10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Student Experience?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already achieving academic excellence with KitÉtudes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NavLink 
                to="/register" 
                className="btn bg-blue-600 hover:bg-blue-700 text-white btn-lg px-8 py-3 text-base sm:text-lg border-0"
              >
                Start Free Trial
              </NavLink>
              <NavLink 
                to="/login" 
                className="btn bg-white/10 hover:bg-white/20 text-white btn-lg px-8 py-3 text-base sm:text-lg border border-white/20"
              >
                Sign In
              </NavLink>
            </div>
            <p className="text-gray-400 text-sm mt-6">
              No credit card required • Free forever plan available
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;