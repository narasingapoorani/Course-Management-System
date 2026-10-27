import React from 'react';

const EmptyState = ({
  icon = '📚',
  title = 'No records found',
  description = 'There are currently no items matching your criteria.',
  actionText = '',
  onAction = null,
  dataTestId = 'empty',
  className = ''
}) => {
  return (
    <div className={`empty-state-wrapper ${className}`} data-testid={dataTestId}>
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn btn-primary btn-sm"
          style={{ marginTop: '0.5rem' }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
