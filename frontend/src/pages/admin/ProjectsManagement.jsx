import React, { useEffect, useState } from 'react';
import { projectAPI, userAPI } from '../../api';
import Header from '../../components/layout/Header';
import ConfirmModal from '../../components/common/ConfirmModal';
import { downloadProjectsCSV } from '../../utils/downloadUtils';

export default function ProjectsManagement() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState([]);

  // Create Project Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'MEDIUM',
    status: 'ONGOING',
    progress: 10,
    assignedMemberEmails: [],
  });

  // View Team Modal State
  const [selectedProjectTeam, setSelectedProjectTeam] = useState(null);

  // Status feedback
  const [feedback, setFeedback] = useState(null);

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await projectAPI.getAllProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const users = await userAPI.getAllUsers();
      if (Array.isArray(users)) {
        setUsersList(users);
      }
    } catch (err) {
      console.error('Failed to load staff for project assignment:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const assignedUserIds = usersList
        .filter((u) => newProject.assignedMemberEmails.includes(u.email))
        .map((u) => u.id);

      await projectAPI.createProject({
        ...newProject,
        assignedUserIds,
        assignedMemberEmails: newProject.assignedMemberEmails,
        assignedMembers: newProject.assignedMemberEmails.join(','),
      });
      setFeedback({ type: 'success', text: 'New project created successfully!' });
      setIsCreateModalOpen(false);
      setNewProject({
        title: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'MEDIUM',
        status: 'ONGOING',
        progress: 10,
        assignedMemberEmails: [],
      });
      fetchProjects();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to create project.' });
    }
  };

  const handleDeleteClick = (project) => {
    setDeleteTarget(project);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await projectAPI.deleteProject(deleteTarget.id);
      setFeedback({ type: 'success', text: `Project "${deleteTarget.title}" deleted successfully.` });
      setDeleteTarget(null);
      fetchProjects();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to delete project.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleMemberSelection = (email) => {
    const list = [...newProject.assignedMemberEmails];
    if (list.includes(email)) {
      setNewProject({ ...newProject, assignedMemberEmails: list.filter((e) => e !== email) });
    } else {
      setNewProject({ ...newProject, assignedMemberEmails: [...list, email] });
    }
  };

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
        title="Project Management"
        subtitle="Coordinate project deliverables, assigned teams, and track milestones"
      />

      {/* Action Header */}
      <div
        className="card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '20px 24px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#0f172a', fontWeight: 700 }}>
            Enterprise Projects & Delivery
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Coordinate project deliverables, assigned teams, and track milestones
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {projects.length > 0 && (
            <button
              className="btn btn-outline"
              onClick={() => downloadProjectsCSV(projects)}
              style={{ padding: '10px 18px', borderRadius: '10px' }}
              title="Download projects summary as CSV"
            >
              <i className="fa-solid fa-file-csv" style={{ color: '#007a7a' }}></i> Export CSV
            </button>
          )}

          <button
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
            style={{ padding: '10px 20px', borderRadius: '10px' }}
          >
            <i className="fa-solid fa-plus"></i> Create New Project
          </button>
        </div>
      </div>

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

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: '#007a7a', marginBottom: '12px' }}></i>
          <p style={{ margin: 0 }}>Loading active projects...</p>
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
          <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>No Projects Created Yet</h3>
          <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px' }}>
            Get started by initializing a new team project.
          </p>
          <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            <i className="fa-solid fa-plus"></i> Create First Project
          </button>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
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
                  {/* Dates & Timeline */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#64748b',
                      marginBottom: '8px',
                    }}
                  >
                    <span>
                      <i className="fa-regular fa-calendar" style={{ marginRight: '6px' }}></i>
                      Start: {proj.startDate || '2026-07-01'}
                    </span>
                    <span>
                      <i className="fa-regular fa-flag" style={{ marginRight: '6px' }}></i>
                      Due: {proj.deadline || '2026-08-30'}
                    </span>
                  </div>

                  {/* Progress Bar */}
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

                  {/* Card Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleViewTeam(proj)}
                      style={{ flex: 1, fontSize: '12px', padding: '8px 12px' }}
                    >
                      <i className="fa-solid fa-users-viewfinder"></i> View Team ({proj.assignedUsers ? proj.assignedUsers.length : 0})
                    </button>
                      <button
                        className="btn btn-outline"
                        onClick={() => handleDeleteClick(proj)}
                        style={{
                          padding: '8px 12px',
                          color: '#ef4444',
                          borderColor: '#fca5a5',
                          backgroundColor: '#fef2f2',
                          borderRadius: '8px',
                        }}
                        title="Delete Project"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {isCreateModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Project</h3>
              <button className="modal-close-btn" onClick={() => setIsCreateModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Project Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cloud Infrastructure Migration"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Description & Objectives
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter project deliverables, scope, and key objectives..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Deadline / Due Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newProject.deadline}
                      onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Priority
                    </label>
                    <select
                      value={newProject.priority}
                      onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Status
                    </label>
                    <select
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="ONGOING">Ongoing</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Team Assignment Multi-Select */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Assign Team Members (Employees & HRs)
                  </label>
                  <div
                    style={{
                      maxHeight: '160px',
                      overflowY: 'auto',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    {usersList.map((u) => {
                      const isSelected = newProject.assignedMemberEmails.includes(u.email);
                      return (
                        <div
                          key={u.id}
                          onClick={() => toggleMemberSelection(u.email)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            backgroundColor: isSelected ? '#e6f4f4' : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            style={{ accentColor: '#007a7a' }}
                          />
                          <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 500 }}>
                            {u.fullName} ({u.email}) - {(u.role || '').replace('ROLE_', '')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
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
      {/* Custom In-App Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Project"
        message={deleteTarget ? `Are you sure you want to delete project "${deleteTarget.title}"? All task logs and team allocations will be removed.` : ''}
        confirmText="Delete Project"
        cancelText="Cancel"
        isDestructive={true}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
