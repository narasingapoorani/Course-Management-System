import React from 'react';

const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 6,
  onPageChange,
  onPageSizeChange = null,
  pageSizeOptions = [6, 9, 12, 24],
  itemLabel = 'courses',
  className = ''
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems <= 0) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      if (start === 1) {
        end = Math.min(totalPages, maxVisible);
      } else if (end === totalPages) {
        start = Math.max(1, totalPages - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={`pagination-container ${className}`} data-testid="pagination-wrapper">
      {/* Item count text */}
      <div className="pagination-info" data-testid="pagination-info">
        Showing <span className="pagination-highlight">{startItem}</span>–
        <span className="pagination-highlight">{endItem}</span> of{' '}
        <span className="pagination-highlight">{totalItems}</span> {itemLabel}
      </div>

      {/* Controls */}
      <div className="pagination-controls">
        {onPageSizeChange && (
          <div className="pagination-size-select">
            <label htmlFor="pageSizeSelect" style={{ fontSize: '0.8rem', margin: 0, color: 'var(--text-muted)' }}>
              Per page:
            </label>
            <select
              id="pageSizeSelect"
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="pagination-select"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="button"
          data-testid="pagination-prev"
          className="btn btn-secondary btn-sm pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          ← Previous
        </button>

        <div className="pagination-numbers">
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              data-testid={`pagination-page-${p}`}
              className={`pagination-num-btn ${currentPage === p ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
              aria-current={currentPage === p ? 'page' : undefined}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          type="button"
          data-testid="pagination-next"
          className="btn btn-secondary btn-sm pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Pagination;
