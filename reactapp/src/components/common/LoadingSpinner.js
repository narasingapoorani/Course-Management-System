import React from 'react';

const LoadingSpinner = ({
  message = 'Loading...',
  subtext = 'Fetching latest data from server',
  fullPage = false,
  dataTestId = 'loading',
  variant = 'spinner' // 'spinner' | 'skeleton-cards' | 'skeleton-table'
}) => {
  if (variant === 'skeleton-cards') {
    return (
      <div className="course-grid" data-testid={dataTestId}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="course-card skeleton-card">
            <div className="skeleton-line skeleton-badge" />
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-text" />
            <div className="skeleton-line skeleton-text" style={{ width: '80%' }} />
            <div className="skeleton-line skeleton-footer" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'skeleton-table') {
    return (
      <div className="table-responsive" data-testid={dataTestId}>
        <div className="skeleton-table">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="skeleton-table-row">
              <div className="skeleton-line" style={{ width: '30%', height: '18px' }} />
              <div className="skeleton-line" style={{ width: '20%', height: '18px' }} />
              <div className="skeleton-line" style={{ width: '15%', height: '18px' }} />
              <div className="skeleton-line" style={{ width: '20%', height: '18px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`loading-container ${fullPage ? 'loading-fullpage' : ''}`}
      data-testid={dataTestId}
    >
      <div className="loading-spinner-circle" />
      <div className="loading-message">{message}</div>
      {subtext && <div className="loading-subtext">{subtext}</div>}
    </div>
  );
};

export default LoadingSpinner;
