/* eslint-disable react/prop-types */
import { Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { loadUser, logoutUser } from "@/redux/slices/authSlice";

const Loader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const CheckAuth = ({ children, requireAuth = false, requireAdmin = false }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const userType = useSelector((state) => state.auth.userType);
  const isAuthenticated = useSelector((state) => Boolean(state.auth.token));
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem("token");
    if (tokenFromStorage) {
      try {
        const user = jwtDecode(tokenFromStorage);
        if (user.exp * 1000 < Date.now()) {
          dispatch(logoutUser());
        } else {
          dispatch(loadUser());
        }
      } catch (error) {
        console.error("Token decoding failed:", error);
        dispatch(logoutUser());
      }
    }
    setCheckingToken(false);
  }, [dispatch]);

  if (checkingToken) {
    return <Loader />;
  }

  const publicPaths = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/verify-otp",
    "/auth/check-email",
    "/auth/reset-password",
  ];

  const isPublicPath = publicPaths.some((path) => location.pathname.startsWith(path));
  const isResetPasswordPath = location.pathname.startsWith("/auth/reset-password");

  if (isResetPasswordPath) {
    return children;
  }

  if (isAuthenticated && isPublicPath) {
    return userType === "admin" ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/user/dashboard" replace />;
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (requireAuth && requireAdmin && userType !== "admin") {
    return <Navigate to="/unauth-page" replace />;
  }

  if (location.pathname === "/") {
    if (isAuthenticated) {
      return userType === "admin" ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/user/dashboard" replace />;
    }
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default CheckAuth;
