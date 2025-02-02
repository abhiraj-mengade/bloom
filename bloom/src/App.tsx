import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import FriendManagement from "./components/FriendManagement";
import AuthWrapper from "./components/AuthWrapper";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthScreen />} />
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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
