import React from 'react';

export default function StatCard({ title, value, icon, color = '#007a7a', subtitle, badge }) {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '16px',
        padding: '20px 24px',
        borderRadius: '16px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          backgroundColor: `${color}18`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          flexShrink: 0,
        }}
      >
        <i className={icon}></i>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
          {title}
        </p>
        <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
          {value}
        </h3>
        {subtitle && (
          <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', display: 'block' }}>
            {subtitle}
          </span>
        )}
      </div>

      {badge && (
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '4px 8px',
            borderRadius: '12px',
            backgroundColor: badge.color ? `${badge.color}20` : '#e6f4f4',
            color: badge.color || '#007a7a',
          }}
        >
          {badge.text}
        </span>
      )}
    </div>
  );
}
