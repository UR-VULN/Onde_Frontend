import React, { useEffect, useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import {
  get_admin_members_api,
  patch_admin_member_api,
  type AdminMemberDto,
} from '@/api/adminApi';
import { ROLE_BADGE_CLASS } from '@/constants/appConstants';

function isProtectedAdminRole(role: string): boolean {
  return (
    role === 'ROLE_SUPER_ADMIN' ||
    role === 'ROLE_GENERAL_ADMIN' ||
    role === 'ROLE_ADMIN' ||
    role.includes('ADMIN')
  );
}

export const AdminUserPanel: React.FC = () => {
  const { addToast, openConfirmPopup, memberRole } = useTravelStore();
  const isSuperAdmin = memberRole === 'SUPER_ADMIN' || memberRole === 'ROLE_SUPER_ADMIN';
  const [users, setUsers] = useState<AdminMemberDto[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  const loadMembers = async (keyword = searchKeyword) => {
    const res = await get_admin_members_api({ keyword, page: 0, size: 50 });
    if (res.success && res.data?.members) {
      setUsers(res.data.members);
    }
  };

  useEffect(() => {
    loadMembers('');
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      String(u.id).includes(searchKeyword)
  );

  const handle_role_change = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user || isProtectedAdminRole(user.role)) return;

    const nextRole = user.role === 'ROLE_USER' ? 'ROLE_SELLER' : 'ROLE_USER';

    openConfirmPopup(async (confirmed) => {
      if (!confirmed) return;
      const res = await patch_admin_member_api(userId, { role: nextRole });
      if (res.success) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: nextRole } : u)));
        addToast(`#${userId} 회원 권한을 ${nextRole}(으)로 변경했습니다.`, 'success');
      } else {
        addToast(res.message || '권한 변경에 실패했습니다.', 'warning');
      }
    }, {
      title: '회원 권한 변경',
      description: `${user.email} 회원의 권한을 ${nextRole}(으)로 변경합니다.`,
      yesLabel: '변경',
      noLabel: '취소',
    });
  };

  const handle_blacklist = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user || isProtectedAdminRole(user.role)) return;

    const nextBlind = !user.isBlacklisted;

    openConfirmPopup(async (confirmed) => {
      if (!confirmed) return;
      const res = await patch_admin_member_api(userId, { isBlacklisted: nextBlind });
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, isBlacklisted: nextBlind, status: nextBlind ? 'BLACKLIST' : 'ACTIVE' }
              : u
          )
        );
        addToast(nextBlind ? '블랙리스트 처리 완료' : '블랙리스트 해제 완료', 'success');
      } else {
        addToast(res.message || '처리에 실패했습니다.', 'warning');
      }
    }, {
      title: nextBlind ? '블랙리스트 등록' : '블랙리스트 해제',
      description: `${user.email} 회원을 ${nextBlind ? '블랙리스트에 등록' : '블랙리스트에서 해제'}합니다.`,
      yesLabel: '확인',
      noLabel: '취소',
    });
  };

  return (
    <div className="admin-panel">
      <div className="section-header">
        <div>
          <h2 className="section-title">전사 회원 통합 관리 및 권한 · 블랙리스트 제어</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            관리자 회원 목록을 API로 조회하고 권한 및 블랙리스트를 관리합니다.
          </p>
        </div>
      </div>

      <div className="data-table-container">
        <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h4 style={{ fontWeight: 700 }}>
            <i className="fa-solid fa-users-viewfinder" style={{ color: 'var(--primary)' }}></i> 회원 목록
          </h4>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="form-input"
              style={{ width: 220, padding: '0.5rem 0.75rem' }}
              placeholder="이메일 또는 ID 검색"
            />
            <button type="button" className="btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => loadMembers()}>
              검색
            </button>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>회원 ID</th>
              <th>이메일</th>
              <th>권한(Role)</th>
              <th className="text-center">계정 상태</th>
              <th className="text-center">권한 변경</th>
              <th className="text-right">블랙리스트</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="font-black">#{user.id}</td>
                <td className="font-semibold">{user.email}</td>
                <td>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${ROLE_BADGE_CLASS[user.role] ?? ''}`}>
                    {user.role}
                  </span>
                </td>
                <td className="text-center">
                  <span className={`status-badge ${user.isBlacklisted ? 'status-rejected' : 'status-active'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="text-center">
                  {!isProtectedAdminRole(user.role) && isSuperAdmin ? (
                    <button type="button" className="btn-secondary text-[11px] py-1.5 px-4" onClick={() => handle_role_change(user.id)}>
                      {user.role === 'ROLE_USER' ? 'SELLER 전환' : 'USER 전환'}
                    </button>
                  ) : (
                    !isProtectedAdminRole(user.role) && <span className="text-[11px] font-black text-slate-400">조회 전용</span>
                  )}
                </td>
                <td className="text-right">
                  {!isProtectedAdminRole(user.role) && isSuperAdmin ? (
                    <button
                      type="button"
                      className={`text-[11px] py-1.5 px-4 rounded-xl font-black ${user.isBlacklisted ? 'bg-slate-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}
                      onClick={() => handle_blacklist(user.id)}
                    >
                      {user.isBlacklisted ? '해제' : '등록'}
                    </button>
                  ) : (
                    !isProtectedAdminRole(user.role) && <span className="text-[11px] font-black text-slate-400">조회 전용</span>
                  )}
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-16 text-slate-400 font-bold">
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
