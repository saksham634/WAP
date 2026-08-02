import React, { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CameraSnapshotModal from './CameraSnapshotModal';

export default function ProfileDropdown() {
  const { user, role, profilePicture, updateProfilePicture, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const userName = user?.fullName || localStorage.getItem('fullName') || 'User';
  const userEmail = user?.email || localStorage.getItem('userEmail') || 'user@workforce.com';
  const employeeId = user?.employeeId || localStorage.getItem('employeeId') || 'EMP-001';
  
  const roleName =
    role === 'ROLE_ADMIN'
      ? 'System Administrator'
      : role === 'ROLE_HR'
      ? 'HR Manager'
      : 'Employee';

  const avatarInitial = userEmail ? userEmail.charAt(0).toUpperCase() : userName.charAt(0).toUpperCase();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        updateProfilePicture(base64);
        setIsOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePicture = () => {
    updateProfilePicture(null);
    setIsOpen(false);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      <div className="profile-wrapper" style={{ position: 'relative' }}>
        <div
          className="profile-section"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div
            className="profile-avatar"
            style={
              profilePicture
                ? { backgroundImage: `url("${profilePicture}")` }
                : {}
            }
          >
            {!profilePicture && avatarInitial}
          </div>
          <div className="profile-details">
            <h3>{userName}</h3>
            <span>{roleName}</span>
          </div>
          <i
            className="fa-solid fa-chevron-down"
            style={{
              fontSize: '12px',
              color: '#64748b',
              transition: 'transform 0.2s',
              transform: isOpen ? 'rotate(180deg)' : 'none',
            }}
          ></i>
        </div>

        {isOpen && (
          <>
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99,
              }}
              onClick={() => setIsOpen(false)}
            />
            <div
              className="profile-dropdown-card"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '320px',
                maxWidth: 'calc(100vw - 32px)',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                border: '1px solid #e2e8f0',
                padding: '20px',
                zIndex: 100,
                animation: 'modalIn 0.2s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid #f1f5f9',
                  marginBottom: '14px',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to upload new photo"
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: '#007a7a',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '22px',
                      backgroundImage: profilePicture ? `url("${profilePicture}")` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {!profilePicture && avatarInitial}
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                    }}
                  >
                    <i className="fa-solid fa-camera"></i>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {userName}
                  </h4>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '11px',
                      padding: '2px 8px',
                      backgroundColor: '#e6f4f4',
                      color: '#007a7a',
                      borderRadius: '12px',
                      fontWeight: 600,
                      marginTop: '4px',
                    }}
                  >
                    {roleName}
                  </span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {userEmail}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '13px' }}
                >
                  <i className="fa-solid fa-upload" style={{ color: '#007a7a' }}></i>
                  Upload Picture
                </button>

                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setIsOpen(false);
                    setIsCameraModalOpen(true);
                  }}
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '13px' }}
                >
                  <i className="fa-solid fa-camera" style={{ color: '#007a7a' }}></i>
                  Take On-Spot Snapshot
                </button>

                {profilePicture && (
                  <button
                    className="btn btn-outline"
                    onClick={handleRemovePicture}
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '13px', color: '#ef4444' }}
                  >
                    <i className="fa-solid fa-trash-can" style={{ color: '#ef4444' }}></i>
                    Remove Picture
                  </button>
                )}

                <button
                  className="btn btn-danger"
                  onClick={handleLogout}
                  style={{ width: '100%', marginTop: '6px', fontSize: '13px' }}
                >
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <CameraSnapshotModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(dataUrl) => updateProfilePicture(dataUrl)}
      />
    </>
  );
}
