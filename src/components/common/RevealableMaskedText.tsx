import React, { useState } from 'react';
import { SensitiveRevealPasswordModal } from '@/components/common/SensitiveRevealPasswordModal';
import { extractApiErrorMessage } from '@/utils/apiResponse';

interface RevealableMaskedTextProps {
  /** API 기본 응답의 마스킹된 값 */
  maskedValue: string;
  /** 비밀번호 확인 후 원문 조회 */
  getPlaintext?: (password: string) => Promise<string>;
  className?: string;
  style?: React.CSSProperties;
  showIcon?: boolean;
}

export const RevealableMaskedText: React.FC<RevealableMaskedTextProps> = ({
  maskedValue,
  getPlaintext,
  className,
  style,
  showIcon = true,
}) => {
  const [revealed, setRevealed] = useState(false);
  const [plainText, setPlainText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState('');

  if (!maskedValue) {
    return null;
  }

  const hide = () => setRevealed(false);

  const openRevealFlow = () => {
    if (plainText) {
      setRevealed(true);
      return;
    }
    setModalError('');
    setModalOpen(true);
  };

  const toggle = () => {
    if (revealed) {
      hide();
      return;
    }
    if (!getPlaintext) {
      setPlainText(maskedValue);
      setRevealed(true);
      return;
    }
    openRevealFlow();
  };

  const handlePasswordConfirm = async (password: string) => {
    if (!getPlaintext) {
      return;
    }
    setLoading(true);
    setModalError('');
    try {
      const plain = await getPlaintext(password);
      setPlainText(plain);
      setModalOpen(false);
      setRevealed(true);
    } catch (err: unknown) {
      setModalError(extractApiErrorMessage(err, '비밀번호가 일치하지 않습니다.'));
    } finally {
      setLoading(false);
    }
  };

  const display = revealed ? (plainText ?? maskedValue) : maskedValue;

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        className={className}
        onClick={() => void toggle()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            void toggle();
          }
        }}
        style={{
          cursor: loading ? 'wait' : 'pointer',
          userSelect: revealed ? 'text' : 'none',
          opacity: loading ? 0.6 : 1,
          ...style,
        }}
        title={revealed ? '클릭하여 가리기' : '클릭하여 전체 보기'}
        aria-label={revealed ? '민감 정보 가리기' : '민감 정보 전체 보기'}
      >
        {loading && !modalOpen ? '확인 중…' : display}
        {showIcon && !loading && (
          <i
            className={`fa-solid ${revealed ? 'fa-eye-slash' : 'fa-eye'}`}
            style={{ marginLeft: '0.4rem', opacity: 0.45, fontSize: '0.85em' }}
            aria-hidden
          />
        )}
      </span>
      <SensitiveRevealPasswordModal
        open={modalOpen}
        loading={loading}
        errorMessage={modalError}
        onCancel={() => {
          if (!loading) {
            setModalOpen(false);
            setModalError('');
          }
        }}
        onConfirm={(password) => void handlePasswordConfirm(password)}
      />
    </>
  );
};

interface RevealableMaskedFieldProps {
  maskedValue: string;
  getPlaintext?: (password: string) => Promise<string>;
  placeholder?: string;
}

export const RevealableMaskedField: React.FC<RevealableMaskedFieldProps> = ({
  maskedValue,
  getPlaintext,
  placeholder,
}) => (
  <div
    style={{
      width: '100%',
      padding: '0.8rem 1rem',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      background: '#f1f5f9',
      fontSize: '0.95rem',
      color: '#64748b',
      minHeight: '2.75rem',
      display: 'flex',
      alignItems: 'center',
    }}
  >
    {maskedValue ? (
      <RevealableMaskedText maskedValue={maskedValue} getPlaintext={getPlaintext} />
    ) : (
      <span style={{ color: '#94a3b8' }}>{placeholder}</span>
    )}
  </div>
);
