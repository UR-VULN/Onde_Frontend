import React, { useEffect, useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import {
  get_admin_members_api,
  patch_admin_member_api,
  type AdminMemberDto,
} from '@/api/adminApi';
import { ROLE_BADGE_CLASS } from '@/constants/appConstants';

export const AdminUserPanel: React.FC = () => {
  const { addToast, openConfirmPopup } = useTravelStore();
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
    if (!user || user.role === 'ROLE_ADMIN') return;

    const nextRole = user.role === 'ROLE_USER' ? 'ROLE_SELLER' : 'ROLE_USER';

    openConfirmPopup(async (confirmed) => {
      if (!confirmed) return;
      const res = await patch_admin_member_api(userId, { role: nextRole });
      if (res.success) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: nextRole } : u)));
        addToast(`#${userId} ?? ??? ${nextRole}? ???????.`, 'success');
      }
    }, {
      title: '?? ?? ??',
      description: `${user.email} ??? ??? ${nextRole}? ?????.`,
      yesLabel: '??',
      noLabel: '??',
    });
  };

  const handle_blacklist = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user || user.role === 'ROLE_ADMIN') return;

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
        addToast(nextBlind ? '????? ?? ??' : '????? ?? ??', 'success');
      }
    }, {
      title: nextBlind ? '????? ??' : '????? ??',
      description: `${user.email} ??? ?????.`,
      yesLabel: '??',
      noLabel: '??',
    });
  };

  return (
    <div className="admin-panel">
      <div className="section-header">
        <div>
          <h2 className="section-title">?? ?? ?? ? ?? ? ????? ??</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            ?? ?? ??? API? ???? ?????? ?????.
          </p>
        </div>
      </div>

      <div className="data-table-container">
        <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h4 style={{ fontWeight: 700 }}>
            <i className="fa-solid fa-users-viewfinder" style={{ color: 'var(--primary)' }}></i> ?? ??
          </h4>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="form-input"
              style={{ width: 220, padding: '0.5rem 0.75rem' }}
              placeholder="??? ?? ID ??"
            />
            <button type="button" className="btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => loadMembers()}>
              ??
            </button>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>?? ID</th>
              <th>???</th>
              <th>??(Role)</th>
              <th className="text-center">?? ??</th>
              <th className="text-center">?? ??</th>
              <th className="text-right">?????</th>
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
                  {user.role !== 'ROLE_ADMIN' && (
                    <button type="button" className="btn-secondary text-[11px] py-1.5 px-4" onClick={() => handle_role_change(user.id)}>
                      {user.role === 'ROLE_USER' ? 'SELLER ??' : 'USER ??'}
                    </button>
                  )}
                </td>
                <td className="text-right">
                  {user.role !== 'ROLE_ADMIN' && (
                    <button
                      type="button"
                      className={`text-[11px] py-1.5 px-4 rounded-xl font-black ${user.isBlacklisted ? 'bg-slate-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}
                      onClick={() => handle_blacklist(user.id)}
                    >
                      {user.isBlacklisted ? '??' : '??'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-16 text-slate-400 font-bold">
                  ?? ??? ????.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
