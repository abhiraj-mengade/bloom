// src/components/Dashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Friend, Event } from "../lib/supabase";
import { format } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentFriends, setRecentFriends] = useState<Friend[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Fetch upcoming events (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data: events } = await supabase
      .from("events")
      .select(
        `
        *,
        friend:friends(name)
      `
      )
      .gte("date", new Date().toISOString())
      .lte("date", thirtyDaysFromNow.toISOString())
      .order("date")
      .limit(5);

    // Fetch recently added friends
    const { data: friends } = await supabase
      .from("friends")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);

    if (events) setUpcomingEvents(events);
    if (friends) setRecentFriends(friends);
  };

  return (
    <div className="min-h-screen bg-[#2E4034] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-[#778C6D]/20">
          <h1
            className="text-4xl font-bold"
            style={{
              background: "linear-gradient(135deg, #465947 0%, #2E4034 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Welcome to Bloom
          </h1>
          <p className="mt-2 text-[#778C6D]">
            Your personal relationship management dashboard
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-[#778C6D]/20">
          <h2 className="text-2xl font-bold text-[#465947] mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/friends")}
              className="flex items-center justify-center space-x-3 p-4 
                       bg-gradient-to-r from-[#465947] to-[#2E4034]
                       text-white rounded-lg hover:shadow-lg transition-all duration-300
                       transform hover:-translate-y-0.5"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span className="text-lg font-medium">Manage Friends</span>
            </button>
            <button
              onClick={() => navigate("/friends")}
              className="flex items-center justify-center space-x-3 p-4 
                       bg-gradient-to-r from-[#778C6D] to-[#465947]
                       text-white rounded-lg hover:shadow-lg transition-all duration-300
                       transform hover:-translate-y-0.5"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-lg font-medium">Add Event</span>
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-[#778C6D]/20">
            <h2 className="text-2xl font-bold text-[#465947] mb-6 flex items-center">
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Upcoming Events
            </h2>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 
                             bg-gradient-to-r from-[#D9C6A3]/10 to-[#D9C091]/10
                             rounded-lg hover:shadow-md transition-all duration-200
                             border border-[#778C6D]/10 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-[#465947]/10 rounded-full p-2">
                        <svg
                          className="w-6 h-6 text-[#465947]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#465947]">
                          {event.name}
                        </h3>
                        <p className="text-sm text-[#778C6D]">
                          {format(new Date(event.date), "dd MMM yyyy")} -{" "}
                          {event.friend?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#778C6D]">
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-[#778C6D]/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p>No upcoming events</p>
              </div>
            )}
          </div>

          {/* Recent Friends */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-[#778C6D]/20">
            <h2 className="text-2xl font-bold text-[#465947] mb-6 flex items-center">
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Recent Friends
            </h2>
            {recentFriends.length > 0 ? (
              <div className="space-y-4">
                {recentFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-[#D9C6A3]/10 to-[#D9C091]/10 rounded-lg hover:shadow-md transition-all duration-200 border border-[#778C6D]/10 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-[#465947]/10 rounded-full p-2">
                        <svg
                          className="w-6 h-6 text-[#465947]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#465947]">
                          {friend.name}
                        </h3>
                        <p className="text-sm text-[#778C6D]">
                          {friend.interests}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#778C6D]">
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-[#778C6D]/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <p>No recent friends added</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
