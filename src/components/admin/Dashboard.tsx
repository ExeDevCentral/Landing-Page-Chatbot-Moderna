// src/components/admin/Dashboard.tsx
import React from 'react';
import { DashboardStats } from '../../../types/dashboard';

interface DashboardProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-error">
        <p>Error al cargar las estadísticas</p>
      </div>
    );
  }

  const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string; change?: number }> = 
    ({ title, value, icon, color, change }) => (
      <div className="stat-card">
        <div className="stat-icon" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div className="stat-content">
          <h3 className="stat-title">{title}</h3>
          <p className="stat-value">{value}</p>
          {change !== undefined && (
            <p className={`stat-change ${change >= 0 ? 'positive' : 'negative'}`}>
              {change >= 0 ? '+' : ''}{change}% vs mes anterior
            </p>
          )}
        </div>
      </div>
    );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard Principal</h2>
        <p>Resumen general del sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Usuarios"
          value={stats.totalUsers}
          icon="👥"
          color="#3b82f6"
          change={stats.monthlyGrowth.users}
        />
        <StatCard
          title="Productos"
          value={stats.totalProducts}
          icon="📦"
          color="#10b981"
        />
        <StatCard
          title="Ventas Totales"
          value={stats.totalSales}
          icon="💰"
          color="#f59e0b"
          change={stats.monthlyGrowth.sales}
        />
        <StatCard
          title="Ingresos"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon="💵"
          color="#8b5cf6"
          change={stats.monthlyGrowth.revenue}
        />
        <StatCard
          title="Usuarios Activos"
          value={stats.activeUsers}
          icon="✅"
          color="#06b6d4"
        />
        <StatCard
          title="Stock Bajo"
          value={stats.lowStockItems}
          icon="⚠️"
          color="#ef4444"
        />
        <StatCard
          title="Órdenes Pendientes"
          value={stats.pendingOrders}
          icon="⏳"
          color="#f97316"
        />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Acciones Rápidas</h3>
        <div className="actions-grid">
          <button className="action-btn">
            <span className="action-icon">➕</span>
            <span>Nuevo Producto</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">👤</span>
            <span>Nuevo Usuario</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">💰</span>
            <span>Nueva Venta</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📊</span>
            <span>Ver Reportes</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>Actividad Reciente</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">🛒</div>
            <div className="activity-content">
              <p>Nueva venta realizada por Juan Pérez</p>
              <span className="activity-time">Hace 5 minutos</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">📦</div>
            <div className="activity-content">
              <p>Producto "Camiseta Azul" actualizado</p>
              <span className="activity-time">Hace 15 minutos</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">👥</div>
            <div className="activity-content">
              <p>Nuevo usuario registrado: María García</p>
              <span className="activity-time">Hace 1 hora</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 1rem;
        }

        .dashboard-header h2 {
          margin: 0 0 0.5rem 0;
          color: #374151;
          font-size: 2rem;
          font-weight: 700;
        }

        .dashboard-header p {
          margin: 0;
          color: #6b7280;
          font-size: 1.125rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
        }

        .stat-content {
          flex: 1;
        }

        .stat-title {
          margin: 0 0 0.25rem 0;
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .stat-value {
          margin: 0 0 0.25rem 0;
          color: #374151;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .stat-change {
          margin: 0;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .stat-change.positive {
          color: #10b981;
        }

        .stat-change.negative {
          color: #ef4444;
        }

        .quick-actions {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .quick-actions h3 {
          margin: 0 0 1rem 0;
          color: #374151;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          color: #374151;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          border-color: #3b82f6;
          background-color: #f0f9ff;
          color: #3b82f6;
        }

        .action-icon {
          font-size: 1.25rem;
        }

        .recent-activity {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .recent-activity h3 {
          margin: 0 0 1rem 0;
          color: #374151;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          border-radius: 8px;
          background-color: #f9fafb;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background-color: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .activity-content {
          flex: 1;
        }

        .activity-content p {
          margin: 0 0 0.25rem 0;
          color: #374151;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .activity-time {
          color: #6b7280;
          font-size: 0.75rem;
        }

        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          color: #6b7280;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
