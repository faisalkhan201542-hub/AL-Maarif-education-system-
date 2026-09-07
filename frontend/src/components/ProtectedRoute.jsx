import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "./Loader.jsx";

export default function ProtectedRoute({ children }) {
  const { principal, loading } = useAuth();
  if (loading) return <Loader label="Checking session..." />;
  if (!principal) return <Navigate to="/login" replace />;
  return children;
}
