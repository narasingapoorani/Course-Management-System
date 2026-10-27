import React from 'react';

const Badge = ({ type = 'default', children, className = '', ...props }) => {
  const getBadgeClass = () => {
    switch (type.toUpperCase()) {
      case 'APPROVED':
      case 'ACTIVE':
      case 'SUCCESS':
      case 'COMPLETED':
        return 'badge-approved';
      case 'PENDING':
      case 'PENDING_APPROVAL':
      case 'WARNING':
        return 'badge-pending';
      case 'REJECTED':
      case 'SUSPENDED':
      case 'DANGER':
        return 'badge-rejected';
      case 'DRAFT':
        return 'badge-draft';
      case 'ENROLLED':
      case 'INFO':
      case 'LECTURE':
        return 'badge-enrolled';
      case 'BEGINNER':
      case 'INTERMEDIATE':
      case 'ADVANCED':
        return 'badge-draft';
      default:
        return 'badge-draft';
    }
  };

  return (
    <span className={`badge ${getBadgeClass()} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
