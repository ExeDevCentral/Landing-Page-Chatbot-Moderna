// src/components/admin/Settings.tsx
import React from 'react';
import { UserRole, Permission } from '../../../types/user';

interface SettingsProps {
  currentUser: {
    role: UserRole;
    permissions: Permission[];
  };
}

const Settings: React.FC<SettingsProps> = ({ currentUser }) => {
  return (
    <div className="settings">
      <div className="page-header">
        <h2>Configuración del Sistema</h2>
        <p>Configura parámetros y ajustes del sistema</p>
      </div>

      <div className="coming-soon">
        <div className="coming-soon-icon">⚙️</div>
        <h3>Módulo de Configuración</h3>
        <p>Próximamente: Configuración completa del sistema</p>
        
        <div className="features-preview">
          <div className="feature-item">
            <span className="feature-icon">🏢</span>
            <span>Configuración Empresa</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔐</span>
            <span>Seguridad</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📧</span>
            <span>Notificaciones</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔧</span>
            <span>Mantenimiento</span>
          </div>
        </div>
      </div>

      <style>{`
        .settings {
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

        .coming-soon {
          background: white;
          border-radius: 12px;
          padding: 3rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .coming-soon-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .coming-soon h3 {
          margin: 0 0 1rem 0;
          color: #374151;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .coming-soon p {
          margin: 0 0 2rem 0;
          color: #6b7280;
          font-size: 1.125rem;
        }

        .features-preview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .feature-icon {
          font-size: 1.25rem;
        }
      `}</style>
    </div>
  );
};

export default Settings;
