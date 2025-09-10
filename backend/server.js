const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const path = require('path');
const userRoutes = require('./routes/users');

dotenv.config();

const app = express();

// -------------------------
// CORS configuration
// -------------------------
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'https://kit-tudes.vercel.app',
    'https://kit-tudes-3olneudwe-mohibs-projects-b96dcde4.vercel.app' // your actual Vercel URL
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));


// -------------------------
// Firebase Admin setup
// -------------------------
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    console.log('⚠️ Server will start without Firebase authentication');
  }
}

// -------------------------
// Health check
// -------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// -------------------------
// MongoDB Atlas connection
// -------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected to Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected');
});
mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose error:', err);
});
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected');
});

// -------------------------
// Firebase Auth middleware
// -------------------------
const verifyFirebaseToken = async (req, res, next) => {
  if (admin.apps.length === 0) {
    req.user = { uid: 'test-user-id' }; // fallback for dev
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
    console.error('❌ Firebase token error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// -------------------------
// Routes
// -------------------------
app.use('/api/users', userRoutes);
app.use('/api/classes', verifyFirebaseToken, require('./routes/classes'));
app.use('/api/study-tasks', verifyFirebaseToken, require('./routes/study-tasks'));
app.use('/api/transactions', verifyFirebaseToken, require('./routes/transactions'));
app.use('/api/completed-tasks', verifyFirebaseToken, require('./routes/completedTask'));
app.use('/api/study-sessions', verifyFirebaseToken, require('./routes/study-sessions'));
app.use('/api/quiz-questions', verifyFirebaseToken, require('./routes/quiz-questions'));

// -------------------------
// Start server
// -------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
