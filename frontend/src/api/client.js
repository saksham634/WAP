const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(newToken) {
  refreshSubscribers.map((cb) => cb(newToken));
  refreshSubscribers = [];
}

async function performTokenRefresh() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Refresh token expired or invalid');
  }

  const data = await response.json();
  const newAccessToken = data.accessToken || data.token;
  const newRefreshToken = data.refreshToken;

  if (newAccessToken) {
    localStorage.setItem('token', newAccessToken);
  }
  if (newRefreshToken) {
    localStorage.setItem('refreshToken', newRefreshToken);
  }

  return newAccessToken;
}

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

    // Handle Token Expiry & Silent Token Refresh (401)
    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/register')) {
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const newToken = await performTokenRefresh();
            isRefreshing = false;
            onRefreshed(newToken);

            // Replay original request with the new access token
            headers['Authorization'] = `Bearer ${newToken}`;
            const retryResponse = await fetch(url, { ...options, headers });
            return await parseResponse(retryResponse, endpoint);
          } catch (refreshErr) {
            isRefreshing = false;
            refreshSubscribers = [];
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('role');
            window.dispatchEvent(new Event('auth:unauthorized'));
            throw refreshErr;
          }
        } else {
          // Wait for token refresh in progress
          return new Promise((resolve, reject) => {
            subscribeTokenRefresh(async (newToken) => {
              try {
                headers['Authorization'] = `Bearer ${newToken}`;
                const retryResponse = await fetch(url, { ...options, headers });
                resolve(await parseResponse(retryResponse, endpoint));
              } catch (err) {
                reject(err);
              }
            });
          });
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    return await parseResponse(response, endpoint);
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);
    throw error;
  }
}

async function parseResponse(response, endpoint) {
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

  // Handle ApiResponse<T> wrapper unwrapping while preserving root data for legacy endpoints
  if (parsedData && typeof parsedData === 'object' && parsedData.hasOwnProperty('success') && parsedData.hasOwnProperty('data')) {
    // If it's an ApiResponse wrapper, return the inner data payload if not null
    return parsedData.data !== undefined && parsedData.data !== null ? parsedData.data : parsedData;
  }

  return parsedData;
}

export default request;
