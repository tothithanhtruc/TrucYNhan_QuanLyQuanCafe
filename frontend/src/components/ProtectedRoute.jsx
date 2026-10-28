import { Navigate, useLocation } from "react-router-dom";
import { isAdmin, isLoggedIn } from "../services/authApi";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/shop" replace />;
  }

  return children;
}
