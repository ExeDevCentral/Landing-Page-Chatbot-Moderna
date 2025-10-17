// src/components/TicketManager.tsx
import React, { useState, useCallback } from 'react';
import TicketForm from './TicketForm';
import TicketScanner from './TicketScanner';
import { Ticket } from '../../types/ticket';

interface TicketManagerProps {
  className?: string;
}

const TicketManager: React.FC<TicketManagerProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'scan'>('create');
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Handle successful ticket creation
  const handleTicketCreated = useCallback((ticket: Ticket) => {
    setCurrentTicket(ticket);
    setNotification({
      type: 'success',
      message: `Ticket #${ticket.orderNumber} creado exitosamente para mesa ${ticket.table}`,
    });
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // Handle successful ticket scan
  const handleTicketScanned = useCallback((ticket: Ticket) => {
    setCurrentTicket(ticket);
    setNotification({
      type: 'success',
      message: `Ticket #${ticket.orderNumber} encontrado para mesa ${ticket.table}`,
    });
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // Handle errors
  const handleError = useCallback((error: string) => {
    setNotification({
      type: 'error',
      message: error,
    });
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // Clear current ticket
  const clearCurrentTicket = useCallback(() => {
    setCurrentTicket(null);
  }, []);

  return (
    <div className={`ticket-manager ${className || ''}`}>
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="close-btn">
            ×
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Crear Ticket
        </button>
        <button
          className={`tab-btn ${activeTab === 'scan' ? 'active' : ''}`}
          onClick={() => setActiveTab('scan')}
        >
          Escanear Ticket
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'create' && (
          <TicketForm
            onSuccess={handleTicketCreated}
            onError={handleError}
          />
        )}
        
        {activeTab === 'scan' && (
          <TicketScanner
            onTicketFound={handleTicketScanned}
            onError={handleError}
          />
        )}
      </div>

      {/* Current Ticket Display */}
      {currentTicket && (
        <div className="current-ticket">
          <div className="ticket-header">
            <h3>Ticket Actual</h3>
            <button onClick={clearCurrentTicket} className="clear-btn">
              Limpiar
            </button>
          </div>
          
          <div className="ticket-details">
            <div className="detail-row">
              <span className="label">Número de Orden:</span>
              <span className="value">#{currentTicket.orderNumber}</span>
            </div>
            <div className="detail-row">
              <span className="label">Mesa:</span>
              <span className="value">{currentTicket.table}</span>
            </div>
            <div className="detail-row">
              <span className="label">Mesero:</span>
              <span className="value">{currentTicket.waiter}</span>
            </div>
            <div className="detail-row">
              <span className="label">Menú:</span>
              <span className="value">{currentTicket.menu}</span>
            </div>
            <div className="detail-row">
              <span className="label">Fecha:</span>
              <span className="value">
                {new Date(currentTicket.createdAt).toLocaleDateString('es-ES')}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Hora:</span>
              <span className="value">
                {new Date(currentTicket.createdAt).toLocaleTimeString('es-ES')}
              </span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ticket-manager {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background: #f8fafc;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .notification {
          position: fixed;
          top: 2rem;
          right: 2rem;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 1rem;
          z-index: 1000;
          animation: slideIn 0.3s ease-out;
        }

        .notification.success {
          background-color: #10b981;
        }

        .notification.error {
          background-color: #ef4444;
        }

        .notification .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .tab-navigation {
          display: flex;
          margin-bottom: 2rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .tab-btn {
          flex: 1;
          padding: 1rem 2rem;
          border: none;
          background: none;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          color: #6b7280;
          border-bottom: 3px solid transparent;
          transition: all 0.2s ease;
        }

        .tab-btn:hover {
          color: #374151;
          background-color: #f3f4f6;
        }

        .tab-btn.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
          background-color: white;
        }

        .tab-content {
          background: white;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .current-ticket {
          margin-top: 2rem;
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #10b981;
        }

        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .ticket-header h3 {
          margin: 0;
          color: #374151;
        }

        .clear-btn {
          background-color: #ef4444;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .clear-btn:hover {
          background-color: #dc2626;
        }

        .ticket-details {
          display: grid;
          gap: 0.75rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-row .label {
          font-weight: 600;
          color: #6b7280;
        }

        .detail-row .value {
          color: #374151;
          text-align: right;
          max-width: 60%;
          word-break: break-word;
        }

        @media (max-width: 768px) {
          .ticket-manager {
            margin: 1rem;
            padding: 1rem;
          }

          .notification {
            top: 1rem;
            right: 1rem;
            left: 1rem;
          }

          .tab-content {
            padding: 1rem;
          }

          .current-ticket {
            padding: 1rem;
          }

          .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }

          .detail-row .value {
            max-width: 100%;
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default TicketManager;
