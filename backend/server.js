const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const userRoutes = require('./routes/users');

dotenv.config();

const app = express();

// ✅ CORS setup
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'https://kit-tudes.vercel.app',
  'https://kit-tudes-3olneudwe-mohibs-projects-b96dcde4.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow requests like Postman
    if (
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin) // ✅ allow all vercel.app subdomains
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ✅ handle preflight requests

app.use(express.json());

