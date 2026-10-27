import React, { useEffect } from 'react';

const Toast = ({
  type = 'info', // 'success' | 'danger' | 'error' | 'warning' | 'info'
  message = '',
  onClose = null,
  autoClose = 5000,
  dataTestId = 'toast-alert',
  className = ''
}) => {
  useEffect(() => {
    if (autoClose && onClose && message) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, message]);

  if (!message) return null;

  const normalizedType = type === 'error' ? 'danger' : type;

  const getIcon = () => {
    switch (normalizedType) {
      case 'success':
        return '✅';
      case 'danger':
        return '⚠️';
      case 'warning':
        return '⚡';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div
      className={`alert alert-${normalizedType} ${className}`}
      data-testid={dataTestId}
      role="alert"
    >
      <span className="alert-icon">{getIcon()}</span>
      <div className="alert-content">{message}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="modal-close-btn"
          aria-label="Close notification"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Toast;
