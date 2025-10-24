// src/components/AdminPanel.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, Permission } from '../../types/user';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ProductCategory } from '../../types/inventory';
import { SaleStatus, PaymentMethod } from '../../types/sales';
import { DashboardStats } from '../../types/dashboard';

// Import components (we'll create these)
import Dashboard from './admin/Dashboard';
import UserManagement from './admin/UserManagement';
import InventoryManagement from './admin/InventoryManagement';
import SalesManagement from './admin/SalesManagement';
import TicketManagement from './admin/TicketManagement';
import Reports from './admin/Reports';
import Settings from './admin/Settings';
import ClientManagement from './admin/ClientManagement';
import ProductManagement from './admin/ProductManagement';

interface AdminPanelProps {
  currentUser: {
    role: UserRole;
    permissions: Permission[];
    fullName: string;
  };
}

type TabType = 'dashboard' | 'users' | 'inventory' | 'sales' | 'tickets' | 'reports' | 'settings' | 'clients' | 'products';

const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser }) => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Define tabs based on user permissions
  const getAvailableTabs = useCallback((): { id: TabType; label: string; icon: string; permission?: Permission }[] => {
    const allTabs = [
      { id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' },
      { id: 'users' as TabType, label: 'Usuarios', icon: '👥', permission: Permission.READ_USER },
      { id: 'clients' as TabType, label: 'Clientes', icon: '🧑‍💼', permission: Permission.READ_USER },
      { id: 'products' as TabType, label: 'Productos', icon: '📦', permission: Permission.READ_PRODUCT },
      { id: 'inventory' as TabType, label: 'Inventario', icon: '📦', permission: Permission.READ_PRODUCT },
      { id: 'sales' as TabType, label: 'Ventas', icon: '💰', permission: Permission.READ_SALE },
      { id: 'tickets' as TabType, label: 'Tickets', icon: '🎫', permission: Permission.READ_TICKET },
      { id: 'reports' as TabType, label: 'Reportes', icon: '📈', permission: Permission.VIEW_REPORTS },
      { id: 'settings' as TabType, label: 'Configuración', icon: '⚙️', permission: Permission.MANAGE_SETTINGS }
    ];

    return allTabs.filter(tab => 
      !tab.permission || currentUser.permissions.includes(tab.permission)
    );
  }, [currentUser.permissions]);

  const availableTabs = getAvailableTabs();

  // Load dashboard stats
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setIsLoading(true);
        // Simulate API call - replace with actual API
        const stats: DashboardStats = {
          totalUsers: 228,
          totalProducts: 1250,
          totalSales: 3420,
          totalRevenue: 125000,
          activeUsers: 198,
          lowStockItems: 23,
          pendingOrders: 15,
          monthlyGrowth: {
            users: 12,
            sales: 8,
            revenue: 15
          }
        };
        setDashboardStats(stats);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardStats();
  }, []);


  return (
    <div className="admin-panel">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <h1>Sistema de Gestión Empresarial</h1>
          <div className="user-info">
            <span className="user-name">{currentUser.fullName}</span>
            <span className="user-role">{currentUser.role.replace('_', ' ').toUpperCase()}</span>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="admin-nav">
        <div className="nav-tabs">
          {availableTabs.map(tab => (
            <Link
              key={tab.id}
              to={`/${tab.id}`}
              className={`nav-tab`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="admin-main">
        <div className="content-wrapper">
          <Routes>
            <Route path="/dashboard" element={<Dashboard stats={dashboardStats} isLoading={isLoading} />} />
            <Route path="/users" element={<UserManagement currentUser={currentUser} />} />
            <Route path="/clients" element={<ClientManagement />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/inventory" element={<InventoryManagement currentUser={currentUser} />} />
            <Route path="/sales" element={<SalesManagement currentUser={currentUser} />} />
            <Route path="/tickets" element={<TicketManagement currentUser={currentUser} />} />
            <Route path="/reports" element={<Reports currentUser={currentUser} />} />
            <Route path="/settings" element={<Settings currentUser={currentUser} />} />
          </Routes>
        </div>
      </main>

      <style>{`
        .admin-panel {
          min-height: 100vh;
          background-color: #f8fafc;
          display: flex;
          flex-direction: column;
        }

        .admin-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem 2rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .admin-header h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .user-name {
          font-weight: 600;
          font-size: 1rem;
        }

        .user-role {
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .admin-nav {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 0 2rem;
        }

        .nav-tabs {
          display: flex;
          gap: 0.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .nav-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          border: none;
          background: none;
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s ease;
        }

        .nav-tab:hover {
          color: #374151;
          background-color: #f9fafb;
        }

        .nav-tab.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
          background-color: #f0f9ff;
        }

        .tab-icon {
          font-size: 1.125rem;
        }

        .tab-label {
          white-space: nowrap;
        }

        .admin-main {
          flex: 1;
          padding: 2rem;
        }

        .content-wrapper {
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .admin-header {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .user-info {
            align-items: center;
          }

          .admin-nav {
            padding: 0 1rem;
            overflow-x: auto;
          }

          .nav-tabs {
            min-width: max-content;
          }

          .admin-main {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
