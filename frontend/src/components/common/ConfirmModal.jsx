import React from 'react';

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onCancel}
    >
      <div
        className="modal-card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '28px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          position: 'relative',
          animation: 'slideUp 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              backgroundColor: isDestructive ? '#fee2e2' : '#e6f4f4',
              color: isDestructive ? '#dc2626' : '#007a7a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              flexShrink: 0,
            }}
          >
            <i className={isDestructive ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-question'}></i>
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              {title}
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>
              {message}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#64748b',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
            }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#ffffff',
              backgroundColor: isDestructive ? '#dc2626' : '#007a7a',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: isDestructive
                ? '0 4px 12px rgba(220, 38, 38, 0.25)'
                : '0 4px 12px rgba(0, 122, 122, 0.25)',
            }}
          >
            {loading && <i className="fa-solid fa-spinner fa-spin"></i>}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
