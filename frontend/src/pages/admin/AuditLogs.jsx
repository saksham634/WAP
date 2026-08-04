import React, { useEffect, useState } from 'react';
import { auditAPI } from '../../api';
import Header from '../../components/layout/Header';
import { downloadAuditLogsCSV } from '../../utils/downloadUtils';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuditLogs() {
      try {
        const data = await auditAPI.getLogs();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }
    loadAuditLogs();
  }, []);

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <Header
          title="Audit Logs"
          subtitle="Chronological immutable history of security events, administrative updates, and user activities"
        />
        {logs.length > 0 && (
          <button
            className="btn btn-outline"
            onClick={() => downloadAuditLogsCSV(logs)}
            style={{ padding: '10px 18px', borderRadius: '12px' }}
            title="Download immutable audit trail log as CSV"
          >
            <i className="fa-solid fa-file-csv" style={{ color: '#007a7a' }}></i> Export Audit Trail CSV
          </button>
        )}
      </div>

      <div
        className="card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e2e8f0',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading audit trails...
          </div>
        ) : logs.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No audit records found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: '#e6f4f4',
                    color: '#007a7a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0,
                  }}
                >
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '8px',
                        backgroundColor: '#e2e8f0',
                        color: '#334155',
                      }}
                    >
                      {log.action || 'SYSTEM_EVENT'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#0f172a', fontWeight: 600 }}>
                    {log.details || 'Administrative operation recorded.'}
                  </h4>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Performed by: <strong>{log.userEmail || 'System'}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
