import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  // Si no está logueado, redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si se requieren roles específicos y el usuario no tiene ninguno de ellos, redirigir al catálogo
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  // Si pasa las validaciones, renderiza el componente hijo
  return children;
};

export default ProtectedRoute;
