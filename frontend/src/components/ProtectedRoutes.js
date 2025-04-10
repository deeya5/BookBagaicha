import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; // or your actual hook
import { ROLES } from "../constants/roles";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;

  return children;
};

export default ProtectedRoute;
