import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import React from "react";
import OrganizerDashboard from "./components/Organizer";
import WorkerDashboard from "./components/Volunteer";
import JoinPage from "./components/JoinPage";
import CompleteRegistrationFlow from "./components/CompleteRegistrationFlow";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/organizer" element={<OrganizerDashboard />} />
        <Route path="/volunteer" element={<WorkerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/signup" element={<CompleteRegistrationFlow />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
