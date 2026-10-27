import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../components/common/Pagination';

describe('Pagination Component', () => {
  test('Renders pagination info with correct range and total count', () => {
    render(
      <Pagination
        currentPage={1}
        totalItems={25}
        pageSize={6}
        onPageChange={jest.fn()}
      />
    );

    expect(screen.getByTestId('pagination-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-info')).toHaveTextContent(/Showing 1–6 of 25 courses/i);
  });

  test('Disables Previous button on first page and enables Next button', () => {
    const handlePageChange = jest.fn();
    render(
      <Pagination
        currentPage={1}
        totalItems={20}
        pageSize={5}
        onPageChange={handlePageChange}
      />
    );

    const prevBtn = screen.getByTestId('pagination-prev');
    const nextBtn = screen.getByTestId('pagination-next');

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    fireEvent.click(nextBtn);
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  test('Disables Next button on last page and enables Previous button', () => {
    const handlePageChange = jest.fn();
    render(
      <Pagination
        currentPage={4}
        totalItems={20}
        pageSize={5}
        onPageChange={handlePageChange}
      />
    );

    const prevBtn = screen.getByTestId('pagination-prev');
    const nextBtn = screen.getByTestId('pagination-next');

    expect(nextBtn).toBeDisabled();
    expect(prevBtn).not.toBeDisabled();

    fireEvent.click(prevBtn);
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  test('Changes page when specific page number button is clicked', () => {
    const handlePageChange = jest.fn();
    render(
      <Pagination
        currentPage={1}
        totalItems={30}
        pageSize={6}
        onPageChange={handlePageChange}
      />
    );

    const page3Btn = screen.getByTestId('pagination-page-3');
    fireEvent.click(page3Btn);
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  test('Does not render pagination when totalItems is 0', () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalItems={0}
        pageSize={6}
        onPageChange={jest.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
