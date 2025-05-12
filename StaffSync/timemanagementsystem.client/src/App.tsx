import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import PermissionManager from "./app/PermissionManager ";
import { RoutesConfig } from "./app/RoutesConfig";

function App() {
  const navigate = useNavigate();

  /**
   * Add all routes that don't require authentication to this list
   */
  const publicRoutes = [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/resendemail",
    "/login-mfa",
    "/login-mfa:empCode",
    "/update-password"
  ];

  // Function to match path with dynamic segments
  const matchPath = (path: string, pattern: string) => {
    const regex = new RegExp(`^${pattern.replace(/:\w+/g, "\\w+")}$`);
    return regex.test(path);
  };

  // Function to check if the current path is public
  const isPublicRoute = (path: string) =>
    publicRoutes.some((route) => matchPath(path, route));

  useEffect(() => {
    const isEmployeeLoggedIn = sessionStorage.getItem("employee");
    const currentPath = window.location.pathname;

    if (!isEmployeeLoggedIn && !isPublicRoute(currentPath)) {
      console.log('Employee is not logged in', currentPath)
      navigate("/login");
    }
  }, [navigate]);

  const employeeObj = PermissionManager.EmployeeObj();
  const routes = RoutesConfig(employeeObj);

  return (
    <Routes>
      {routes.map((route, index) => (
        <Route key={index} element={route.layout}>
          <Route path={route.path} element={route.element} />
        </Route>
      ))}
    </Routes>
  );
}

export default App;
