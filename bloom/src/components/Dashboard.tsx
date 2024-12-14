// src/components/Dashboard.tsx
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleAddFriend = () => {
    navigate("/add-friend");
  };

  const handleViewOccasions = () => {
    navigate("/occasions");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
          Welcome to Bloom
        </h1>

        {/* Responsive grid with better breakpoints */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* Quick Actions - Full width on mobile */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow transition-shadow">
            <h2 className="text-lg font-semibold mb-3 sm:mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                className="w-full sm:flex-1 py-3 px-4 bg-primary text-white rounded-lg hover:bg-secondary active:transform active:scale-95 transition-all duration-200 text-sm sm:text-base"
                onClick={handleAddFriend}
              >
                Add New Friend
              </button>
              <button
                className="w-full sm:flex-1 py-3 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:transform active:scale-95 transition-all duration-200 text-sm sm:text-base"
                onClick={handleViewOccasions}
              >
                View Occasions
              </button>
            </div>
          </div>

          {/* Grid for Events and Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Upcoming Events */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow transition-shadow">
              <h2 className="text-lg font-semibold mb-3 sm:mb-4">
                Upcoming Events
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                No upcoming events
              </p>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow transition-shadow">
              <h2 className="text-lg font-semibold mb-3 sm:mb-4">
                Recent Activity
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                No recent activity
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
