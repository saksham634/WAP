import React, { createContext, useContext, useState, useEffect } from 'react';
import { userAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [role, setRole] = useState(() => localStorage.getItem('role') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [profilePicture, setProfilePicture] = useState(() => localStorage.getItem('profilePicture') || null);
  const [permissions, setPermissions] = useState(() => {
    const raw = localStorage.getItem('permissions') || '';
    return raw ? raw.split(',').map((p) => p.trim()) : ['ALL'];
  });
  const [loading, setLoading] = useState(true);

  // Fetch current user details on initial mount or token change
  useEffect(() => {
    async function fetchCurrentUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const userData = await userAPI.getMe();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        if (userData.role) {
          setRole(userData.role);
          localStorage.setItem('role', userData.role);
        }
        if (userData.profilePicture) {
          setProfilePicture(userData.profilePicture);
          localStorage.setItem('profilePicture', userData.profilePicture);
        }
        if (userData.permissions) {
          const perms = userData.permissions.split(',').map((p) => p.trim());
          setPermissions(perms);
          localStorage.setItem('permissions', userData.permissions);
        } else if (userData.role === 'ROLE_ADMIN') {
          setPermissions(['ALL']);
          localStorage.setItem('permissions', 'ALL');
        }
        if (userData.fullName) localStorage.setItem('fullName', userData.fullName);
        if (userData.email) localStorage.setItem('userEmail', userData.email);
        if (userData.employeeId) localStorage.setItem('employeeId', userData.employeeId);
      } catch (err) {
        console.error('Failed to authenticate session:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentUser();

    // Listen for unauthorized events
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [token]);

  const login = (authData) => {
    const jwt = authData.token || authData.jwt || authData.accessToken;
    const userRole = authData.role;
    const userData = authData.user || authData;

    setToken(jwt);
    setRole(userRole);
    setUser(userData);

    localStorage.setItem('token', jwt);
    localStorage.setItem('role', userRole);
    localStorage.setItem('user', JSON.stringify(userData));

    if (authData.refreshToken) {
      localStorage.setItem('refreshToken', authData.refreshToken);
    }

    if (userData.fullName) localStorage.setItem('fullName', userData.fullName);
    if (userData.email) localStorage.setItem('userEmail', userData.email);
    if (userData.employeeId) localStorage.setItem('employeeId', userData.employeeId);
    if (userData.profilePicture) {
      setProfilePicture(userData.profilePicture);
      localStorage.setItem('profilePicture', userData.profilePicture);
    }
    if (userData.permissions) {
      const perms = userData.permissions.split(',').map((p) => p.trim());
      setPermissions(perms);
      localStorage.setItem('permissions', userData.permissions);
    } else if (userRole === 'ROLE_ADMIN') {
      setPermissions(['ALL']);
      localStorage.setItem('permissions', 'ALL');
    }
  };

  const logout = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      // Best-effort asynchronous token revocation
      fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }

    setToken(null);
    setRole(null);
    setUser(null);
    setProfilePicture(null);
    setPermissions([]);
    localStorage.clear();
  };

  const updateProfilePicture = async (dataUrl) => {
    setProfilePicture(dataUrl);
    if (dataUrl) {
      localStorage.setItem('profilePicture', dataUrl);
    } else {
      localStorage.removeItem('profilePicture');
    }
    try {
      await userAPI.updateMeProfile({ profilePicture: dataUrl });
    } catch (err) {
      console.error('Failed to sync profile picture to backend:', err);
    }
  };

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    setUser(merged);
    localStorage.setItem('user', JSON.stringify(merged));
  };

  const hasPermission = (permissionKey) => {
    if (role === 'ROLE_ADMIN') return true;
    if (permissions.includes('ALL')) return true;
    return permissions.includes(permissionKey);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        permissions,
        profilePicture,
        loading,
        login,
        logout,
        updateUser,
        updateProfilePicture,
        hasPermission,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
