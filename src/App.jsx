import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import ERPModulePage from "./pages/erp/ERPModulePage.jsx";
import { moduleConfigs } from "./pages/erp/moduleConfigs.js";
import ReportsPage from "./pages/reports/ReportsPage.jsx";
import UsersPage from "./pages/users/UsersPage.jsx";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="reports" element={<ReportsPage />} />
        {Object.entries(moduleConfigs).filter(([path]) => path !== "users" && path !== "reports").map(([path, config]) => (
          <Route key={path} path={path} element={<ERPModulePage config={config} />} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}


