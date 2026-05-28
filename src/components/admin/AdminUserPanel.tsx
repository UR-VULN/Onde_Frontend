import React, { useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';

// ─── Mock 데이터 ────────────────────────────────────
const MOCK_USERS = [
  { id: 1023, email: 'buyer_shinjuku@gmail.com', role: 'ROLE_USER',   status: 'ACTIVE',    isBlacklisted: false },
  { id: 944,  email: 'seller_official@onde.com', role: 'ROLE_SELLER', status: 'ACTIVE',    isBlacklisted: false },
  { id: 1105, email: 'traveler_kim@naver.com',   role: 'ROLE_USER',   status: 'ACTIVE',    isBlacklisted: false },
  { id: 881,  email: 'spammer_bad@mail.xyz',     role: 'ROLE_USER',   status: 'BLACKLIST', isBlacklisted: true  },
];

const ROLE_BADGE_CLASS: Record<string, string> = {
  ROLE_USER:       'bg-blue-50 text-primary border-blue-100',
  ROLE_SELLER:     'bg-amber-50 text-amber-700 border-amber-100',
  ROLE_ADMIN:      'bg-emerald-50 text-emerald-700 border-emerald-100',
};

export const AdminUserPanel: React.FC = () => {
  const { addToast, openConfirmPopup } = useTravelStore();
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      String(u.id).includes(searchKeyword)
  );

  const handle_role_change = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const nextRole = user.role === 'ROLE_USER' ? 'ROLE_SELLER' : 'ROLE_USER';
    const action = nextRole === 'ROLE_SELLER' ? 'ROLE_SELLER 전환' : 'ROLE_USER 강등';

    openConfirmPopup(
      (confirmed) => {
        if (!confirmed) return;
        setUsers((prev) =>
          prev.map((u) => u.id === userId ? { ...u, role: nextRole } : u)
        );
        addToast(`#${userId} 계정 권한이 ${nextRole}로 변경되었습니다.`, 'success');
      },
      {
        title: `권한 변경: ${action}`,
        description: `${user.email} 계정을 ${nextRole}으로 변경하시겠습니까?`,
        yesLabel: '변경',
        noLabel: '취소',
      }
    );
  };

  const handle_blacklist = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const isCurrentlyBlacklisted = user.isBlacklisted;

    openConfirmPopup(
      (confirmed) => {
        if (!confirmed) return;
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, isBlacklisted: !isCurrentlyBlacklisted, status: isCurrentlyBlacklisted ? 'ACTIVE' : 'BLACKLIST' }
              : u
          )
        );
        addToast(
          isCurrentlyBlacklisted
            ? `#${userId} 블랙리스트 해제 완료.`
            : `#${userId} Blacklist 차단 처리 완료.`,
          'success'
        );
      },
      {
        title: isCurrentlyBlacklisted ? '블랙리스트 해제' : 'Blacklist 차단',
        description: isCurrentlyBlacklisted
          ? `${user.email} 계정의 블랙리스트를 해제하시겠습니까?`
          : `${user.email} 계정을 Blacklist에 등록하고 접근을 차단하시겠습니까?`,
        yesLabel: isCurrentlyBlacklisted ? '해제' : '차단',
        noLabel: '취소',
      }
    );
  };

  return (
    <div className="admin-panel">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <i className="fa-solid fa-users-gear" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i> 전사 가입자 권한 조정 및 블랙리스트 관리
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            회원 마스터 데이터베이스를 조회하고 권한 및 규제를 직권 처리합니다. <span style={{ fontSize: '0.8rem' }}>(A팀)</span>
          </p>
        </div>
      </div>

      <div className="data-table-container">
        {/* 검색 헤더 */}
        <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-users-viewfinder" style={{ color: 'var(--primary)' }}></i> 회원 마스터 데이터베이스
          </h4>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="form-input"
              style={{ width: '220px', padding: '0.5rem 0.75rem' }}
              placeholder="이메일 또는 ID 검색"
            />
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '0.5rem 1rem' }}
              onClick={() => addToast(`${filteredUsers.length}명의 회원이 검색되었습니다.`, 'info')}
            >
              검색
            </button>
          </div>
        </div>

        {/* 회원 테이블 */}
        <table className="data-table">
          <thead>
            <tr>
              <th>고유 ID</th>
              <th>이메일 주소</th>
              <th>회원 등급(Role)</th>
              <th className="text-center">활동 상태</th>
              <th className="text-center">권한 상향/하향</th>
              <th className="text-right">규제</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="font-black text-slate-900">#{user.id}</td>
                <td className="text-slate-700 font-semibold">{user.email}</td>
                <td>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border tracking-tight ${ROLE_BADGE_CLASS[user.role] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="text-center">
                  <span className={`status-badge ${user.isBlacklisted ? 'status-rejected' : 'status-active'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="text-center">
                  {user.role !== 'ROLE_ADMIN' && (
                    <button
                      type="button"
                      className="btn-secondary text-[11px] py-1.5 px-4 rounded-xl border-slate-200 hover:border-primary hover:text-primary transition-all font-black"
                      onClick={() => handle_role_change(user.id)}
                    >
                      {user.role === 'ROLE_USER' ? 'ROLE_SELLER 전환' : 'ROLE_USER 강등'}
                    </button>
                  )}
                </td>
                <td className="text-right">
                  {user.role !== 'ROLE_ADMIN' && (
                    <button
                      type="button"
                      className={`text-[11px] py-1.5 px-4 rounded-xl font-black transition-all ${
                        user.isBlacklisted
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          : 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100'
                      }`}
                      onClick={() => handle_blacklist(user.id)}
                    >
                      {user.isBlacklisted ? '차단 해제' : 'Blacklist 차단'}
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-20 text-slate-400 font-bold">
                  검색 조건에 해당하는 회원이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
