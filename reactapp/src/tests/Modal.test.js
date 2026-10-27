import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../components/common/Modal';

describe('Modal Component', () => {
  test('Renders modal with title, content, and action buttons when isOpen is true', () => {
    const handleClose = jest.fn();
    const handleConfirm = jest.fn();

    render(
      <Modal
        isOpen={true}
        title="Delete Course?"
        onClose={handleClose}
        onConfirm={handleConfirm}
        confirmText="Delete"
        confirmVariant="danger"
      >
        <p>Are you sure you want to delete this item?</p>
      </Modal>
    );

    expect(screen.getByText('Delete Course?')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this item?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  test('Triggers onConfirm when confirm button is clicked', () => {
    const handleConfirm = jest.fn();

    render(
      <Modal
        isOpen={true}
        title="Confirmation"
        onConfirm={handleConfirm}
        confirmText="Proceed"
      >
        <p>Confirm action?</p>
      </Modal>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Proceed' }));
    expect(handleConfirm).toHaveBeenCalled();
  });

  test('Does not render when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} title="Hidden Modal">
        <p>Hidden content</p>
      </Modal>
    );

    expect(container).toBeEmptyDOMElement();
  });
});
