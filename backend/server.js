const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const path = require('path');
const userRoutes = require('./routes/users');

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173','https://kit-tudes.vercel.app'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    console.log('Server will start without Firebase authentication');
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Test endpoint without auth
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Firebase Auth middleware
const verifyFirebaseToken = async (req, res, next) => {
  if (admin.apps.length === 0) {
    req.user = { uid: 'test-user-id' };
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Firebase token error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes
app.use('/api/users', userRoutes);
app.use('/api/classes', verifyFirebaseToken, require('./routes/classes'));
app.use('/api/study-tasks', verifyFirebaseToken, require('./routes/study-tasks'));
app.use('/api/transactions', verifyFirebaseToken, require('./routes/transactions'));
app.use('/api/completed-tasks', verifyFirebaseToken, require('./routes/completedTask'));
app.use('/api/study-sessions', verifyFirebaseToken, require('./routes/study-sessions'));
app.use('/api/quiz-questions', verifyFirebaseToken, require('./routes/quiz-questions'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));