import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Footer from '../components/common/Footer';

describe('Footer Component', () => {
  test('Renders footer with brand title and copyright', () => {
    render(<Footer />);

    expect(screen.getByTestId('app-footer')).toBeInTheDocument();
    expect(screen.getByTestId('footer-brand-title')).toHaveTextContent(/Academic Learning Portal/i);
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });

  test('Invokes onNavigate callback when footer platform links are clicked', () => {
    const mockNavigate = jest.fn();
    render(<Footer onNavigate={mockNavigate} currentUser={null} />);

    const catalogBtn = screen.getByRole('button', { name: /Course Catalog/i });
    fireEvent.click(catalogBtn);
    expect(mockNavigate).toHaveBeenCalledWith('list');

    const signInBtn = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(signInBtn);
    expect(mockNavigate).toHaveBeenCalledWith('login');
  });

  test('Shows My Dashboard link in footer when user is logged in', () => {
    const mockNavigate = jest.fn();
    render(<Footer onNavigate={mockNavigate} currentUser={{ username: 'john', role: 'STUDENT' }} />);

    const dashboardBtn = screen.getByRole('button', { name: /My Dashboard/i });
    fireEvent.click(dashboardBtn);
    expect(mockNavigate).toHaveBeenCalledWith('dashboard');
  });
});
