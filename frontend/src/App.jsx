import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ClassFlow from './pages/ClassFlow';
import StudyBoost from './pages/StudyBoost';
import QuizForge from './pages/QuizForge';
import CashTrack from './pages/CashTrack';
import Profile from './pages/Profile';
import Home from './pages/Home';
import { auth } from './firebase';
import Register from './Authentication/Register';
import Login from './Authentication/Login';
import { useAuthState } from 'react-firebase-hooks/auth';
import { TimerProvider } from './components/TimerContext';
import MockExam from './components/MockExam';

// Wrapper so we can use useLocation properly
function AppWrapper() {
  return (
    <TimerProvider>
      <Router>
        <App />
      </Router>
    </TimerProvider>
  );
}

function App() {
  const [user, loading] = useAuthState(auth);
  const location = useLocation();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // Define pages where Navbar should be hidden
  const hideNavbarOn = ["/"]; // Dashboard is "/"
  const shouldShowNavbar = !hideNavbarOn.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <div className="p-4">
        <Routes>
          <Route path="/" element={user ? <Dashboard /> : <Home />} />
          <Route path="/classflow" element={user ? <ClassFlow /> : <Navigate to="/" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/studyboost" element={user ? <StudyBoost /> : <Navigate to="/" replace />} />
          <Route path="/quizforge" element={user ? <QuizForge /> : <Navigate to="/" replace />} />
          <Route path="/cashtrack" element={user ? <CashTrack /> : <Navigate to="/" replace />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" replace />} />
          <Route path="/exam" element={user ? <MockExam /> : <Navigate to="/" replace />} />

        </Routes>
      </div>
    </>
  );
}

export default AppWrapper;
