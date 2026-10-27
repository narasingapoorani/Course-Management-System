import React from 'react';
import { render, screen } from '@testing-library/react';
import Badge from '../components/common/Badge';

describe('Badge Component', () => {
  test('Renders badge with correct children text and approved style class', () => {
    render(<Badge type="approved">Active</Badge>);
    const badge = screen.getByText('Active');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge-approved');
  });

  test('Renders pending, rejected, and enrolled badge variants correctly', () => {
    const { rerender } = render(<Badge type="pending">Pending QA</Badge>);
    expect(screen.getByText('Pending QA')).toHaveClass('badge-pending');

    rerender(<Badge type="rejected">Rejected</Badge>);
    expect(screen.getByText('Rejected')).toHaveClass('badge-rejected');

    rerender(<Badge type="enrolled">Enrolled</Badge>);
    expect(screen.getByText('Enrolled')).toHaveClass('badge-enrolled');
  });

  test('Renders draft and level badges properly', () => {
    const { rerender } = render(<Badge type="draft">Draft Syllabus</Badge>);
    expect(screen.getByText('Draft Syllabus')).toHaveClass('badge-draft');

    rerender(<Badge type="beginner">Beginner</Badge>);
    expect(screen.getByText('Beginner')).toHaveClass('badge-draft');
  });
});
