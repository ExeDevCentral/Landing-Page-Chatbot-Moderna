// src/components/admin/UserManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, Permission } from '../../../types/user';

interface UserManagementProps {
  currentUser: {
    role: UserRole;
    permissions: Permission[];
  };
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data.data.users);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = useCallback(async (userData: Partial<User>) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      setUsers(prev => [...prev, data.data.user]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  }, []);

  const handleUpdateUser = useCallback(async (userId: string, userData: Partial<User>) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      setUsers(prev => prev.map(user =>
        user._id === userId ? data.data.user : user
      ));
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }, []);

  const handleToggleUserStatus = useCallback(async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive })
      });
      const data = await response.json();
      setUsers(prev => prev.map(user =>
        user._id === userId ? data.data.user : user
      ));
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  }, []);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return '#dc2626';
      case UserRole.ADMIN:
        return '#ea580c';
      case UserRole.EMPLOYEE:
        return '#2563eb';
      case UserRole.CLIENT:
        return '#16a34a';
      default:
        return '#6b7280';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'Super Admin';
      case UserRole.ADMIN:
        return 'Administrador';
      case UserRole.EMPLOYEE:
        return 'Empleado';
      case UserRole.CLIENT:
        return 'Cliente';
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h2>Gestión de Usuarios</h2>
        <p>Administra usuarios, roles y permisos del sistema</p>
      </div>

      {/* Filters and Actions */}
      <div className="filters-section">
        <div className="filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
          >
            <option value="all">Todos los roles</option>
            <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
            <option value={UserRole.ADMIN}>Administrador</option>
            <option value={UserRole.EMPLOYEE}>Empleado</option>
            <option value={UserRole.CLIENT}>Cliente</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        {currentUser.permissions.includes(Permission.CREATE_USER) && (
          <button
            className="create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <span>➕</span>
            Nuevo Usuario
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Departamento</th>
              <th>Estado</th>
              <th>Último Acceso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>
                    <div className="user-details">
                      <div className="user-name">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span 
                    className="role-badge"
                    style={{ backgroundColor: getRoleBadgeColor(user.role) }}
                  >
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td>
                  {user.profile?.department || '-'}
                </td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Nunca'}
                </td>
                <td>
                  <div className="action-buttons">
                    {currentUser.permissions.includes(Permission.UPDATE_USER) && (
                      <button
                        className="edit-btn"
                        onClick={() => setEditingUser(user)}
                        title="Editar usuario"
                      >
                        ✏️
                      </button>
                    )}
                    {currentUser.permissions.includes(Permission.UPDATE_USER) && (
                      <button
                        className={`toggle-btn ${user.isActive ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                        title={user.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {user.isActive ? '⏸️' : '▶️'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="user-stats">
        <div className="stat-item">
          <span className="stat-label">Total Usuarios:</span>
          <span className="stat-value">{users.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Activos:</span>
          <span className="stat-value">{users.filter(u => u.isActive).length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Administradores:</span>
          <span className="stat-value">{users.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.SUPER_ADMIN).length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Empleados:</span>
          <span className="stat-value">{users.filter(u => u.role === UserRole.EMPLOYEE).length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Clientes:</span>
          <span className="stat-value">{users.filter(u => u.role === UserRole.CLIENT).length}</span>
        </div>
      </div>

      <style>{`
        .user-management {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .page-header {
          text-align: center;
        }

        .page-header h2 {
          margin: 0 0 0.5rem 0;
          color: #374151;
          font-size: 2rem;
          font-weight: 700;
        }

        .page-header p {
          margin: 0;
          color: #6b7280;
          font-size: 1.125rem;
        }

        .filters-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .filters {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .search-box input {
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.875rem;
          min-width: 250px;
        }

        .search-box input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        select {
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.875rem;
          background: white;
        }

        .create-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .create-btn:hover {
          background: #2563eb;
        }

        .users-table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th {
          background: #f9fafb;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }

        .users-table td {
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .user-name {
          font-weight: 600;
          color: #374151;
        }

        .user-email {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .role-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          color: white;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-badge.active {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.inactive {
          background: #fee2e2;
          color: #991b1b;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .edit-btn, .toggle-btn {
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .edit-btn {
          background: #f3f4f6;
          color: #374151;
        }

        .edit-btn:hover {
          background: #e5e7eb;
        }

        .toggle-btn.activate {
          background: #d1fae5;
          color: #065f46;
        }

        .toggle-btn.deactivate {
          background: #fee2e2;
          color: #991b1b;
        }

        .user-stats {
          display: flex;
          gap: 2rem;
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #374151;
        }

        .loading-container {
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
          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }

          .filters {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box input {
            min-width: auto;
          }

          .users-table {
            font-size: 0.875rem;
          }

          .users-table th,
          .users-table td {
            padding: 0.75rem 0.5rem;
          }

          .user-stats {
            flex-wrap: wrap;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
