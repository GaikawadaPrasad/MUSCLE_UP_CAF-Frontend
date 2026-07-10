import axios from 'axios';

// Detect if we are running in localhost dev server. If so, direct to backend port 5050.
// Otherwise, use relative /api path (for single-origin production serving)
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5050/api'
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
