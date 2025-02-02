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
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check initial auth state
    checkUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setIsAuthenticated(!!session);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
    }
  }

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-dark_slate_gray flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-dutch_white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthScreen />
            )
          }
        />

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
