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

const App = () => {
  return (
    <Router>
      <Routes>
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

        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch all route - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
