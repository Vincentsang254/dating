/* eslint-disable react/prop-types */
import { Route, Routes } from "react-router-dom";
import AuthLayout from "./components/auth/auth-layout";
import AdminLayout from "./components/adminView/admin-layout";
import UserLayout from "./components/customerView/customer-layout";
import CheckAuth from "./components/common/check-auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Auth Pages
//import AuthLogin from "./pages/auth/login";
//import AuthRegister from "./pages/auth/register";
//import ForgotPassword from "./pages/auth/forgot-password";
//import VerifyAccount from "./pages/auth/verify-account";
//import CheckEmail from "./pages/auth/check-email";
//import ResetPassword from "./pages/auth/password-reset";

// Admin Pages
//import AdminDashboard from "./pages/admin-view/dashboard";
//import AdminUsers from "./pages/admin-view/admin-users";

// User Pages
//import Home from "./pages/user-view/common/Home";
//import Profile from "./pages/user-view/account/Profile";

// Common Pages
//import UnauthPage from "./pages/unauth-page";
//import NotFound from "./pages/not-found/Notfound";
//import AdminPaymentsHistory from "./pages/admin-view/admin-view-payments";
import { loadUser, refreshToken } from "./redux/slices/authSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
const App = ({ isAuthenticated, user }) => {

  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  console.log("token: ", token)

  useEffect(() => {
    if (token) {
      dispatch(refreshToken());
    }
  }, [token, dispatch]);
 

  // Load user on app initialization
  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);
  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-white">
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
        <Route
          path="/"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              {/* Home or landing page can go here */}
            </CheckAuth>
          }
        />

        <Route
          path="/auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AuthLayout />
            </CheckAuth>
          }
        >
         // <Route path="login" element={<AuthLogin />} />
          //<Route path="register" element={<AuthRegister />} />
          //<Route path="verify-otp" element={<VerifyAccount />} />
          //<Route path="forgot-password" element={<ForgotPassword />} />
          //<Route path="check-email" element={<CheckEmail />} />
        </Route>

        //<Route path="/auth/reset-password/:token" element={<ResetPassword />} />

        {/* Admin Dashboard Routes */}
        <Route
          path="/admin"
          element={
            <CheckAuth
              isAuthenticated={isAuthenticated}
              user={user}
              requireAuth
              requireAdmin
            >
              <AdminLayout />
            </CheckAuth>
          }
        >
         // <Route index element={<AdminDashboard />} />
         // <Route path="dashboard" element={<AdminDashboard />} />
         // <Route path="users" element={<AdminUsers />} />
          
         // <Route path="payments" element={<AdminPaymentsHistory />} />
        </Route>

        {/* User Dashboard Routes */}
        <Route
          path="/user"
          element={
            <CheckAuth
              isAuthenticated={isAuthenticated}
              user={user}
              requireAuth
            >
              <UserLayout />
            </CheckAuth>
          }
        >
        //  <Route index element={<Home />} />
         // <Route path="dashboard" element={<Home />} />
         // <Route path="profile" element={<Profile />} />
          
        </Route>

        {/* Common pages */}
       // <Route path="/unauth-page" element={<UnauthPage />} />
       // <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
