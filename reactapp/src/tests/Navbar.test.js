import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../components/Navbar';

describe('Navbar Component', () => {
  test('Renders public navigation links when no user is logged in', () => {
    const mockNavigate = jest.fn();
    render(<Navbar currentView="list" onNavigate={mockNavigate} currentUser={null} onLogout={jest.fn()} />);

    expect(screen.getByTestId('nav-list')).toBeInTheDocument();
    expect(screen.getByTestId('nav-add')).toBeInTheDocument();
    expect(screen.getByTestId('nav-login')).toBeInTheDocument();
    expect(screen.getByTestId('nav-signup')).toBeInTheDocument();
  });

  test('Renders authenticated navigation links and logout button when user is logged in', () => {
    const mockLogout = jest.fn();
    const mockNavigate = jest.fn();
    const currentUser = { username: 'alex', role: 'STUDENT' };

    render(<Navbar currentView="dashboard" onNavigate={mockNavigate} currentUser={currentUser} onLogout={mockLogout} />);

    expect(screen.getByTestId('nav-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('nav-logout')).toBeInTheDocument();
    expect(screen.getByText('alex')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('nav-logout'));
    expect(mockLogout).toHaveBeenCalled();
  });

  test('Toggles mobile drawer when hamburger button is clicked', () => {
    render(<Navbar currentView="list" onNavigate={jest.fn()} currentUser={null} onLogout={jest.fn()} />);

    const hamburgerBtn = screen.getByRole('button', { name: /Toggle navigation menu/i });
    expect(hamburgerBtn).toBeInTheDocument();

    fireEvent.click(hamburgerBtn);
    expect(screen.getByTestId('mobile-nav-list')).toBeInTheDocument();

    fireEvent.click(hamburgerBtn);
    expect(screen.queryByTestId('mobile-nav-list')).not.toBeInTheDocument();
  });
});
