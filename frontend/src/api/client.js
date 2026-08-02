const API_BASE_URL = 'http://localhost:8080/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData or non-JSON payloads
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Don't auto-logout if attempting login or registration
      if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    // Safely read response text once
    const responseText = await response.text();
    let parsedData = null;

    if (responseText && responseText.trim().length > 0) {
      try {
        parsedData = JSON.parse(responseText);
      } catch {
        parsedData = responseText;
      }
    }

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}`;
      if (parsedData) {
        if (typeof parsedData === 'object') {
          errorMessage = parsedData.message || parsedData.error || errorMessage;
        } else if (typeof parsedData === 'string') {
          errorMessage = parsedData;
        }
      }
      const err = new Error(errorMessage);
      err.status = response.status;
      err.data = parsedData;
      throw err;
    }

    return parsedData;
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);
    throw error;
  }
}

export default request;
