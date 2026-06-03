import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer 
      className="footer select-none" 
      style={{
        padding: '2.5rem 1rem', 
        textAlign: 'center', 
        fontSize: '0.88rem', 
        color: 'var(--text-muted)', 
        borderTop: '1px solid var(--border-color)', 
        background: 'var(--bg-white)'
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', fontWeight: 500, letterSpacing: '-0.2px' }}>
        © 2026 온데 (ONDE), Inc. All rights reserved.
      </div>
    </footer>
  );
};
