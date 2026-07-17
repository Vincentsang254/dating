/* eslint-disable react/prop-types */
import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "./components/auth/auth-layout.jsx";
import AdminLayout from "./components/adminView/admin-layout.jsx";
import UserLayout from "./components/customerView/customer-layout.jsx";
import CheckAuth from "./components/common/check-auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginPage from "./pages/auth/login.jsx";
import RegisterPage from "./pages/auth/register.jsx";
import ForgotPasswordPage from "./pages/auth/forgot-password.jsx";
import VerifyAccountPage from "./pages/auth/verify-account.jsx";
import CheckEmailPage from "./pages/auth/check-email.jsx";
import ResetPasswordPage from "./pages/auth/password-reset.jsx";
import AdminDashboardPage from "./pages/adminView/dashboard/dashboard.jsx";
import CustomerDashboardPage from "./pages/customerView/dashboard/home.jsx";
import ProfilePage from "./pages/customerView/profile/profile.jsx";
import { loadUser, refreshToken } from "./redux/slices/authSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const App = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(refreshToken());
    }
  }, [token, dispatch]);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-white">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Routes>
        <Route path="/" element={<CheckAuth><Navigate to="/auth/login" replace /></CheckAuth>} />

        <Route path="/auth" element={<CheckAuth><AuthLayout /></CheckAuth>}>
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="verify-otp" element={<VerifyAccountPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="check-email" element={<CheckEmailPage />} />
          <Route path="reset-password/:token" element={<ResetPasswordPage />} />
        </Route>

        <Route path="/admin" element={<CheckAuth requireAuth requireAdmin><AdminLayout /></CheckAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
        </Route>

        <Route path="/user" element={<CheckAuth requireAuth><UserLayout /></CheckAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CustomerDashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
