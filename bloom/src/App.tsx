import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthScreen from "./components/AuthScreen.tsx";
import Dashboard from "./components/Dashboard.tsx";
import AddFriend from "./components/AddFriend.tsx";
import FriendManagement from "./components/FriendManagement.tsx";
import OccasionsTracker from "./components/OccasionsTracker.tsx";
import GiftStore from "./components/GiftStore.tsx";
import Notifications from "./components/Notifications.tsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Dashboard />
              ) : (
                <AuthScreen onLogin={() => setIsAuthenticated(true)} />
              )
            }
          />
          <Route path="/add-friend" element={<AddFriend />} />
          <Route path="/friends" element={<FriendManagement />} />
          <Route path="/occasions" element={<OccasionsTracker />} />
          <Route path="/gift-store" element={<GiftStore />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
