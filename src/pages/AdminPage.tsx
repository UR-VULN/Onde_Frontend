import React from 'react';
import { AdminHQPanel } from '@/components/admin/AdminHQPanel';

export const AdminPage: React.FC = () => {
  return (
    <div className="page-container active !py-8">
      {/* Head quarters admin panel for managing route approvals, passenger listings and bookings */}
      <AdminHQPanel />
    </div>
  );
};
