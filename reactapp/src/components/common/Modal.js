import React, { useEffect } from 'react';

const Modal = ({
  isOpen = false,
  title = '',
  onClose,
  children,
  onConfirm = null,
  confirmText = 'Confirm',
  confirmVariant = 'primary', // 'primary' | 'danger' | 'success'
  cancelText = 'Cancel',
  loading = false,
  maxWidth = '540px'
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onClose && !loading) {
      onClose();
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-dialog" style={{ maxWidth }}>
        <div className="modal-header">
          <h3 id="modal-title" className="modal-title">
            {title}
          </h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={loading}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {(onConfirm || onClose) && (
          <div className="modal-footer">
            {onClose && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onClose}
                disabled={loading}
              >
                {cancelText}
              </button>
            )}
            {onConfirm && (
              <button
                type="button"
                className={`btn btn-${confirmVariant} btn-sm`}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? 'Processing...' : confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
