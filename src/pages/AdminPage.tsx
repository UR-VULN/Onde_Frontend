import React, { useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { AdminHQPanel } from '@/components/admin/AdminHQPanel';
import { AdminDashboardPanel } from '@/components/admin/AdminDashboardPanel';
import { AdminUserPanel } from '@/components/admin/AdminUserPanel';
import { AdminLBSPanel } from '@/components/admin/AdminLBSPanel';
import { BackOfficeLayout } from '@/components/layout/BackOfficeLayout';

type AdminTab = 'stat' | 'approve' | 'book' | 'user' | 'lbs';

const SIDEBAR_ITEMS = [
  { id: 'stat',    icon: 'fa-solid fa-chart-line',         label: '종합 대시보드',         team: 'D팀' },
  { id: 'approve', icon: 'fa-solid fa-stamp',              label: '상품 검수 관리',         team: 'B/C팀' },
  { id: 'book',    icon: 'fa-solid fa-book-bookmark',      label: '전사 예약 및 직권취소',  team: '' },
  { id: 'user',    icon: 'fa-solid fa-users-gear',         label: '회원 권한 및 블랙리스트', team: 'A팀' },
  { id: 'lbs',     icon: 'fa-solid fa-location-crosshairs', label: 'LBS 마커 및 알림 에디터', team: 'E팀' },
];

export const AdminPage: React.FC = () => {
  const { username, logout } = useTravelStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('stat');

  const renderPanel = () => {
    switch (activeTab) {
      case 'stat':    return <AdminDashboardPanel />;
      case 'approve': return <AdminHQPanel defaultTab="approval" />;
      case 'book':    return <AdminHQPanel defaultTab="booking" />;
      case 'user':    return <AdminUserPanel />;
      case 'lbs':     return <AdminLBSPanel />;
      default:        return <AdminDashboardPanel />;
    }
  };

  return (
    <BackOfficeLayout
      portalName="관리자 포탈"
      portalType="adm"
      sidebarItems={SIDEBAR_ITEMS}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as AdminTab)}
      username={username}
      logout={logout}
      platformStatus="정상"
    >
      {renderPanel()}
    </BackOfficeLayout>
  );
};
