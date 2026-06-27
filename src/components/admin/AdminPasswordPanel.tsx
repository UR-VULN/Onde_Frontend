import React, { useState } from 'react';
import { patch_admin_password_api } from '@/api/adminApi';
import { useTravelStore } from '@/store/useTravelStore';
import { extractApiErrorMessage } from '@/utils/apiResponse';
import { logoutToHome } from '@/utils/authSession';
import { ADMIN_PASSWORD_POLICY_HINT, validatePassword } from '@/utils/passwordPolicy';

export const AdminPasswordPanel: React.FC = () => {
  const { addToast } = useTravelStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword.trim()) {
      addToast('현재 비밀번호를 입력해 주세요.', 'warning');
      return;
    }
    if (!newPassword.trim()) {
      addToast('새 비밀번호를 입력해 주세요.', 'warning');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      addToast('새 비밀번호와 확인 값이 일치하지 않습니다.', 'warning');
      return;
    }

    const policyError = validatePassword(newPassword, 'ADMIN');
    if (policyError) {
      addToast(policyError, 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const res = await patch_admin_password_api({
        currentPassword,
        newPassword,
      });
      if (res.success) {
        addToast(res.message || '비밀번호가 변경되었습니다. 다시 로그인해 주세요.', 'success');
        logoutToHome();
      } else {
        addToast(res.message || '비밀번호 변경에 실패했습니다.', 'warning');
      }
    } catch (err: unknown) {
      addToast(extractApiErrorMessage(err, '비밀번호 변경 중 오류가 발생했습니다.'), 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-panel">
      <div className="section-header">
        <div>
          <h2 className="section-title">관리자 비밀번호 변경</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            보안 정책에 따라 주기적으로 비밀번호를 변경할 수 있습니다. 변경 후 모든 세션이 종료됩니다.
          </p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '560px' }}>
        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-5">
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>현재 비밀번호</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="form-input"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>새 비밀번호</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-input"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>새 비밀번호 확인</label>
            <input
              type="password"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              className="form-input"
              autoComplete="new-password"
              required
            />
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>
              * {ADMIN_PASSWORD_POLICY_HINT}
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSaving}
              style={{ padding: '0.8rem 2.5rem', minWidth: '180px' }}
            >
              {isSaving ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: '0.5rem' }} />
                  변경 중...
                </>
              ) : (
                '비밀번호 변경'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
