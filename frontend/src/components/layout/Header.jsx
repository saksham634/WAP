import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import ProfileDropdown from './ProfileDropdown';
import DirectMessagesModal from './DirectMessagesModal';

export default function Header({ title, subtitle, onToggleSidebar }) {
  const { user, role } = useAuth();
  const { toggle: toggleSidebar } = useSidebar();
  const outletCtx = useOutletContext();
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);

  const handleToggle = onToggleSidebar || outletCtx?.onToggleSidebar || toggleSidebar;

  const userName = user?.fullName || localStorage.getItem('fullName') || 'User';

  const defaultTitle =
    title ||
    (role === 'ROLE_ADMIN'
      ? 'System Administration'
      : role === 'ROLE_HR'
      ? `Welcome ${userName},`
      : `Welcome ${userName},`);

  const defaultSubtitle =
    subtitle ||
    (role === 'ROLE_ADMIN'
      ? 'Platform overview and system health metrics.'
      : role === 'ROLE_HR'
      ? "Here's your organization overview for today."
      : "Here's your workforce overview for today.");

  return (
    <>
      <header className="page-header">
        <div className="welcome-section" style={{ display: 'flex', alignItems: 'center' }}>
          <button
            type="button"
            className="mobile-toggle"
            onClick={handleToggle}
            aria-label="Toggle Menu"
          >
            <i className="fa-solid fa-bars"></i>
          </button>
          <div>
            <h1>{defaultTitle}</h1>
            <p>{defaultSubtitle}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="profile-menu"
            onClick={() => setIsMsgModalOpen(true)}
            title="Direct Messages"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              border: 'none',
              background: '#ffffff',
              boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
              color: '#007a7a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
            }}
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>

          <ProfileDropdown />
        </div>
      </header>

      <DirectMessagesModal
        isOpen={isMsgModalOpen}
        onClose={() => setIsMsgModalOpen(false)}
      />
    </>
  );
}
