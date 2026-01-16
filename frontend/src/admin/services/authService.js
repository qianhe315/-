import axios from 'axios';

const API_URL = '/api/auth';

const authService = {
  login: async (credentials) => {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  },

  register: async (adminData) => {
    const response = await axios.post(`${API_URL}/register`, adminData);
    return response.data;
  },

  getCurrentAdmin: () => {
    const adminInfo = localStorage.getItem('adminInfo');
    return adminInfo ? JSON.parse(adminInfo) : null;
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
  },

  getToken: () => {
    return localStorage.getItem('adminToken');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('adminToken');
  }
};

export default authService;
