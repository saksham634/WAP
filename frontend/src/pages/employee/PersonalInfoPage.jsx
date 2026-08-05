import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../api';
import Header from '../../components/layout/Header';

export default function PersonalInfoPage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    employeeId: user?.employeeId || '',
    department: user?.department || '',
    phone: '',
    dob: '',
    gender: 'Male',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    profilePicture: user?.profilePicture || '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Webcam state
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const data = await userAPI.getMyProfile();
        if (data) {
          setProfile((prev) => ({
            ...prev,
            ...data,
            fullName: data.fullName || prev.fullName,
            email: data.email || prev.email,
            phone: data.phone || data.phoneNumber || prev.phone,
            address: data.address || data.addressStreet || prev.address,
            emergencyContactName: data.emergencyContactName || data.emergencyName || prev.emergencyContactName,
            emergencyContactPhone: data.emergencyContactPhone || data.emergencyPhone || prev.emergencyContactPhone,
            profilePicture: data.profilePicture || prev.profilePicture,
          }));
        }
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const payload = {
        ...profile,
        addressStreet: profile.address,
        address: profile.address,
        emergencyName: profile.emergencyContactName,
        emergencyContactName: profile.emergencyContactName,
        emergencyPhone: profile.emergencyContactPhone,
        emergencyContactPhone: profile.emergencyContactPhone,
        phone: profile.phone,
      };
      const updated = await userAPI.updateMyProfile(payload);
      updateUser(payload);
      setFeedback({ type: 'success', text: 'Personal information saved & persisted successfully!' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to save profile changes.' });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        setProfile((prev) => ({ ...prev, profilePicture: base64 }));
        try {
          await userAPI.uploadProfilePicture(base64);
          updateUser({ profilePicture: base64 });
          setFeedback({ type: 'success', text: 'Profile picture updated successfully!' });
        } catch (err) {
          setFeedback({ type: 'error', text: err.message || 'Failed to upload profile picture.' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startWebcam = async () => {
    setIsWebcamOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Could not access webcam: ' + (err.message || 'Permission denied') });
      setIsWebcamOpen(false);
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 320;
      canvas.height = videoRef.current.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/png');

      // Stop camera stream
      const stream = videoRef.current.srcObject;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      setIsWebcamOpen(false);

      setProfile((prev) => ({ ...prev, profilePicture: base64 }));
      try {
        await userAPI.uploadProfilePicture(base64);
        updateUser({ profilePicture: base64 });
        setFeedback({ type: 'success', text: 'Snapshot saved to profile picture!' });
      } catch (err) {
        setFeedback({ type: 'error', text: err.message || 'Failed to upload photo.' });
      }
    }
  };

  const handleRemovePhoto = async () => {
    setProfile((prev) => ({ ...prev, profilePicture: '' }));
    try {
      await userAPI.deleteProfilePicture();
      updateUser({ profilePicture: null });
      updateProfilePicture(null);
      setFeedback({ type: 'success', text: 'Profile picture removed successfully!' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to remove profile picture.' });
    }
  };

  const closeWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    }
    setIsWebcamOpen(false);
  };

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#007a7a', fontSize: '16px', fontWeight: 600 }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '10px' }}></i>
          Loading personal information...
        </div>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Header
        title="Personal Information"
        subtitle="Manage your personal contact details, residential address, emergency info, and avatar"
      />

      {feedback && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            backgroundColor: feedback.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: feedback.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${feedback.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            fontSize: '13px',
          }}
        >
          {feedback.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '24px' }}>
        {/* Left: Avatar Card */}
        <div
          className="card"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '28px 20px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: '#007a7a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '42px',
              backgroundImage: profile.profilePicture ? `url("${profile.profilePicture}")` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '4px solid #e6f4f4',
              boxShadow: '0 6px 16px rgba(0, 122, 122, 0.15)',
            }}
          >
            {!profile.profilePicture && (profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U')}
          </div>

          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#0f172a' }}>{profile.fullName || 'User'}</h3>
            <span style={{ fontSize: '13px', color: '#64748b' }}>{profile.email}</span>
            <div style={{ marginTop: '6px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '10px',
                  backgroundColor: '#e6f4f4',
                  color: '#007a7a',
                }}
              >
                {profile.employeeId || ''}
              </span>
            </div>
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{ width: '100%', fontSize: '13px' }}
            >
              <i className="fa-solid fa-cloud-arrow-up"></i> Upload New Photo
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={startWebcam}
              style={{ width: '100%', fontSize: '13px' }}
            >
              <i className="fa-solid fa-camera"></i> Take WebCam Snapshot
            </button>

            {profile.profilePicture && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleRemovePhoto}
                style={{ width: '100%', fontSize: '13px', color: '#dc2626', borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}
              >
                <i className="fa-solid fa-trash-can"></i> Remove Photo
              </button>
            )}
          </div>
        </div>

        {/* Right: Personal Info Form */}
        <div
          className="card"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid #e2e8f0',
          }}
        >
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Section 1: Basic Details */}
            <div>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#007a7a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                1. General Identity & Contacts
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={profile.dob || ''}
                    onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Residential Address */}
            <div>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#007a7a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                2. Residential Address
              </h4>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Permanent / Current Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Street, Landmark, City, State, Pincode"
                  value={profile.address || ''}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            {/* Section 3: Emergency Contact */}
            <div>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#007a7a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                3. Emergency Contact
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe (Spouse/Parent)"
                    value={profile.emergencyContactName || ''}
                    onChange={(e) => setProfile({ ...profile, emergencyContactName: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 99887 76655"
                    value={profile.emergencyContactPhone || ''}
                    onChange={(e) => setProfile({ ...profile, emergencyContactPhone: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ padding: '12px 28px', fontSize: '14px', borderRadius: '10px' }}
              >
                <i className="fa-solid fa-floppy-disk"></i> {saving ? 'Saving...' : 'Save & Persist Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* WEBCAM MODAL */}
      {isWebcamOpen && (
        <div className="modal-backdrop" onClick={closeWebcam}>
          <div className="modal-content-card" style={{ maxWidth: '420px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Capture Photo</h3>
              <button className="modal-close-btn" onClick={closeWebcam}>
                &times;
              </button>
            </div>
            <div className="modal-body" style={{ padding: '16px 0' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '100%', borderRadius: '12px', backgroundColor: '#000000' }}
              />
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', gap: '12px' }}>
              <button className="btn btn-outline" onClick={closeWebcam}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={capturePhoto}>
                <i className="fa-solid fa-camera"></i> Capture & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
