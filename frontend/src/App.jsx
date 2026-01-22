import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import React from "react";
import OrganizerDashboard from "./components/Organizer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/organizer" element={<OrganizerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
