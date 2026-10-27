import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CourseList from "../components/CourseList";

global.fetch = jest.fn();

const mockCourses = [
  {
    courseId: 1,
    title: "Spring Boot Fundamentals",
    description: "Learn the basics of Spring Boot framework",
    duration: 20,
    level: "Beginner",
    price: 99.99,
    isActive: true
  },
  {
    courseId: 2,
    title: "Advanced React Patterns",
    description: "Master advanced React patterns and techniques",
    duration: 15,
    level: "Advanced",
    price: 149.99,
    isActive: true
  },
  {
    courseId: 3,
    title: "Old Course",
    description: "Very old",
    duration: 5,
    level: "Beginner",
    price: 10,
    isActive: false
  }
];

afterEach(() => {
  jest.clearAllMocks();
});

test("State_renders loading then courses and allows filter toggle; handles empty", async () => {
  fetch.mockResolvedValueOnce({ ok:true, json: async () => mockCourses });
  render(<CourseList />);
  expect(screen.getByTestId("loading")).toBeInTheDocument();
  await screen.findByText("Spring Boot Fundamentals");
  expect(screen.getAllByTestId(/course-card/)).toHaveLength(3);
  // Toggle filter to active only
  fetch.mockResolvedValueOnce({ ok: true, json: async () => mockCourses.filter(c=>c.isActive) });
  fireEvent.click(screen.getByTestId("active-filter"));
  await waitFor(() => expect(screen.getAllByTestId(/course-card/)).toHaveLength(2));
  expect(screen.queryByText("Old Course")).not.toBeInTheDocument();
});

test("State_shows empty state if no courses", async () => {
  fetch.mockResolvedValueOnce({ ok:true, json: async () => [] });
  render(<CourseList />);
  await screen.findByTestId("empty");
});

test("State_shows error if fetch fails", async () => {
  fetch.mockRejectedValueOnce(new Error("fetchfail"));
  render(<CourseList />);
  await screen.findByTestId("error");
  expect(screen.getByTestId("error").textContent).toContain("fetchfail");
});
