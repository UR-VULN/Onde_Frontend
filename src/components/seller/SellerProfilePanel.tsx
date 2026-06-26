import React, { useEffect, useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { fetch_member_me_api, type ProfileUpdatePayload } from '@/api/userApi';
import { update_seller_profile_api } from '@/api/sellerApi';
import { validatePassword, PASSWORD_POLICY_HINT } from '@/utils/passwordPolicy';
import { extractApiErrorMessage } from '@/utils/apiResponse';
import { RevealableMaskedField, RevealableMaskedText } from '@/components/common/RevealableMaskedText';
import { useMemberProfileReveal } from '@/hooks/useMemberProfileReveal';

export const SellerProfilePanel: React.FC = () => {
  const { addToast } = useTravelStore();
  const { revealField } = useMemberProfileReveal();

  const [maskedEmail, setMaskedEmail] = useState('');
  const [maskedName, setMaskedName] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
      } catch {
        addToast('프로필 정보를 불러오는 데 실패했습니다.', 'warning');
      }
    };
    loadProfile();
  }, [addToast]);

  const handle_save = async (e: React.FormEvent) => {
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

    const payload: ProfileUpdatePayload & { password?: string } = {
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
      payload.password = password.trim();
    }

    setIsSaving(true);
    try {
      const res = await update_seller_profile_api(payload);
      if (res.success) {
        addToast('프로필 정보가 성공적으로 수정되었습니다.', 'success');

        if (newName.trim()) {
          useTravelStore.setState({ name: newName.trim(), nickname: nickname.trim() });
        } else {
          useTravelStore.setState({ nickname: nickname.trim() });
        }

        setPassword('');
        setNewName('');
        setNewPhone('');
      } else {
        addToast(res.message || '프로필 수정에 실패했습니다.', 'warning');
      }
    } catch (err: unknown) {
      addToast(extractApiErrorMessage(err, '서버 통신 중 오류가 발생했습니다.'), 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="seller-panel">
      <div className="section-header">
        <div>
          <h2 className="section-title">판매자 개인 프로필 관리</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            판매자 계정의 기본 정보와 보안 설정을 관리합니다. 업체 정보는 '계정 및 계좌 설정' 메뉴에서 관리하세요.
          </p>
        </div>
      </div>

      <div className="wizard-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h4 style={{ fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <i className="fa-solid fa-user-gear" style={{ color: 'var(--primary)' }}></i>
          개인 정보 수정
        </h4>

        <form onSubmit={handle_save} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>이메일 계정 (ID)</label>
            <RevealableMaskedField
              maskedValue={maskedEmail}
              getPlaintext={(password) => revealField('email', password)}
            />
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>* 클릭하면 전체 이메일을 볼 수 있습니다.</p>
          </div>

          <div className="grid-2" style={{ gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>실명</label>
              {maskedName && (
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.35rem' }}>
                  현재:{' '}
                  <RevealableMaskedText
                    maskedValue={maskedName}
                    getPlaintext={(password) => revealField('name', password)}
                    showIcon={false}
                  />
                </p>
              )}
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="form-input"
                placeholder="변경할 이름 (선택)"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>연락처</label>
              {maskedPhone && (
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.35rem' }}>
                  현재:{' '}
                  <RevealableMaskedText
                    maskedValue={maskedPhone}
                    getPlaintext={(password) => revealField('phoneNumber', password)}
                    showIcon={false}
                  />
                </p>
              )}
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="form-input"
                placeholder="변경할 연락처 (선택)"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>닉네임 (활동명)</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="form-input"
              placeholder="파트너 포탈에서 사용할 닉네임을 입력해 주세요"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>비밀번호 변경</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="새로운 비밀번호를 입력해 주세요 (변경 시에만)"
                style={{ width: '100%' }}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>
              * 비밀번호를 변경하지 않으려면 공란으로 두십시오. ({PASSWORD_POLICY_HINT})
            </p>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSaving}
              style={{
                padding: '0.8rem 3rem',
                fontSize: '1rem',
                minWidth: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
              }}
            >
              {isSaving ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  저장 중...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk"></i>
                  프로필 정보 저장
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
