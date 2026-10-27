import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CourseForm from "../components/CourseForm";
global.fetch = jest.fn();

afterEach(() => {
  jest.clearAllMocks();
});

test("State_renders form fields and validates required fields", async () => {
  render(<CourseForm />);
  fireEvent.click(screen.getByTestId("submit-btn"));
  await waitFor(() => expect(screen.getByText(/Title is required/)).toBeInTheDocument());
  expect(screen.getByText(/Duration is required/)).toBeInTheDocument();
  expect(screen.getByText(/Level is required/)).toBeInTheDocument();
  expect(screen.getByText(/Price is required/)).toBeInTheDocument();
});

test("State_shows validation errors for constraints", async () => {
  render(<CourseForm />);
  fireEvent.change(screen.getByTestId("title-input"), { target: { value: "x".repeat(101) } });
  fireEvent.change(screen.getByTestId("description-input"), { target: { value: "y".repeat(501) } });
  fireEvent.change(screen.getByTestId("duration-input"), { target: { value: 0 } });
  fireEvent.change(screen.getByTestId("price-input"), { target: { value: -12 } });
  fireEvent.click(screen.getByTestId("submit-btn"));
  await waitFor(() => expect(screen.getByText(/Title must be at most 100 characters/)).toBeInTheDocument());
  expect(screen.getByText(/Description must be at most 500 characters/)).toBeInTheDocument();
  expect(screen.getByText(/Duration must be at least 1/)).toBeInTheDocument();
  expect(screen.getByText(/Price must be non-negative number/)).toBeInTheDocument();
});

test("Axios_submits form and displays success message on success", async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ courseId: 99 }) });
  render(<CourseForm />);
  fireEvent.change(screen.getByTestId("title-input"), { target: { value: "New Course" } });
  fireEvent.change(screen.getByTestId("duration-input"), { target: { value: 10 } });
  fireEvent.change(screen.getByTestId("level-select"), { target: { value: "BEGINEER" } });
  fireEvent.change(screen.getByTestId("price-input"), { target: { value: 100 } });
  fireEvent.click(screen.getByTestId("submit-btn"));
  await waitFor(() => expect(screen.getByTestId("api-success")).toBeInTheDocument());
});

test("State_shows api error on failure", async () => {
  fetch.mockResolvedValueOnce({ ok:false, json: async () => ({ message: "Some error!" }) });
  render(<CourseForm />);
  fireEvent.change(screen.getByTestId("title-input"), { target: { value: "New Course" } });
  fireEvent.change(screen.getByTestId("duration-input"), { target: { value: 10 } });
  fireEvent.change(screen.getByTestId("level-select"), { target: { value: "BEGINEER" } });
  fireEvent.change(screen.getByTestId("price-input"), { target: { value: 50 } });
  fireEvent.click(screen.getByTestId("submit-btn"));
  await waitFor(() => expect(screen.getByTestId("api-error")).toBeInTheDocument());
});

test("Form_reset button clears form", () => {
  render(<CourseForm />);
  fireEvent.change(screen.getByTestId("title-input"), { target: { value: "abc" } });
  fireEvent.change(screen.getByTestId("duration-input"), { target: { value: 7 } });
  fireEvent.click(screen.getByTestId("reset-btn"));
  expect(screen.getByTestId("title-input").value).toBe("");
  expect(screen.getByTestId("duration-input").value).toBe("");
});
