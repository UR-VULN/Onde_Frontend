import React, { useEffect, useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { fetch_member_me_api, update_member_profile_api, type ProfileUpdatePayload } from '@/api/userApi';
import { validatePassword, PASSWORD_POLICY_HINT } from '@/utils/passwordPolicy';
import { RevealableMaskedField, RevealableMaskedText } from '@/components/common/RevealableMaskedText';
import { extractApiErrorMessage } from '@/utils/apiResponse';
import { useMemberProfileReveal } from '@/hooks/useMemberProfileReveal';

interface ProfileEditFormProps {
  onCancel: () => void;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ onCancel }) => {
  const { addToast } = useTravelStore();
  const { revealField } = useMemberProfileReveal();

  const [maskedEmail, setMaskedEmail] = useState('');
  const [maskedName, setMaskedName] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch_member_me_api();
        if (res.success && res.data) {
          setMaskedEmail(res.data.email);
          setMaskedName(res.data.name || '');
          setMaskedPhone(res.data.phoneNumber || '');
          setNickname(res.data.nickname || '');
        }
      } catch{
        addToast('프로필 정보를 불러오는 데 실패했습니다.', 'warning');
      }
    };
    loadProfile();
  }, [addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      addToast('닉네임을 입력해 주세요.', 'warning');
      return;
    }

    let formattedPhone = newPhone.trim();
    if (formattedPhone && !formattedPhone.includes('-')) {
      if (formattedPhone.length === 11) {
        formattedPhone = formattedPhone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
      } else if (formattedPhone.length === 10) {
        formattedPhone = formattedPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
      }
    }

    const payload: ProfileUpdatePayload = {
      nickname: nickname.trim(),
    };

    if (newName.trim()) {
      payload.name = newName.trim();
    }
    if (formattedPhone) {
      payload.phoneNumber = formattedPhone;
    }

    if (password.trim()) {
      const passwordError = validatePassword(password.trim());
      if (passwordError) {
        addToast(passwordError, 'warning');
        return;
      }
      payload.newPassword = password.trim();
    }

    setIsLoading(true);
    try {
      const res = await update_member_profile_api(payload);
      if (res.success) {
        addToast('프로필 정보가 성공적으로 수정되었습니다.', 'success');
        
        // Update store state
        if (newName.trim()) {
          useTravelStore.setState({ name: newName.trim(), nickname: nickname.trim() });
        } else {
          useTravelStore.setState({ nickname: nickname.trim() });
        }

        onCancel();
      } else {
        addToast(res.message || '프로필 수정에 실패했습니다.', 'warning');
      }
    } catch (err: unknown) {
      addToast(extractApiErrorMessage(err, '서버 통신 중 오류가 발생했습니다.'), 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-edit-form-wrapper" style={{ animation: 'fadeIn 0.3s ease' }}>
      <h4 className="mypage-main-title">
        <i className="fa-solid fa-user-gear"></i> 프로필 관리 및 수정
      </h4>
      <p className="mypage-main-desc">
        회원님의 기본 정보와 비밀번호를 안전하게 수정하실 수 있습니다. 변경된 정보는 즉시 서비스에 반영됩니다.
      </p>

      <div className="mp-card" style={{ 
        padding: '2.5rem', 
        display: 'block', 
        cursor: 'default',
        marginTop: '1.5rem',
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
          {/* 이메일 (계정 ID) */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <i className="fa-solid fa-envelope" style={{ fontSize: '0.8rem', opacity: 0.6 }}></i>
              이메일 계정
            </label>
            <RevealableMaskedField
              maskedValue={maskedEmail}
              getPlaintext={(password) => revealField('email', password)}
              placeholder="example@travel.com"
            />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>* 이메일 계정은 변경이 불가능합니다. (클릭하면 전체 표시)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <i className="fa-solid fa-signature" style={{ fontSize: '0.8rem', opacity: 0.6 }}></i>
                이름
              </label>
              {maskedName && (
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  현재:{' '}
                  <RevealableMaskedText
                    maskedValue={maskedName}
                    getPlaintext={(password) => revealField('name', password)}
                    showIcon={false}
                  />
                </span>
              )}
              <input
                type="text"
                className="form-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.8rem 1rem', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
                placeholder="변경할 이름 (선택)"
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <i className="fa-solid fa-phone" style={{ fontSize: '0.8rem', opacity: 0.6 }}></i>
                전화번호
              </label>
              {maskedPhone && (
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  현재:{' '}
                  <RevealableMaskedText
                    maskedValue={maskedPhone}
                    getPlaintext={(password) => revealField('phoneNumber', password)}
                    showIcon={false}
                  />
                </span>
              )}
              <input
                type="tel"
                className="form-input"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.8rem 1rem', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
                placeholder="변경할 연락처 (선택)"
              />
            </div>
          </div>

          {/* 닉네임 */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <i className="fa-solid fa-user-tag" style={{ fontSize: '0.8rem', opacity: 0.6 }}></i>
              닉네임
            </label>
            <input
              type="text"
              className="form-input"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.8rem 1rem', 
                border: '1px solid #e2e8f0', 
                borderRadius: '10px',
                fontSize: '0.95rem',
                outline: 'none'
              }}
              placeholder="활동할 닉네임을 입력해 주세요"
              required
            />
          </div>

          {/* 비밀번호 변경 */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <i className="fa-solid fa-lock" style={{ fontSize: '0.8rem', opacity: 0.6 }}></i>
              비밀번호 변경
            </label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.8rem 1rem', 
                border: '1px solid #e2e8f0', 
                borderRadius: '10px',
                fontSize: '0.95rem',
                outline: 'none'
              }}
              placeholder="새 비밀번호를 입력해 주세요 (변경 시에만 입력)"
            />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              * 비밀번호를 변경하지 않으려면 공란으로 두세요. ({PASSWORD_POLICY_HINT})
            </span>
          </div>

          {/* 버튼 영역 */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '2rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
              style={{ 
                flex: 1, 
                padding: '0.9rem', 
                borderRadius: '12px', 
                fontWeight: 700, 
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: '#64748b'
              }}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ 
                flex: 2, 
                padding: '0.9rem', 
                borderRadius: '12px', 
                fontWeight: 700, 
                fontSize: '1rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                background: isLoading ? '#94a3b8' : 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)',
                color: '#fff',
                border: 'none',
                boxShadow: isLoading ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              {isLoading ? '저장 중...' : '저장 및 수정 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};