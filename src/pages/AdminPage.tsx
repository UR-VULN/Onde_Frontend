import React, { useMemo, useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { canAccessAdminTab, type AdminTabId } from '@/utils/adminPermissions';
import { AdminHQPanel } from '@/components/admin/AdminHQPanel';
import { AdminDashboardPanel } from '@/components/admin/AdminDashboardPanel';
import { AdminUserPanel } from '@/components/admin/AdminUserPanel';
import { AdminLBSPanel } from '@/components/admin/AdminLBSPanel';
import { AdminSettlementPanel } from '@/components/admin/AdminSettlementPanel';
import { AdminCommunityPanel } from '@/components/admin/AdminCommunityPanel';
import { AdminPasswordPanel } from '@/components/admin/AdminPasswordPanel';
import { BackOfficeLayout } from '@/components/layout/BackOfficeLayout';

type AdminTab = 'stat' | 'approve' | 'book' | 'user' | 'lbs' | 'settlement' | 'community' | 'password';

const ALL_SIDEBAR_ITEMS: { id: AdminTabId; icon: string; label: string }[] = [
  { id: 'stat',       icon: 'fa-solid fa-chart-line',          label: '종합 대시보드'           },
  { id: 'approve',    icon: 'fa-solid fa-stamp',               label: '상품 검수 관리'           },
  { id: 'book',       icon: 'fa-solid fa-book-bookmark',       label: '전사 예약 및 직권취소'    },
  { id: 'user',       icon: 'fa-solid fa-users-gear',          label: '회원 권한 및 블랙리스트'  },
  { id: 'community',  icon: 'fa-solid fa-square-rss',          label: '여행기(커뮤니티) 관리'    },
  { id: 'lbs',        icon: 'fa-solid fa-location-crosshairs', label: 'LBS 마커 및 알림 에디터'  },
  { id: 'settlement', icon: 'fa-solid fa-file-invoice-dollar',  label: '정산 승인 관리'           },
  { id: 'password',   icon: 'fa-solid fa-key',                 label: '비밀번호 변경'            },
];

export const AdminPage: React.FC = () => {
  const { username, memberRole } = useTravelStore();
  const sidebarItems = useMemo(
    () => ALL_SIDEBAR_ITEMS.filter((item) => canAccessAdminTab(memberRole, item.id)),
    [memberRole]
  );
  const [activeTab, setActiveTab] = useState<AdminTab>('stat');

  const effectiveTab = sidebarItems.some((item) => item.id === activeTab)
    ? activeTab
    : (sidebarItems[0]?.id ?? 'stat');

  const renderPanel = () => {
    switch (effectiveTab) {
      case 'stat':       return <AdminDashboardPanel />;
      case 'approve':    return <AdminHQPanel key="approve" defaultTab="approval" />;
      case 'book':       return <AdminHQPanel key="book" defaultTab="booking" />;
      case 'user':       return <AdminUserPanel />;
      case 'community':  return <AdminCommunityPanel />;
      case 'lbs':        return <AdminLBSPanel />;
      case 'settlement': return <AdminSettlementPanel />;
      case 'password':   return <AdminPasswordPanel />;
      default:           return <AdminDashboardPanel />;
    }
  };

  return (
    <BackOfficeLayout
      portalName="관리자 포탈"
      portalType="adm"
      sidebarItems={sidebarItems}
      activeTab={effectiveTab}
      onTabChange={(id) => setActiveTab(id as AdminTab)}
      username={username}
      platformStatus="정상"
    >
      {renderPanel()}
    </BackOfficeLayout>
  );
};

