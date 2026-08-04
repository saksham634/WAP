import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Active view: 'login' | 'forgot-email' | 'forgot-otp' | 'forgot-password' | 'register-org' | 'register-otp' | 'register-password'
  const [view, setView] = useState('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Forgot password flow state
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Register Org flow state
  const [orgName, setOrgName] = useState(() => sessionStorage.getItem('wap_reg_org') || '');
  const [adminName, setAdminName] = useState(() => sessionStorage.getItem('wap_reg_name') || '');
  const [adminEmail, setAdminEmail] = useState(() => sessionStorage.getItem('wap_reg_email') || '');
  const [regOtp, setRegOtp] = useState(['', '', '', '', '', '']);
  const [adminPassword, setAdminPassword] = useState('');

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const data = await authAPI.login({
        email: loginEmail,
        password: loginPassword,
      });

      login(data);

      if (data.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else if (data.role === 'ROLE_HR') {
        navigate('/hr/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password: Step 1 - Send OTP
  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await authAPI.sendOtp(resetEmail);
      setMessage(`OTP verification code sent to ${resetEmail}`);
      setView('forgot-otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please check email address.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password: Step 2 - Verify OTP
  const handleVerifyResetOtp = async (e) => {
    e.preventDefault();
    const otpCode = resetOtp.join('');
    if (otpCode.length < 4) {
      setError('Please enter the full OTP code.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await authAPI.verifyOtp(resetEmail, otpCode);
      setView('forgot-password');
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password: Step 3 - Reset Password
  const handleFinalPasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const otpCode = resetOtp.join('');
      await authAPI.resetPassword(resetEmail, otpCode, newPassword);
      setMessage('Password updated successfully! You may now sign in.');
      setView('login');
      setLoginEmail(resetEmail);
      setLoginPassword('');
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  // Helper state setters with session cache
  const handleOrgNameChange = (val) => {
    setOrgName(val);
    sessionStorage.setItem('wap_reg_org', val);
  };
  const handleAdminNameChange = (val) => {
    setAdminName(val);
    sessionStorage.setItem('wap_reg_name', val);
  };
  const handleAdminEmailChange = (val) => {
    setAdminEmail(val);
    sessionStorage.setItem('wap_reg_email', val);
  };

  // Org Registration: Step 1 - Send OTP
  const handleSendRegOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const emailToSend = adminEmail || sessionStorage.getItem('wap_reg_email');
      if (!emailToSend) {
        throw new Error('Please enter a valid administrator email.');
      }
      await authAPI.sendOtp(emailToSend);
      setMessage(`Verification OTP sent to ${emailToSend}`);
      setView('register-otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Org Registration: Step 2 - Verify OTP
  const handleVerifyRegOtp = async (e) => {
    e.preventDefault();
    const otpCode = regOtp.join('');
    if (otpCode.length < 4) {
      setError('Please enter the full OTP code.');
      return;
    }

    const emailToVerify = adminEmail || sessionStorage.getItem('wap_reg_email');
    setError(null);
    setLoading(true);
    try {
      await authAPI.verifyOtp(emailToVerify, otpCode);
      setView('register-password');
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Org Registration: Step 3 - Complete Registration
  const handleCompleteOrgReg = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const finalOrgName = orgName || sessionStorage.getItem('wap_reg_org') || 'My Organization';
      const finalAdminName = adminName || sessionStorage.getItem('wap_reg_name') || 'Admin User';
      const finalAdminEmail = adminEmail || sessionStorage.getItem('wap_reg_email');

      await authAPI.registerOrg({
        companyName: finalOrgName,
        adminName: finalAdminName,
        email: finalAdminEmail,
        password: adminPassword,
        organizationName: finalOrgName,
        adminFullName: finalAdminName,
        adminEmail: finalAdminEmail,
        adminPassword: adminPassword,
      });

      sessionStorage.removeItem('wap_reg_org');
      sessionStorage.removeItem('wap_reg_name');
      sessionStorage.removeItem('wap_reg_email');

      setMessage('Organization registered successfully! Please log in.');
      setView('login');
      setLoginEmail(finalAdminEmail);
    } catch (err) {
      setError(err.message || 'Failed to register organization.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit box input
  const handleOtpChange = (index, value, otpArray, setOtpArray) => {
    if (value.length > 1) value = value.slice(-1);
    const updated = [...otpArray];
    updated[index] = value;
    setOtpArray(updated);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #005c5c 0%, #007a7a 50%, #009696 100%)',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
          maxWidth: '460px',
          width: '100%',
          padding: '40px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: '#e6f4f4',
              color: '#007a7a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              margin: '0 auto 14px auto',
            }}
          >
            <i className="fa-solid fa-network-wired"></i>
          </div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
            Workforce Portal
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
            Automation & Management System
          </p>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '13px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: '#dcfce7',
              border: '1px solid #bbf7d0',
              color: '#166534',
              fontSize: '13px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <i className="fa-solid fa-circle-check"></i>
            <span>{message}</span>
          </div>
        )}

        {/* 1. SIGN IN VIEW */}
        {view === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <i
                  className="fa-solid fa-envelope"
                  style={{ position: 'absolute', left: '14px', top: '15px', color: '#94a3b8' }}
                ></i>
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setError(null);
                    setMessage(null);
                    setView('forgot-email');
                  }}
                  style={{ fontSize: '13px', color: '#007a7a', fontWeight: 600, textDecoration: 'none' }}
                >
                  Forgot Password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <i
                  className="fa-solid fa-lock"
                  style={{ position: 'absolute', left: '14px', top: '15px', color: '#94a3b8' }}
                ></i>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: '12px' }}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Authenticating...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Need a company account?{' '}
                <a
                  href="#register"
                  onClick={(e) => {
                    e.preventDefault();
                    setError(null);
                    setMessage(null);
                    setView('register-org');
                  }}
                  style={{ color: '#007a7a', fontWeight: 600, textDecoration: 'none' }}
                >
                  Register Organization
                </a>
              </p>
            </div>
          </form>
        )}

        {/* 2. FORGOT PASSWORD FLOW */}
        {view === 'forgot-email' && (
          <form onSubmit={handleSendResetOtp}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>
              Reset Password
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>
              Enter your registered work email to receive a verification OTP.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Work Email
              </label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}
            >
              {loading ? 'Sending OTP...' : 'Send Verification OTP'}
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setView('login')}
              style={{ width: '100%', padding: '12px', borderRadius: '12px' }}
            >
              Back to Sign In
            </button>
          </form>
        )}

        {view === 'forgot-otp' && (
          <form onSubmit={handleVerifyResetOtp}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>
              Enter Verification OTP
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>
              Please enter the 6-digit OTP code sent to <strong>{resetEmail}</strong>
            </p>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
              {resetOtp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-input-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value, resetOtp, setResetOtp)}
                  style={{
                    width: '46px',
                    height: '52px',
                    textAlign: 'center',
                    fontSize: '20px',
                    fontWeight: 700,
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                  }}
                />
              ))}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}
            >
              {loading ? 'Verifying OTP...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setView('forgot-email')}
              style={{ width: '100%', padding: '12px', borderRadius: '12px' }}
            >
              Resend / Change Email
            </button>
          </form>
        )}

        {view === 'forgot-password' && (
          <form onSubmit={handleFinalPasswordReset}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>
              Set New Password
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>
              Create a secure password for your account.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px', borderRadius: '12px' }}
            >
              {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
            </button>
          </form>
        )}

        {/* 3. REGISTER ORGANIZATION FLOW */}
        {view === 'register-org' && (
          <form onSubmit={handleSendRegOtp}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>
              Register Organization
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>
              Set up your company workspace and administrative account.
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Organization / Company Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Innovations Inc"
                value={orgName}
                onChange={(e) => handleOrgNameChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Administrator Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={adminName}
                onChange={(e) => handleAdminNameChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Administrator Work Email
              </label>
              <input
                type="email"
                required
                placeholder="admin@company.com"
                value={adminEmail}
                onChange={(e) => handleAdminEmailChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}
            >
              {loading ? 'Sending OTP...' : 'Send Verification OTP'}
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setView('login')}
              style={{ width: '100%', padding: '12px', borderRadius: '12px' }}
            >
              Back to Sign In
            </button>
          </form>
        )}

        {view === 'register-otp' && (
          <form onSubmit={handleVerifyRegOtp}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>
              Verify Organization Email
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>
              Enter the OTP code sent to <strong>{adminEmail}</strong>
            </p>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
              {regOtp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-input-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value, regOtp, setRegOtp)}
                  style={{
                    width: '46px',
                    height: '52px',
                    textAlign: 'center',
                    fontSize: '20px',
                    fontWeight: 700,
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                  }}
                />
              ))}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}
            >
              {loading ? 'Verifying OTP...' : 'Verify & Continue'}
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setView('register-org')}
              style={{ width: '100%', padding: '12px', borderRadius: '12px' }}
            >
              Back to Details
            </button>
          </form>
        )}

        {view === 'register-password' && (
          <form onSubmit={handleCompleteOrgReg}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>
              Set Administrator Password
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>
              Choose a strong password for your master administrator account.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Admin Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px', borderRadius: '12px' }}
            >
              {loading ? 'Creating Workspace...' : 'Complete Organization Setup'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
