const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  if (finalOptions.body && typeof finalOptions.body === 'object') {
    finalOptions.body = JSON.stringify(finalOptions.body);
  }

  try {
    const response = await fetch(url, finalOptions);
    

    if (response.status === 401) {
      localStorage.removeItem('user');
    }


    const data = await response.json().catch(() => ({}));


    if (!response.ok) {
      throw { status: response.status, data };
    }

    return data; 
  } catch (error) {
    throw error; 
  }
};