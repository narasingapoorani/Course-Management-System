import React, { useState } from "react";

const CourseForm = ({ onCourseCreated, onCancel }) => {
  const initialForm = {
    title: "",
    description: "",
    duration: "",
    level: "",
    price: "",
    category: "Software Development",
    capacity: 50,
    startDate: "",
    endDate: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setSuccess("");
    setApiError("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be at most 100 characters";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be at most 500 characters";
    }

    if (formData.duration === "") {
      newErrors.duration = "Duration is required";
    } else if (Number(formData.duration) < 1) {
      newErrors.duration = "Duration must be at least 1";
    }

    if (!formData.level) {
      newErrors.level = "Level is required";
    }

    if (formData.price === "") {
      newErrors.price = "Price is required";
    } else if (Number(formData.price) < 0) {
      newErrors.price = "Price must be non-negative number";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");
    setApiError("");

    if (!validate()) {
      return;
    }

    setLoading(true);

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");

    const courseData = {
      title: formData.title,
      description: formData.description,
      duration: Number(formData.duration),
      level: formData.level,
      price: Number(formData.price),
      capacity: formData.capacity ? Number(formData.capacity) : 50,
      category: formData.category || "Software Development",
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      status: "DRAFT",
      isActive: true,
      trainerId: userId ? Number(userId) : null,
      trainerName: username || null,
    };

    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch("http://localhost:8080/api/courses", {
        method: "POST",
        headers,
        body: JSON.stringify(courseData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create course");
      }

      setSuccess("Course created successfully");
      setFormData(initialForm);
      setErrors({});

      if (onCourseCreated) {
        onCourseCreated(data);
      }
    } catch (error) {
      setApiError(error.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialForm);
    setErrors({});
    setSuccess("");
    setApiError("");
  };

  return (
    <div className="form-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Add New Course</h2>
          <p className="page-subtitle">Fill in the course details below to publish to the catalog.</p>
        </div>
      </div>

      {/* Success alert */}
      {success && (
        <div className="alert alert-success" data-testid="api-success">
          <span>{success}</span>
        </div>
      )}

      {/* Error alert */}
      {apiError && (
        <div className="alert alert-danger" data-testid="api-error">
          <span>{apiError}</span>
        </div>
      )}

      {/* Form Card (Page 2 Reference Layout) */}
      <div className="form-card" style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">
              Course Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Fullstack Spring Boot & React"
              data-testid="title-input"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>{errors.title}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Course Description</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              placeholder="Enter course description..."
              data-testid="description-input"
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>{errors.description}</p>}
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Software Development">Software Development</option>
                <option value="Cloud Architecture & DevOps">Cloud Architecture & DevOps</option>
                <option value="Data Science & Artificial Intelligence">Data Science & AI</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="level">
                Skill Level *
              </label>
              <select
                id="level"
                name="level"
                data-testid="level-select"
                value={formData.level}
                onChange={handleChange}
              >
                <option value="">Select Level</option>
                <option value="BEGINEER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
              {errors.level && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>{errors.level}</p>}
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label htmlFor="duration">
                Duration (Hours) *
              </label>
              <input
                id="duration"
                name="duration"
                type="number"
                placeholder="e.g. 40"
                data-testid="duration-input"
                value={formData.duration}
                onChange={handleChange}
              />
              {errors.duration && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>{errors.duration}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="price">
                Price ($ USD) *
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                placeholder="e.g. 199.99"
                data-testid="price-input"
                value={formData.price}
                onChange={handleChange}
              />
              {errors.price && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>{errors.price}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="capacity">Seats</label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                placeholder="e.g. 50"
                value={formData.capacity}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Action Bar (Reference Style) */}
          <div className="form-actions-bar">
            {onCancel && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}

            <button
              type="button"
              data-testid="reset-btn"
              className="btn btn-secondary"
              onClick={handleReset}
            >
              Reset
            </button>

            <button
              type="submit"
              data-testid="submit-btn"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : 'Save Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;