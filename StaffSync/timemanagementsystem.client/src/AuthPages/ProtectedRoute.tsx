import React from 'react'
import { Navigate, useLocation } from 'react-router-dom';
import PermissionManager from '../app/PermissionManager ';
import RestrictedPage from '../Pages/RestrictedPage';
import AuthenticationHelper from '../app/authenticationHelper';

const ProtectedRoute = ({ children, permissionsRequired = [] }) => {
  const location = useLocation();
  const employeeObj = PermissionManager.EmployeeObj();
  
  // Assume these come from a context or global state
    const isAuthenticated = AuthenticationHelper.isLoggedIn(); // This should be dynamically set based on your auth state

    const hasRequiredPermissions = permissionsRequired.some(permission => 
      employeeObj.employeePermissions.includes(permission));
      // console.log(employeeObj.employeePermissions);
      // console.log(permissionsRequired);

    if (!isAuthenticated) {
        // Redirect to login, saving the intended destination
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!hasRequiredPermissions) {
        // Redirect to a not authorized page
        return <RestrictedPage />;
    }

    // If authenticated and has permissions, render the children
    return children;
}

export default ProtectedRoute