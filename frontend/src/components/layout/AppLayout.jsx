import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatbotWidget from './ChatbotWidget';
import { useSidebar } from '../../context/SidebarContext';

export default function AppLayout() {
  const { isOpen, close, toggle } = useSidebar();

  return (
    <div className="dashboard-container">
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={close} aria-label="Close sidebar overlay" />
      <Sidebar isOpen={isOpen} onClose={close} />
      <main className="main-content">
        <Outlet context={{ onToggleSidebar: toggle }} />
      </main>
      <ChatbotWidget />
    </div>
  );
}