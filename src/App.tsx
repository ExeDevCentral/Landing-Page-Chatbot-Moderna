// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import TicketManager from './components/TicketManager';
import { UserRole, Permission } from '../types/user';

// Mock user data - replace with actual authentication
export const mockUser = {
  role: UserRole.ADMIN,
  permissions: [
    Permission.CREATE_USER,
    Permission.READ_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.CREATE_PRODUCT,
    Permission.READ_PRODUCT,
    Permission.UPDATE_PRODUCT,
    Permission.DELETE_PRODUCT,
    Permission.CREATE_SALE,
    Permission.READ_SALE,
    Permission.UPDATE_SALE,
    Permission.DELETE_SALE,
    Permission.CREATE_TICKET,
    Permission.READ_TICKET,
    Permission.UPDATE_TICKET,
    Permission.DELETE_TICKET,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_LOGS,
  ],
  fullName: 'Carlos Administrador',
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'admin' | 'tickets'>('admin');

  return (
    <BrowserRouter>
      <div className="app">
        {currentView === 'admin' ? (
          <AdminPanel currentUser={mockUser} />
        ) : (
          <div className="ticket-view">
            <header className="ticket-header">
              <h1>Sistema de Gestión de Tickets</h1>
              <p>Gestión moderna de tickets con manejo robusto de errores</p>
              <button
                className="view-switch-btn"
                onClick={() => setCurrentView('admin')}
              >
                Ir al Panel de Administración
              </button>
            </header>

            <main className="ticket-main">
              <TicketManager />
            </main>

            <footer className="ticket-footer">
              <p>
                &copy; 2024 Sistema de Tickets - Desarrollado con React +
                TypeScript
              </p>
            </footer>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
};

export default App;
