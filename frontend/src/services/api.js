import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any request interceptors here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// API endpoints
const endpoints = {
  // Categories
  categories: {
    getAll: () => api.get('/categories'),
    getAllIncludingInactive: () => api.get('/categories/all'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
  },
  
  // Products
  products: {
    getAll: () => api.get('/products'),
    getByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
    addImage: (productId, data) => api.post(`/products/${productId}/images`, data),
    deleteImage: (imageId) => api.delete(`/products/images/${imageId}`),
  },
  
  // Company Info
  companyInfo: {
    getAll: () => api.get('/company-info'),
    getByType: (type) => api.get(`/company-info/type/${type}`),
    getById: (id) => api.get(`/company-info/${id}`),
    create: (data) => api.post('/company-info', data),
    update: (id, data) => api.put(`/company-info/${id}`, data),
    delete: (id) => api.delete(`/company-info/${id}`),
  },
  
  // Production Processes
  productionProcesses: {
    getAll: () => api.get('/production-processes'),
    getById: (id) => api.get(`/production-processes/${id}`),
    create: (data) => api.post('/production-processes', data),
    update: (id, data) => api.put(`/production-processes/${id}`, data),
    delete: (id) => api.delete(`/production-processes/${id}`),
  },
  
  // Quality Certifications
  qualityCertifications: {
    getAll: () => api.get('/quality-certifications'),
    getById: (id) => api.get(`/quality-certifications/${id}`),
    create: (data) => api.post('/quality-certifications', data),
    update: (id, data) => api.put(`/quality-certifications/${id}`, data),
    delete: (id) => api.delete(`/quality-certifications/${id}`),
  },
  
  // Clients
  clients: {
    getAll: () => api.get('/clients'),
    getById: (id) => api.get(`/clients/${id}`),
    create: (data) => api.post('/clients', data),
    update: (id, data) => api.put(`/clients/${id}`, data),
    delete: (id) => api.delete(`/clients/${id}`),
  },
  
  // Contacts
  contacts: {
    getAll: async () => {
      const data = await api.get('/contacts');
      // Ensure we return an array
      return Array.isArray(data) ? data : [data];
    },
    getById: (id) => api.get(`/contacts/${id}`),
    create: (data) => api.post('/contacts', data),
    update: (id, data) => api.put(`/contacts/${id}`, data),
    delete: (id) => api.delete(`/contacts/${id}`),
  },
  

  // Static Pages
  staticPages: {
    getAll: () => api.get('/static-pages'),
    getBySlug: (slug) => api.get(`/static-pages/slug/${slug}`),
    getById: (id) => api.get(`/static-pages/${id}`),
    create: (data) => api.post('/static-pages', data),
    update: (id, data) => api.put(`/static-pages/${id}`, data),
    delete: (id) => api.delete(`/static-pages/${id}`),
  },
  
  // Media
  media: {
    getAll: () => api.get('/media'),
    getById: (id) => api.get(`/media/${id}`),
    upload: (formData) => {
      return api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    create: (data) => api.post('/media', data),
    update: (id, data) => api.put(`/media/${id}`, data),
    delete: (id) => api.delete(`/media/${id}`),
  },
  
  // Carousels
  carousels: {
    getAll: () => api.get('/carousels'),
    getActive: () => api.get('/carousels?active=true'),
    getById: (id) => api.get(`/carousels/${id}`),
    create: (data) => api.post('/carousels', data),
    update: (id, data) => api.put(`/carousels/${id}`, data),
    delete: (id) => api.delete(`/carousels/${id}`),
  },
};

export default endpoints;
