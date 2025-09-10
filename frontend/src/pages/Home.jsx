import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink , useLocation} from 'react-router-dom';
import Particles from '@tsparticles/react';
import { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import startImg from "../assets/start.png";
import Footer from '../components/Footer';

const Home = () => {
  const [init, setInit] = useState(false);


  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        // Give React some time to render the section
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
    background: {
      color: {
        value: "transparent",
      },
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse",
        },
        onClick: {
          enable: true,
          mode: "push",
        },
        resize: true,
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
        push: {
          quantity: 4,
        },
      },
    },
    particles: {
      color: {
        value: "#3b82f6",
      },
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
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 2,
        straight: false,
      },
      number: {
        value: 50,
        density: {
          enable: true,
          area: 800,
        },
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 3 },
      },
    },
    detectRetina: true,
  };











  return (
    <div className="min-h-screen bg-base-100 relative">
      {/* Hero Section with Particles */}
      <section
        id="home"
        className="hero min-h-screen relative z-10 bg-gradient-to-br from-blue-50/90 to-indigo-100/90 px-4 sm:px-6"
      >
        {/* Particles background */}
        {init && (
          <div className="absolute inset-0 z-0">
            <Particles
              id="tsparticles-hero"
              particlesLoaded={particlesLoaded}
              options={particlesOptions}
            />
          </div>
        )}

        {/* Hero content */}
        <div className="hero-content text-center relative w-full max-w-6xl mx-auto">
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-4 sm:mb-6">
              Your All-in-One
              <span className="text-blue-600 block mt-2 sm:mt-3">
                Student Success Toolkit
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto px-2 sm:px-0">
              KitÉtudes brings together all the tools you need to excel in your
              studies, manage your time, and track your finances - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <NavLink to="/register" className="btn btn-primary btn-lg px-6 sm:px-8 text-sm sm:text-base">
                Get Started Free
              </NavLink>

              <a href="#why-us" className="btn btn-primary btn-lg px-6 sm:px-8 text-sm sm:text-base">
                Learn More
              </a>


            </div>
          </div>
        </div>

        {/* Scroll arrow */}
        <div className="absolute bottom-8 sm:bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6"
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

      {/* Why Us Section */}
      <section id="why-us" className="py-16 sm:py-20 bg-base-100 relative z-10 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Why Choose KitÉtudes?</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-2 sm:px-0">
              We've designed the ultimate toolkit specifically for students who want to maximize their potential.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="card-body items-center text-center p-6">
                <div className="rounded-full bg-blue-100 p-3 sm:p-4 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="card-title text-xl sm:text-2xl mb-2">All-in-One Platform</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  No more switching between different apps. Everything you need for academic success in one integrated platform.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="card-body items-center text-center p-6">
                <div className="rounded-full bg-green-100 p-3 sm:p-4 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="card-title text-xl sm:text-2xl mb-2">Student-First Design</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Built specifically for students by former students who understand your challenges and needs.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="card-body items-center text-center p-6">
                <div className="rounded-full bg-purple-100 p-3 sm:p-4 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="card-title text-xl sm:text-2xl mb-2">Community Driven</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Join thousands of students who are already achieving more with less stress using our toolkit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 bg-gray-50 relative z-10 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Powerful Features</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-2 sm:px-0">
              Discover how our integrated tools work together to streamline your student life.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                title: "ClassFlow",
                description: "Organize your class schedule, track assignments, and never miss a deadline again with smart reminders.",
                color: "blue"
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
                title: "StudyBoost",
                description: "Create effective study plans, track your progress, and use proven techniques to maximize learning efficiency.",
                color: "green"
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 01118 0z" />
                  </svg>
                ),
                title: "QuizForge",
                description: "Generate custom quizzes from your study materials and test your knowledge with adaptive learning algorithms.",
                color: "purple"
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "CashTrack",
                description: "Manage your student budget, track expenses, and get insights into your spending patterns with visual reports.",
                color: "yellow"
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                title: "Profile & Analytics",
                description: "Track your academic performance over time and get personalized recommendations for improvement.",
                color: "red"
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: "Collaboration",
                description: "Study together with classmates, share notes, and collaborate on projects in real-time.",
                color: "indigo"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-5 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className={`bg-${feature.color}-100 p-3 rounded-lg mr-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold">{feature.title}</h3>
                </div>
                <p className="text-gray-600 text-sm sm:text-base">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <section className="relative py-16 sm:py-20 bg-gradient-to-br from-blue-50/50 to-indigo-100/50 mt-16 sm:mt-20 rounded-2xl">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Left: Vector Illustration */}
              <div className="flex justify-center md:justify-start order-2 md:order-1">
                <img
                  src={startImg}
                  alt="Student studying illustration"
                  className="w-full max-w-xs sm:max-w-sm md:max-w-md"
                />
              </div>

              {/* Right: Text + CTA */}
              <div className="text-center md:text-left order-1 md:order-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                  Ready to Begin?
                </h2>
                <p className="text-gray-600 text-base sm:text-lg mt-3 sm:mt-4 max-w-md mx-auto md:mx-0">
                  Join KitÉtudes today and take the first step toward smarter learning and better results.
                </p>
                <NavLink
                  to="/register"
                  className="btn btn-primary btn-lg mt-6 sm:mt-8 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base inline-block"
                >
                  Start Your Journey
                </NavLink>
              </div>
            </div>
          </section>
        </div>
      </section>
       <Footer/>     
   
    </div>
  );
};

export default Home;