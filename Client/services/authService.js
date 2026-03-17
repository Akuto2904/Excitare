//handles login
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000', // your Flask backend
  withCredentials: true // important for login sessions
});

export default api;