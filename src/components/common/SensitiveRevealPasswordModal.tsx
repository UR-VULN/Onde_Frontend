import React, { useEffect, useState } from 'react';

interface SensitiveRevealPasswordModalProps {
  open: boolean;
  title?: string;
  description?: string;
  loading?: boolean;
  errorMessage?: string;
  onCancel: () => void;
  onConfirm: (password: string) => void;
}

export const SensitiveRevealPasswordModal: React.FC<SensitiveRevealPasswordModalProps> = ({
  open,
  title = '본인 확인',
  description = '민감 정보를 확인하려면 로그인 비밀번호를 다시 입력해 주세요.',
  loading = false,
  errorMessage,
  onCancel,
  onConfirm,
}) => {
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!open) {
      setPassword('');
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || loading) {
      return;
    }
    onConfirm(password);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sensitive-reveal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: '#fff',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="sensitive-reveal-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
          {title}
        </h3>
        <p style={{ margin: '0.75rem 0 1.25rem', fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
          {description}
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="sensitive-reveal-password" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
            비밀번호
          </label>
          <input
            id="sensitive-reveal-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '0.95rem',
              marginBottom: errorMessage ? '0.5rem' : '1rem',
            }}
            placeholder="비밀번호 입력"
          />
          {errorMessage && (
            <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>
              {errorMessage}
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                background: '#fff',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || !password.trim()}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '10px',
                border: 'none',
                background: loading ? '#94a3b8' : 'var(--primary, #2563eb)',
                color: '#fff',
                fontWeight: 700,
                cursor: loading || !password.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? '확인 중…' : '확인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
