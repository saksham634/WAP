import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useSidebar } from '../../context/SidebarContext';

export default function AppLayout() {
  const { isOpen, close, toggle } = useSidebar();

  return (
    <div className="dashboard-container">
      {/* Mobile Backdrop Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={close}
        aria-label="Close sidebar overlay"
      />

      {/* Responsive Sidebar */}
      <Sidebar isOpen={isOpen} onClose={close} />

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet context={{ onToggleSidebar: toggle }} />
      </main>
    </div>
  );
}
