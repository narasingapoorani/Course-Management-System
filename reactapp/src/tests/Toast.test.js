import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Toast from '../components/common/Toast';

describe('Toast Component', () => {
  test('Renders success toast with message and icon', () => {
    render(<Toast type="success" message="Course created successfully!" onClose={jest.fn()} />);

    expect(screen.getByTestId('toast-alert')).toBeInTheDocument();
    expect(screen.getByText('Course created successfully!')).toBeInTheDocument();
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  test('Renders danger toast message correctly', () => {
    render(<Toast type="danger" message="Failed to update server." onClose={jest.fn()} />);

    expect(screen.getByTestId('toast-alert')).toHaveClass('alert-danger');
    expect(screen.getByText('Failed to update server.')).toBeInTheDocument();
  });

  test('Invokes onClose callback when close button is clicked', () => {
    const handleClose = jest.fn();
    render(<Toast type="warning" message="Session expiring soon" onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: /close notification/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('Does not render when message is empty', () => {
    const { container } = render(<Toast type="success" message="" onClose={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
