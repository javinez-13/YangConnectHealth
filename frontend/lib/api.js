import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Auth token added to request:', { 
        url: config.baseURL + config.url,
        hasToken: !!token,
        tokenPrefix: token.substring(0, 20) + '...'
      });
    } else {
      console.log('⚠️  No auth token found in localStorage');
    }
  }
  return config;
});

// Handle token expiration and network errors
function safeStringify(obj) {
  const seen = new WeakSet();
  try {
    return JSON.stringify(obj, function (key, value) {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) return '[Circular]';
        seen.add(value);
      }
      if (typeof value === 'function') return value.name || '[Function]';
      return value;
    }, 2);
  } catch (e) {
    return String(obj);
  }
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      if (error?.response?.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    } catch (e) {
      // swallow and continue to logging
      console.error('Error during 401 handling in interceptor', e);
    }

    // Robust fallback logging: stringify whole error object and request config
    if (typeof window !== 'undefined') {
      try {
        const details = {
          message: error?.message,
          code: error?.code,
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          data: error?.response?.data,
          url: error?.config?.url,
          method: error?.config?.method,
          params: error?.config?.params,
          baseURL: error?.config?.baseURL,
          timeout: error?.config?.timeout,
          headers: error?.config?.headers,
          isNetworkError: !error?.response,
          isTimeoutError: error?.code === 'ECONNABORTED',
          stack: error?.stack,
        };

        console.error('API Error Details (object):', details);

        // Full raw stringify (handles circular refs)
        console.error('API Error (stringified):', safeStringify(error));

        if (error?.config) {
          console.error('Request config (stringified):', safeStringify(error.config));
        }
      } catch (logErr) {
        console.error('Failed to log API error details', logErr);
      }
    } else {
      // Fallback Node logging
      try {
        console.error('API Error (node):', error);
      } catch (_) {}
    }

    return Promise.reject(error);
  }
);

export default api;

