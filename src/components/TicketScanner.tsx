// src/components/TicketScanner.tsx
import React, { useState, useCallback, useRef } from 'react';
import { Ticket } from '../../types/ticket';
import { ticketService } from '../../services/ticketService';
import { errorHandler } from '../../utils/errorHandler';

interface TicketScannerProps {
  onTicketFound?: (ticket: Ticket) => void;
  onError?: (error: string) => void;
}

const TicketScanner: React.FC<TicketScannerProps> = ({ onTicketFound, onError }) => {
  const [scannedId, setScannedId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle manual ID input
  const handleManualInput = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scannedId.trim() || isScanning) return;

    try {
      setIsScanning(true);
      setScanError(null);

      const ticket = await ticketService.getTicketByIdWithRetry(scannedId.trim());
      
      onTicketFound?.(ticket);
      setScannedId(''); // Clear input after successful scan
      
    } catch (error) {
      const frontendError = errorHandler.handleNetworkError(error as Error);
      const userMessage = errorHandler.formatUserError(frontendError);
      
      setScanError(userMessage);
      onError?.(userMessage);
      console.error('Ticket scan error:', error);
    } finally {
      setIsScanning(false);
    }
  }, [scannedId, isScanning, onTicketFound, onError]);

  // Handle QR code scanning (simulated)
  const handleQRScan = useCallback(async (qrData: string) => {
    if (!qrData.trim() || isScanning) return;

    try {
      setIsScanning(true);
      setScanError(null);

      // Extract ticket ID from QR data
      const ticketId = qrData.trim();
      
      const ticket = await ticketService.getTicketByIdWithRetry(ticketId);
      
      onTicketFound?.(ticket);
      
    } catch (error) {
      const frontendError = errorHandler.handleNetworkError(error as Error);
      const userMessage = errorHandler.formatUserError(frontendError);
      
      setScanError(userMessage);
      onError?.(userMessage);
      console.error('QR scan error:', error);
    } finally {
      setIsScanning(false);
    }
  }, [isScanning, onTicketFound, onError]);

  // Simulate QR scanner (for demo purposes)
  const simulateQRScan = useCallback(() => {
    const mockTicketId = '507f1f77bcf86cd799439011'; // Mock MongoDB ObjectId
    handleQRScan(mockTicketId);
  }, [handleQRScan]);

  return (
    <div className="ticket-scanner-container">
      <h2>Escanear Ticket</h2>
      
      <div className="scanner-section">
        <div className="qr-scanner">
          <div className="scanner-placeholder">
            <div className="scanner-icon">📱</div>
            <p>Posiciona el código QR del ticket aquí</p>
            <button 
              onClick={simulateQRScan}
              disabled={isScanning}
              className="simulate-btn"
            >
              {isScanning ? 'Escaneando...' : 'Simular Escaneo'}
            </button>
          </div>
        </div>

        <div className="divider">
          <span>O</span>
        </div>

        <form onSubmit={handleManualInput} className="manual-input-form">
          <div className="form-group">
            <label htmlFor="ticket-id">ID del Ticket</label>
            <input
              ref={inputRef}
              type="text"
              id="ticket-id"
              value={scannedId}
              onChange={(e) => setScannedId(e.target.value)}
              placeholder="Ingresa el ID del ticket..."
              disabled={isScanning}
              className={scanError ? 'error' : ''}
            />
            {scanError && <div className="error-message">{scanError}</div>}
          </div>
          
          <button
            type="submit"
            disabled={!scannedId.trim() || isScanning}
            className="scan-btn"
          >
            {isScanning ? 'Buscando...' : 'Buscar Ticket'}
          </button>
        </form>
      </div>

      <style>{`
        .ticket-scanner-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .ticket-scanner-container h2 {
          text-align: center;
          margin-bottom: 2rem;
          color: #333;
        }

        .scanner-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .qr-scanner {
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          background-color: #f9fafb;
        }

        .scanner-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .scanner-icon {
          font-size: 3rem;
          opacity: 0.7;
        }

        .scanner-placeholder p {
          color: #6b7280;
          margin: 0;
        }

        .simulate-btn {
          background-color: #10b981;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .simulate-btn:hover:not(:disabled) {
          background-color: #059669;
        }

        .simulate-btn:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        .divider {
          position: relative;
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background-color: #e5e7eb;
        }

        .divider span {
          background-color: white;
          padding: 0 1rem;
        }

        .manual-input-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }

        .form-group input {
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-group input.error {
          border-color: #ef4444;
          background-color: #fef2f2;
        }

        .form-group input:disabled {
          background-color: #f9fafb;
          cursor: not-allowed;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .scan-btn {
          background-color: #3b82f6;
          color: white;
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .scan-btn:hover:not(:disabled) {
          background-color: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
        }

        .scan-btn:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        @media (max-width: 640px) {
          .ticket-scanner-container {
            margin: 1rem;
            padding: 1.5rem;
          }
          
          .qr-scanner {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TicketScanner;
