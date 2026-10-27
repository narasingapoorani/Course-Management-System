import React, { useEffect, useState, useMemo } from "react";
import Pagination from "./common/Pagination";
import LoadingSpinner from "./common/LoadingSpinner";
import EmptyState from "./common/EmptyState";
import Badge from "./common/Badge";

const BASE_URL = "http://localhost:8080/api/courses";

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [sortBy, setSortBy] = useState("DEFAULT");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const url = activeOnly ? `${BASE_URL}?active=true` : BASE_URL;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }
      const data = await response.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setCourses([]);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    setCurrentPage(1);
  }, [activeOnly]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleLevelChange = (e) => {
    setSelectedLevel(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterToggle = () => {
    setActiveOnly((current) => !current);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("ALL");
    setSelectedLevel("ALL");
    setSortBy("DEFAULT");
    setCurrentPage(1);
  };

  // Filter and sort computation
  const processedCourses = useMemo(() => {
    let result = [...courses];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(term) ||
          c.description?.toLowerCase().includes(term) ||
          c.category?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategory !== "ALL") {
      result = result.filter(
        (c) =>
          c.category &&
          c.category.toUpperCase().includes(selectedCategory.toUpperCase())
      );
    }

    // Level filter
    if (selectedLevel !== "ALL") {
      result = result.filter((c) => {
        const cLevel = (c.level || "").toUpperCase();
        return cLevel === selectedLevel.toUpperCase();
      });
    }

    // Sorting
    switch (sortBy) {
      case "TITLE_ASC":
        result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "TITLE_DESC":
        result.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        break;
      case "PRICE_ASC":
        result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case "PRICE_DESC":
        result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case "DURATION_ASC":
        result.sort((a, b) => (Number(a.duration) || 0) - (Number(b.duration) || 0));
        break;
      case "DURATION_DESC":
        result.sort((a, b) => (Number(b.duration) || 0) - (Number(a.duration) || 0));
        break;
      case "NEWEST":
        result.sort((a, b) => (Number(b.courseId) || 0) - (Number(a.courseId) || 0));
        break;
      case "DEFAULT":
      default:
        break;
    }

    return result;
  }, [courses, searchTerm, selectedCategory, selectedLevel, sortBy]);

  // Paginated items
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedCourses.slice(startIndex, startIndex + pageSize);
  }, [processedCourses, currentPage, pageSize]);

  if (loading) {
    return (
      <div className="catalog-wrapper">
        <LoadingSpinner
          message="Loading courses..."
          subtext="Fetching course catalog"
          dataTestId="loading"
        />
      </div>
    );
  }

  if (error !== "") {
    return (
      <div className="catalog-wrapper">
        <div className="content-card" style={{ textAlign: "center", padding: "2rem" }}>
          <p data-testid="error" className="error" style={{ color: "var(--danger)", fontWeight: 600, marginBottom: "0.5rem" }}>
            {error}
          </p>
          <p className="empty-state-desc">
            Unable to retrieve courses from server. Please try again.
          </p>
          <button
            type="button"
            onClick={fetchCourses}
            className="btn btn-primary btn-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const categoryPills = [
    { label: "All Categories", value: "ALL" },
    { label: "Development", value: "DEVELOPMENT" },
    { label: "Cloud & DevOps", value: "CLOUD" },
    { label: "AI & Data", value: "AI" },
    { label: "Security", value: "SECURITY" },
  ];

  return (
    <div className="catalog-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Available Courses</h2>
          <p className="page-subtitle">
            Browse and enroll in academic and professional courses.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            data-testid="active-filter"
            className={`nav-tab-btn ${activeOnly ? "active" : ""}`}
            onClick={handleFilterToggle}
          >
            {activeOnly ? "Showing Active Courses" : "Show Active Only"}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Toolbar (Reference Style) */}
      <div className="catalog-toolbar">
        {/* Search Input with Clear Button */}
        <div className="search-bar-container">
          <input
            type="text"
            className="search-input-field"
            placeholder="Search by title, syllabus..."
            value={searchTerm}
            onChange={handleSearchChange}
            aria-label="Search courses"
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Dropdown Filter */}
        <div className="filter-dropdown-group">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Categories</option>
            <option value="DEVELOPMENT">Development</option>
            <option value="CLOUD">Cloud & DevOps</option>
            <option value="AI">AI & Data</option>
            <option value="SECURITY">Security</option>
          </select>
        </div>

        {/* Level Dropdown Filter */}
        <div className="filter-dropdown-group">
          <select
            id="levelFilter"
            value={selectedLevel}
            onChange={handleLevelChange}
            className="filter-select"
          >
            <option value="ALL">All Levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>

        {/* Sorting Dropdown */}
        <div className="filter-dropdown-group">
          <select
            id="sortFilter"
            value={sortBy}
            onChange={handleSortChange}
            className="filter-select"
          >
            <option value="DEFAULT">Sort by: Default</option>
            <option value="TITLE_ASC">Title A–Z</option>
            <option value="TITLE_DESC">Title Z–A</option>
            <option value="PRICE_ASC">Price: Low to High</option>
            <option value="PRICE_DESC">Price: High to Low</option>
            <option value="DURATION_ASC">Duration: Shortest</option>
            <option value="DURATION_DESC">Duration: Longest</option>
            <option value="NEWEST">Newest</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleResetFilters}
          className="btn btn-secondary btn-sm"
        >
          Reset
        </button>
      </div>

      {/* Category Pills Bar */}
      <div className="category-pills-bar">
        {categoryPills.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => handleCategoryChange(cat.value)}
            className={`category-pill-btn ${selectedCategory === cat.value ? "active" : ""}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Course List / Grid / Empty States */}
      {courses.length === 0 ? (
        <div className="content-card">
          <EmptyState
            title="No courses available."
            description="The catalog is currently empty."
            dataTestId="empty"
          />
        </div>
      ) : processedCourses.length === 0 ? (
        <div className="content-card">
          <EmptyState
            title="No matching courses found"
            description="Try changing your search terms or filters."
            actionText="Reset Filters"
            onAction={handleResetFilters}
          />
        </div>
      ) : (
        <>
          <div className="course-grid">
            {paginatedCourses.map((course) => (
              <div
                key={course.courseId}
                data-testid={`course-card-${course.courseId}`}
                className="course-card"
              >
                <div>
                  <div className="course-card-header">
                    <h3 className="course-title">{course.title}</h3>
                    <Badge type={course.isActive ? "approved" : "draft"}>
                      {course.isActive ? "Active" : "Draft"}
                    </Badge>
                  </div>

                  <div className="course-category">
                    {course.category || "Computer Science"}
                  </div>

                  <p className="course-desc">
                    {course.description || "Course curriculum and practical learning modules."}
                  </p>

                  {/* Clean 2-column key-value layout (Reference Style) */}
                  <div className="course-meta-grid">
                    <div className="meta-item">
                      <span className="meta-label">Duration</span>
                      <span className="meta-value">{course.duration} hrs</span>
                    </div>

                    <div className="meta-item">
                      <span className="meta-label">Level</span>
                      <span className="meta-value">{course.level || "Beginner"}</span>
                    </div>

                    <div className="meta-item">
                      <span className="meta-label">Seats</span>
                      <span className="meta-value">{course.capacity || 50}</span>
                    </div>

                    <div className="meta-item">
                      <span className="meta-label">Price</span>
                      <span className="meta-value price">${Number(course.price || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="course-card-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ width: "100%" }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalItems={processedCourses.length}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => setPageSize(size)}
            pageSizeOptions={[6, 9, 12, 24]}
            itemLabel="courses"
          />
        </>
      )}
    </div>
  );
}

export default CourseList;