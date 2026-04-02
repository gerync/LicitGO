const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.licitgo.com';

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;


  const defaultOptions = {
    headers: {},
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

  if (finalOptions.body && typeof finalOptions.body === 'object' && !(finalOptions.body instanceof FormData)) {
    finalOptions.body = JSON.stringify(finalOptions.body);
    finalOptions.headers['Content-Type'] = finalOptions.headers['Content-Type'] || 'application/json';
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

export const api = {
  request: (endpoint, { method = 'GET', body = null, headers = {}, ...opts } = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const finalHeaders = { ...headers };
    if (body && !(body instanceof FormData) && !finalHeaders['Content-Type']) {
      finalHeaders['Content-Type'] = 'application/json';
    }

    const init = {
      method,
      headers: finalHeaders,
      credentials: 'include',
      ...opts,
    };

    if (body) {
      init.body = (body instanceof FormData) ? body : JSON.stringify(body);
    }

    return fetch(url, init);
  },
  get: (endpoint, opts) => api.request(endpoint, { method: 'GET', ...opts }),
  post: (endpoint, body, opts) => api.request(endpoint, { method: 'POST', body, ...opts }),
  put: (endpoint, body, opts) => api.request(endpoint, { method: 'PUT', body, ...opts }),
  delete: (endpoint, body, opts) => api.request(endpoint, { method: 'DELETE', body, ...opts }),
};