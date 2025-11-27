import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

export default Index;