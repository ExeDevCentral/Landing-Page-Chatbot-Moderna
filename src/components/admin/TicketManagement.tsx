// src/components/admin/TicketManagement.tsx
import React from 'react';
import TicketManager from '../TicketManager';
import { UserRole, Permission } from '../../../types/user';

interface TicketManagementProps {
  currentUser: {
    role: UserRole;
    permissions: Permission[];
  };
}

const TicketManagement: React.FC<TicketManagementProps> = ({ currentUser }) => {
  return (
    <div className="ticket-management">
      <div className="page-header">
        <h2>Gestión de Tickets</h2>
        <p>Sistema de tickets con manejo robusto de errores</p>
      </div>

      <TicketManager />
    </div>
  );
};

export default TicketManagement;
