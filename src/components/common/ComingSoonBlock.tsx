import React from 'react';

interface ComingSoonBlockProps {
  title: string;
  description?: string;
  iconClass?: string;
  minHeight?: string;
}

export const ComingSoonBlock: React.FC<ComingSoonBlockProps> = ({
  title,
  description = '백엔드 API 연동 후 제공될 예정입니다.',
  iconClass = 'fa-solid fa-screwdriver-wrench',
  minHeight = '200px',
}) => (
  <div
    style={{
      minHeight,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem 1.5rem',
      borderRadius: 'var(--radius-md)',
      border: '1px dashed var(--border-color)',
      background: 'var(--bg-light)',
      gap: '0.75rem',
    }}
  >
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontSize: '0.72rem',
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--primary)',
        background: '#e6f0ff',
        padding: '0.35rem 0.75rem',
        borderRadius: '999px',
      }}
    >
      <i className="fa-solid fa-hourglass-half"></i>
      준비 중
    </span>
    <i className={iconClass} style={{ fontSize: '2rem', color: 'var(--text-muted)', opacity: 0.45 }}></i>
    <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', margin: 0 }}>{title}</p>
    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, maxWidth: '320px', lineHeight: 1.5 }}>
      {description}
    </p>
  </div>
);
