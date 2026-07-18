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
import AdminUsersPage from "./pages/adminView/users/users.jsx";
import AdminPaymentsPage from "./pages/adminView/payments/payments.jsx";
import AdminReportsPage from "./pages/adminView/reports/reports.jsx";
import AdminAnalyticsPage from "./pages/adminView/analytics/analytics.jsx";
import CustomerDashboardPage from "./pages/customerView/dashboard/home.jsx";
import ProfilePage from "./pages/customerView/profile/profile.jsx";
import DiscoverPage from "./pages/customerView/discover/discover.jsx";
import MatchesPage from "./pages/customerView/matches/matches.jsx";
import LikesPage from "./pages/customerView/likes/likes.jsx";
import ConversationsPage from "./pages/customerView/messages/conversations.jsx";
import ChatPage from "./pages/customerView/messages/chat.jsx";
import PremiumPage from "./pages/customerView/payments/premium.jsx";
import { loadUser, refreshToken } from "./redux/slices/authSlice";
import { url as API_URL } from "./redux/slices/api";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import socketService from "@/services/socketService";
import { setUserFeatures } from "@/redux/slices/messagingSlice";
import axios from "axios";

const App = () => {
  const dispatch = useDispatch();
  const { token, id: userId } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(refreshToken());
    }
  }, [token, dispatch]);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  // Initialize Socket.IO and fetch premium features when user is authenticated
  useEffect(() => {
    if (token && userId) {
      // Initialize Socket.IO
      socketService.connect(token);

      // Fetch premium features
      axios
        .get(`${API_URL}/messaging/premium-features`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          dispatch(setUserFeatures(response.data.data));
        })
        .catch((error) => {
          console.error("Failed to fetch premium features:", error);
        });
    }
  }, [token, userId, dispatch]);

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
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
        </Route>

        <Route path="/user" element={<CheckAuth requireAuth><UserLayout /></CheckAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CustomerDashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="likes" element={<LikesPage />} />
          <Route path="messages" element={<ConversationsPage />} />
          <Route path="messages/:conversationId" element={<ChatPage />} />
          <Route path="vip" element={<PremiumPage />} />
          <Route path="payments" element={<PremiumPage />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
