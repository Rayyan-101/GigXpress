import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./components/Home";
import React from "react";
import OrganizerDashboard from "./components/Organizer";
import WorkerDashboard from "./components/Volunteer";
import CompleteRegistrationFlow from "./components/CompleteRegistrationFlow";
import AdminDashboard from "./components/AdminDashboard";
import Login from "./components/Login";
import KYCPage from "./components/Kycpage";
import ProfilePage from "./components/ProfilePage";

// 🔥 UPDATED ProtectedRoute (cookie-based)
const ProtectedRoute = ({ element, allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include", // 🔥 send cookies
        });

        const data = await res.json();

        if (data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ⏳ loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // 🔐 not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return element;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<CompleteRegistrationFlow />} />
        <Route path="/login" element={<Login />} />

        {/* 🔐 Protected routes */}
        <Route
          path="/organizer"
          element={
            <ProtectedRoute
              element={<OrganizerDashboard />}
              allowedRoles={["organizer"]}
            />
          }
        />

        <Route
          path="/volunteer"
          element={
            <ProtectedRoute
              element={<WorkerDashboard />}
              allowedRoles={["worker"]}
            />
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute
              element={<AdminDashboard />}
              allowedRoles={["admin"]}
            />
          }
        />

        

        <Route
          path="/kyc"
          element={<ProtectedRoute element={<KYCPage />} />}
        />

        <Route
          path="/profile"
          element={<ProtectedRoute element={<ProfilePage />} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;