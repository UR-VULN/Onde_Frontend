import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SidebarItem {
  id: string;
  icon: string;
  label: string;
}

interface BackOfficeLayoutProps {
  portalName: string;
  portalType: 'sell' | 'adm';
  sidebarItems: SidebarItem[];
  activeTab: string;
  onTabChange: (id: any) => void;
  children: React.ReactNode;
  username?: string;
  logout: () => void;
  platformStatus?: string;
}

export const BackOfficeLayout: React.FC<BackOfficeLayoutProps> = ({
  portalName,
  portalType,
  sidebarItems,
  activeTab,
  onTabChange,
  children,
  username,
  logout,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7f9fa] flex flex-col font-main">
      {/* ── Header ── */}
      <header className="header">
        <div className="navbar">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <i className={`fa-solid ${isSidebarOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
            </button>

            <div
              className="logo select-none cursor-pointer"
              onClick={() => navigate('/', { replace: true })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') navigate('/', { replace: true });
              }}
            >
              <div className="logo-box">
                <span className="logo-box-line">ON</span>
                <span className="logo-box-line">DE</span>
              </div>
              <span>온데</span>
              <span className="logo-subtitle">
                {portalName}
              </span>
            </div>
          </div>
          <div className="nav-actions">
            {username && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.35 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                  {portalType === 'sell' ? '판매자' : '관리자'} 접속 계정
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                  {username}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Body: same max-width centering as MainLayout ── */}
      <div className="flex-1 self-center w-full max-w-[1280px] px-8 pt-8 pb-12">

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[900] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar + Content Row ── */}
        <div className="flex gap-8 items-start">

          {/* ── Sidebar ── */}
          <aside className={`
            extranet-sidebar
            w-[240px] shrink-0 self-start
            fixed lg:sticky lg:top-24
            z-[1000] lg:z-10
            transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="px-3 mb-2 mt-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Menu</p>
            </div>

            <nav className="flex flex-col gap-1">
              {sidebarItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onTabChange(item.id); setIsSidebarOpen(false); }}
                    className={`extranet-item ${isActive ? 'active' : ''}`}
                  >
                    <i className={`${item.icon} text-center w-5 shrink-0`}></i>
                    <span className="flex-1 font-semibold truncate">{item.label}</span>
                  </button>
                );
              })}

              {/* Separator and Logout Section */}
              <div className="pt-2 mt-2 border-t border-slate-100 flex flex-col gap-1">
                <div className="px-3 mb-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/', { replace: true });
                    setTimeout(() => {
                      logout();
                    }, 50);
                  }}
                  className="extranet-item"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket text-rose-500 text-center w-5"></i>
                  <span className="font-semibold">
                    {portalType === 'sell' ? '판매자 로그아웃' : '관리자 로그아웃'}
                  </span>
                </button>
              </div>
            </nav>
          </aside>

          {/* ── Main Content Area ──
              flex-1 min-w-0: fills remaining space, never overflows flex row
              flex flex-col items-stretch: forces every child panel to identical width
          */}
          <main className="flex-1 min-w-0 flex flex-col items-stretch animate-[fadeIn_0.3s_ease]">
            {children}
          </main>

        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
