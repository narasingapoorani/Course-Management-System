import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import "./App.css";
import CourseList from "./components/CourseList";
import CourseForm from "./components/CourseForm";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import TopHeader from "./components/TopHeader";
import Footer from "./components/common/Footer";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AdminDashboard from "./components/AdminDashboard";
import TrainingManagerDashboard from "./components/TrainingManagerDashboard";
import TrainerDashboard from "./components/TrainerDashboard";
import StudentDashboard from "./components/StudentDashboard";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState("list");
  const [activeTab, setActiveTab] = useState("overview");
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sync route pathname with currentView
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path === "/add" || path === "/create-course") {
      setCurrentView("add");
    } else if (path === "/login") {
      setCurrentView("login");
    } else if (path === "/signup") {
      setCurrentView("signup");
    } else if (path === "/dashboard") {
      setCurrentView("dashboard");
    } else if (path === "/" || path === "/courses" || path === "/list") {
      setCurrentView("list");
    }
  }, [location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    let role = localStorage.getItem("role");
    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("userId");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.role) role = payload.role;
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          handleLogout();
          return;
        }
      } catch (e) {
        // Fallback
      }
      setCurrentUser({ token, role, username, userId });
      setCurrentView("dashboard");
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    let role = userData.role;
    if (userData.token) {
      try {
        const payload = JSON.parse(atob(userData.token.split(".")[1]));
        if (payload.role) role = payload.role;
      } catch (e) {
        // Fallback
      }
    }
    const userObj = { ...userData, role };
    setCurrentUser(userObj);
    setCurrentView("dashboard");
    setActiveTab("overview");
    navigate("/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    setCurrentView("list");
    setActiveTab("overview");
    setMobileSidebarOpen(false);
    navigate("/");
  };

  const handleNavigate = (view) => {
    setMobileSidebarOpen(false);
    if (view === "add") {
      if (currentUser) {
        const role = (currentUser?.role || "").toUpperCase().replace("ROLE_", "");
        if (["TRAINER", "TRAINING_MANAGER", "ADMIN"].includes(role)) {
          setCurrentView("dashboard");
          setActiveTab("create-course");
          navigate("/dashboard");
          return;
        }
      }
      setCurrentView("add");
      navigate("/add");
      return;
    }
    setCurrentView(view);
    if (view !== "dashboard") {
      setActiveTab("overview");
    }
    if (view === "list") navigate("/");
    else if (view === "login") navigate("/login");
    else if (view === "signup") navigate("/signup");
    else if (view === "dashboard") navigate("/dashboard");
  };

  const handleSelectTab = (tab) => {
    setMobileSidebarOpen(false);
    setActiveTab(tab);
  };

  const renderDashboard = () => {
    if (!currentUser) {
      return (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onSwitchToSignup={() => {
            setCurrentView("signup");
            navigate("/signup");
          }}
        />
      );
    }
    const normalizedRole = (currentUser.role || "")
      .toUpperCase()
      .replace("ROLE_", "");
    switch (normalizedRole) {
      case "ADMIN":
        return <AdminDashboard defaultTab={activeTab} />;
      case "TRAINING_MANAGER":
        return <TrainingManagerDashboard defaultTab={activeTab} />;
      case "TRAINER":
        return (
          <TrainerDashboard
            defaultTab={activeTab}
            onNavigateToAdd={() => {
              setCurrentView("dashboard");
              setActiveTab("create-course");
              navigate("/dashboard");
            }}
          />
        );
      case "STUDENT":
      default:
        return <StudentDashboard defaultTab={activeTab} />;
    }
  };

  const renderViewContent = () => {
    return (
      <Routes>
        <Route
          path="/"
          element={
            currentView === "add" ? (
              <CourseForm
                onCourseCreated={() => {
                  if (currentUser) {
                    setCurrentView("dashboard");
                    setActiveTab("courses");
                    navigate("/dashboard");
                  } else {
                    setCurrentView("list");
                    navigate("/");
                  }
                }}
                onCancel={() => {
                  if (currentUser) {
                    setCurrentView("dashboard");
                    setActiveTab("courses");
                    navigate("/dashboard");
                  } else {
                    setCurrentView("list");
                    navigate("/");
                  }
                }}
              />
            ) : currentView === "login" ? (
              <Login
                onLoginSuccess={handleLoginSuccess}
                onSwitchToSignup={() => {
                  setCurrentView("signup");
                  navigate("/signup");
                }}
              />
            ) : currentView === "signup" ? (
              <Signup
                onSignupSuccess={() => {
                  setCurrentView("login");
                  navigate("/login");
                }}
                onSwitchToLogin={() => {
                  setCurrentView("login");
                  navigate("/login");
                }}
              />
            ) : currentView === "dashboard" ? (
              renderDashboard()
            ) : (
              <CourseList />
            )
          }
        />
        <Route
          path="/courses"
          element={<CourseList />}
        />
        <Route
          path="/list"
          element={<CourseList />}
        />
        <Route
          path="/add"
          element={
            <CourseForm
              onCourseCreated={() => {
                if (currentUser) {
                  setCurrentView("dashboard");
                  setActiveTab("courses");
                  navigate("/dashboard");
                } else {
                  setCurrentView("list");
                  navigate("/");
                }
              }}
              onCancel={() => {
                if (currentUser) {
                  setCurrentView("dashboard");
                  setActiveTab("courses");
                  navigate("/dashboard");
                } else {
                  setCurrentView("list");
                  navigate("/");
                }
              }}
            />
          }
        />
        <Route
          path="/login"
          element={
            <Login
              onLoginSuccess={handleLoginSuccess}
              onSwitchToSignup={() => {
                setCurrentView("signup");
                navigate("/signup");
              }}
            />
          }
        />
        <Route
          path="/signup"
          element={
            <Signup
              onSignupSuccess={() => {
                setCurrentView("login");
                navigate("/login");
              }}
              onSwitchToLogin={() => {
                setCurrentView("login");
                navigate("/login");
              }}
            />
          }
        />
        <Route
          path="/dashboard"
          element={renderDashboard()}
        />
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    );
  };

  if (currentUser) {
    return (
      <div className="app-shell">
        <Sidebar
          currentUser={currentUser}
          currentView={currentView}
          activeTab={activeTab}
          onNavigate={handleNavigate}
          onSelectTab={handleSelectTab}
          onLogout={handleLogout}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <div className="main-wrapper">
          <TopHeader
            currentUser={currentUser}
            currentView={currentView}
            activeTab={activeTab}
            onNavigate={handleNavigate}
            onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          />

          <main className="page-container">
            {renderViewContent()}
          </main>

          <Footer onNavigate={handleNavigate} currentUser={currentUser} />
        </div>
      </div>
    );
  }

  // Public Guest Layout
  return (
    <div className="app-container">
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onSelectTab={handleSelectTab}
        onLogout={handleLogout}
      />

      <main className="page-container">
        {renderViewContent()}
      </main>

      <Footer onNavigate={handleNavigate} currentUser={currentUser} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;