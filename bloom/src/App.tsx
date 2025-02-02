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

        {/* Protected Routes with AuthWrapper */}
        <Route element={<AuthWrapper />}>
          {/* Root route - redirect to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/friends" element={<FriendManagement />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/gift-store" element={<GiftStore />} />
        </Route>

        {/* Catch all route - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
