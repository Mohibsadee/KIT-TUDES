export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://kit-tudes.onrender.com'  
    : 'http://localhost:5000');