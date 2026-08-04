import React, { useEffect, useState } from 'react';
import { projectAPI, userAPI } from '../../api';
import Header from '../../components/layout/Header';

export default function EmployeeProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState([]);
  const [selectedProjectTeam, setSelectedProjectTeam] = useState(null);

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      try {
        const projs = await projectAPI.getMyProjects();
        if (Array.isArray(projs)) setProjects(projs);
      } catch (err) {
        console.error('Failed to load employee projects:', err);
      } finally {
        setLoading(false);
      }

      // Non-blocking load for users list (if permitted)
      try {
        const users = await userAPI.getAllUsers();
        if (Array.isArray(users)) setUsersList(users);
      } catch (e) {
        // Safe to ignore for employees without user-management permission
      }
    }
    loadProjects();
  }, []);

  const handleViewTeam = (proj) => {
    // 1. Direct assignedUsers list from backend
    if (Array.isArray(proj.assignedUsers) && proj.assignedUsers.length > 0) {
      const enrichedMembers = proj.assignedUsers.map((u) => {
        const match = usersList.find((ul) => ul.id === u.id || (ul.email && u.email && ul.email.toLowerCase() === u.email.toLowerCase()));
        return {
          id: u.id,
          fullName: u.fullName || match?.fullName || u.email,
          email: u.email || match?.email,
          role: u.role || match?.role || 'ROLE_EMPLOYEE',
          designation: u.designation || match?.designation || 'Team Member',
        };
      });
      setSelectedProjectTeam({
        projectTitle: proj.title,
        members: enrichedMembers,
      });
      return;
    }

    // 2. Fallback matching against assignedMembers string / array
    let memberEmails = [];
    if (typeof proj.assignedMembers === 'string') {
      memberEmails = proj.assignedMembers.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (Array.isArray(proj.assignedMembers)) {
      memberEmails = proj.assignedMembers;
    }

    const matchedTeam = usersList.filter((u) => memberEmails.includes(u.email) || memberEmails.includes(u.fullName));
    setSelectedProjectTeam({
      projectTitle: proj.title,
      members: matchedTeam.length > 0 ? matchedTeam : memberEmails.map((em) => ({ fullName: em, email: em, role: 'ROLE_EMPLOYEE', designation: 'Team Member' })),
    });
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Header
        title="My Projects & Deliverables"
        subtitle="Track active sprint milestones, project teams, and deliverables assigned to you"
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: '#007a7a', marginBottom: '12px' }}></i>
          <p style={{ margin: 0 }}>Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div
          className="card"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '60px 20px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
          }}
        >
          <i className="fa-solid fa-folder-open" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
          <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>No Assigned Projects</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            You are not currently assigned to any active project deliverables.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {projects.map((proj) => {
            const isCompleted = (proj.status || '').toUpperCase() === 'COMPLETED';
            const priorityColor =
              proj.priority === 'HIGH' ? '#ef4444' : proj.priority === 'LOW' ? '#10b981' : '#f59e0b';

            return (
              <div
                key={proj.id}
                className="card"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        backgroundColor: `${priorityColor}18`,
                        color: priorityColor,
                      }}
                    >
                      {proj.priority || 'MEDIUM'} PRIORITY
                    </span>

                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        backgroundColor: isCompleted ? '#dcfce7' : '#e6f4f4',
                        color: isCompleted ? '#166534' : '#007a7a',
                      }}
                    >
                      {isCompleted ? 'COMPLETED' : 'ONGOING'}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', color: '#0f172a', fontWeight: 700 }}>
                    {proj.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                    {proj.description || 'No detailed description provided.'}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                    <span>
                      <i className="fa-regular fa-calendar" style={{ marginRight: '6px' }}></i>
                      Start: {proj.startDate || '2026-07-01'}
                    </span>
                    <span>
                      <i className="fa-regular fa-flag" style={{ marginRight: '6px' }}></i>
                      Due: {proj.deadline || '2026-08-30'}
                    </span>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      <span>Progress</span>
                      <span>{proj.progress || (isCompleted ? 100 : 45)}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${proj.progress || (isCompleted ? 100 : 45)}%`,
                          height: '100%',
                          backgroundColor: isCompleted ? '#10b981' : '#007a7a',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>

                  {/* Assigned Team Members Preview */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                        Assigned Team ({proj.assignedUsers ? proj.assignedUsers.length : 0})
                      </span>
                    </div>
                    {proj.assignedUsers && proj.assignedUsers.length > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        {proj.assignedUsers.slice(0, 4).map((u, i) => (
                          <div
                            key={i}
                            title={`${u.fullName} (${u.email})`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              backgroundColor: '#e6f4f4',
                              color: '#007a7a',
                              fontSize: '11px',
                              fontWeight: 600,
                            }}
                          >
                            <span
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                backgroundColor: '#007a7a',
                                color: '#ffffff',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                              }}
                            >
                              {(u.fullName || u.email || 'U').charAt(0).toUpperCase()}
                            </span>
                            <span>{(u.fullName || u.email || '').split(' ')[0]}</span>
                          </div>
                        ))}
                        {proj.assignedUsers.length > 4 && (
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                            +{proj.assignedUsers.length - 4} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                        No members assigned yet
                      </span>
                    )}
                  </div>

                  <button
                    className="btn btn-outline"
                    onClick={() => handleViewTeam(proj)}
                    style={{ width: '100%', fontSize: '13px' }}
                  >
                    <i className="fa-solid fa-users-viewfinder"></i> View Project Team ({proj.assignedUsers ? proj.assignedUsers.length : 0})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW TEAM MODAL */}
      {selectedProjectTeam && (
        <div className="modal-backdrop" onClick={() => setSelectedProjectTeam(null)}>
          <div className="modal-content-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '17px' }}>Assigned Project Team</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{selectedProjectTeam.projectTitle}</p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedProjectTeam(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              {selectedProjectTeam.members.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', margin: '20px 0' }}>
                  No team members assigned yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedProjectTeam.members.map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#007a7a',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '13px',
                          }}
                        >
                          {(m.fullName || m.email || 'M').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>{m.fullName || m.email}</h4>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{m.email}</span>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '10px',
                          backgroundColor: '#e6f4f4',
                          color: '#007a7a',
                        }}
                      >
                        {(m.role || 'STAFF').replace('ROLE_', '')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedProjectTeam(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
