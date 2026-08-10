import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login.jsx";
import BusinessManager from "./pages/BusinessManager.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import { isLoggedIn } from "./lib/api.js";

function Protected({ children }) {
  const [ok, setOk] = useState(isLoggedIn());
  if (!ok) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Protected><AdminDashboard /></Protected>} />
        <Route path="/" element={<Protected><BusinessManager /></Protected>} />
      </Routes>
    </HashRouter>
  );
}
