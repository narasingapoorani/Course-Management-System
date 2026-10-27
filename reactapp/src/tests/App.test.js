import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

// Mock child components
jest.mock('../components/CourseList', () => () => <div data-testid="course-list">Course List</div>);
jest.mock('../components/CourseForm', () => () => <div data-testid="course-form">Course Form</div>);

describe('App Component', () => {
  test('State_renders App with header and default view', () => {
    render(<App />);

    // Title
    expect(screen.getByText(/Course Management System/i)).toBeInTheDocument();

    // Navigation buttons
    expect(screen.getByTestId('nav-list')).toBeInTheDocument();
    expect(screen.getByTestId('nav-add')).toBeInTheDocument();

    // Should default to "View Courses"
    expect(screen.getByTestId('course-list')).toBeInTheDocument();
    expect(screen.queryByTestId('course-form')).not.toBeInTheDocument();
  });

  test('Routes_navigates to Add Course view when "Add Course" is clicked', () => {
    render(<App />);

    const addButton = screen.getByTestId('nav-add');
    fireEvent.click(addButton);

    // Should show CourseForm
    expect(screen.getByTestId('course-form')).toBeInTheDocument();
    expect(screen.queryByTestId('course-list')).not.toBeInTheDocument();
  });

  test('Routes_navigates back to Course List view when "View Courses" is clicked', () => {
    render(<App />);

    // Go to Add Course first
    fireEvent.click(screen.getByTestId('nav-add'));
    expect(screen.getByTestId('course-form')).toBeInTheDocument();

    // Now click back to view list
    fireEvent.click(screen.getByTestId('nav-list'));
    expect(screen.getByTestId('course-list')).toBeInTheDocument();
  });
});
