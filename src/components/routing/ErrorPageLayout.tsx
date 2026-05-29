import React from 'react';

const ERROR_PAGE_BG =
  'linear-gradient(135deg, #f8faff 0%, #eef2ff 50%, #f0fdf4 100%)';

interface ErrorPageLayoutProps {
  children: React.ReactNode;
}

export const ErrorPageLayout: React.FC<ErrorPageLayoutProps> = ({ children }) => (
  <div style={{ minHeight: '100vh', background: ERROR_PAGE_BG }}>{children}</div>
);
