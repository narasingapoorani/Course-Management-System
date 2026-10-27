import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from '../components/common/EmptyState';

describe('EmptyState Component', () => {
  test('Renders empty state with icon, title, and description', () => {
    render(
      <EmptyState
        icon="🔍"
        title="No courses found"
        description="Try adjusting your search criteria."
      />
    );

    expect(screen.getByTestId('empty')).toBeInTheDocument();
    expect(screen.getByText('🔍')).toBeInTheDocument();
    expect(screen.getByText('No courses found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search criteria.')).toBeInTheDocument();
  });

  test('Renders action button and triggers onAction callback when clicked', () => {
    const handleAction = jest.fn();
    render(
      <EmptyState
        title="Empty Catalog"
        actionText="+ Create First Course"
        onAction={handleAction}
      />
    );

    const actionBtn = screen.getByRole('button', { name: '+ Create First Course' });
    expect(actionBtn).toBeInTheDocument();
    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
