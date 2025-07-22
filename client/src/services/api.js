import axios from 'axios';

// Use env variable for production/local toggle
const BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get token from localStorage
const getToken = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper to remove token from localStorage
const removeToken = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('token');
  }
};

// Interceptor — Attach token on every request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor — Handle Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==== Auth API ====
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  refreshToken: () => api.post('/auth/refresh'),
};

// ==== User API ====
export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  uploadProfileImage: (formData) =>
    api.post('/users/profile/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getUsers: (params) => api.get('/users', { params }),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// ==== Appointment API ====
export const appointmentApi = {
  getAppointments: (params) => api.get('/appointments', { params }),
  getMyAppointments: (params) => api.get('/appointments/my-appointments', { params }),
  getAppointment: (id) => api.get(`/appointments/${id}`),
  createAppointment: (appointmentData) => api.post('/appointments', appointmentData),
  updateAppointment: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
  getAvailability: (providerId, params) =>
    api.get(`/appointments/availability/${providerId}`, { params }),
};

// ==== Service API ====
export const serviceApi = {
  getServices: (params) => api.get('/services', { params }),
  getService: (id) => api.get(`/services/${id}`),
  createService: (serviceData) => api.post('/services', serviceData),
  updateService: (id, serviceData) => api.put(`/services/${id}`, serviceData),
  deleteService: (id) => api.delete(`/services/${id}`),
};

// ==== Business API ====
export const businessApi = {
  getBusinessProfile: () => api.get('/business/profile'),
  createBusinessProfile: (profileData) => api.post('/business/profile', profileData),
  updateBusinessProfile: (profileData) => api.put('/business/profile', profileData),
  getBusinesses: (params) => api.get('/business', { params }),
  getBusiness: (id) => api.get(`/business/${id}`),
};

// ==== Notification API ====
export const notificationApi = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// ==== Calendar API ====
export const calendarApi = {
  getCalendarEvents: (params) => api.get('/calendar/events', { params }),
  createCalendarEvent: (eventData) => api.post('/calendar/events', eventData),
  updateCalendarEvent: (id, eventData) => api.put(`/calendar/events/${id}`, eventData),
  deleteCalendarEvent: (id) => api.delete(`/calendar/events/${id}`),
  getCalendarSettings: () => api.get('/calendar/settings'),
  updateCalendarSettings: (settingsData) => api.put('/calendar/settings', settingsData),
};

export default api;
