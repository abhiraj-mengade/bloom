import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import FriendManagement from "./components/FriendManagement";
import AuthWrapper from "./components/AuthWrapper";
import GiftStore from "./components/GiftStore";
import Profile from "./components/Profile";
import Wishlist from "./components/Wishlist";
import AuthScreen from "./components/AuthScreen";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<AuthScreen />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <AuthWrapper>
              <Dashboard />
            </AuthWrapper>
          }
        />
        <Route
          path="/friends"
          element={
            <AuthWrapper>
              <FriendManagement />
            </AuthWrapper>
          }
        />
        <Route
          path="/profile"
          element={
            <AuthWrapper>
              <Profile />
            </AuthWrapper>
          }
        />
        <Route
          path="/wishlist"
          element={
            <AuthWrapper>
              <Wishlist />
            </AuthWrapper>
          }
        />
        <Route path="/gift-store" element={<GiftStore />} />

        {/* Root route - redirect to dashboard if authenticated, otherwise to login */}
        <Route
          path="/"
          element={
            <AuthWrapper>
              <Navigate to="/dashboard" replace />
            </AuthWrapper>
          }
        />

        {/* Catch all route - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
