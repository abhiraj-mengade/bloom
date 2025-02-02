// src/components/FriendManagement.tsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Friend, Event } from "../lib/supabase";
import { format } from "date-fns";

const FriendManagement = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  const [friendForm, setFriendForm] = useState({
    name: "",
    address: "",
    contact: "",
    interests: "",
  });

  const [eventForm, setEventForm] = useState({
    name: "",
    date: "",
    friend_id: "",
  });

  // Add user state
  const [userId, setUserId] = useState<string | null>(null);

  // First useEffect to get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Second useEffect to fetch data when userId changes
  useEffect(() => {
    if (userId) {
      fetchFriends();
      fetchEvents();
    }
  }, [userId]); // Add userId as dependency

  const fetchFriends = async () => {
    if (!userId) {
      console.error("No user ID available for fetching friends");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .eq("user_id", userId)
        .order("name");

      if (error) throw error;

      console.log("Fetching friends for userId:", userId);
      console.log("Fetched friends:", data);
      setFriends(data || []);
    } catch (error) {
      console.error("Error fetching friends:", error);
      setFriends([]);
    }
  };

  const fetchEvents = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("events")
      .select(
        `
        *,
        friend:friends(name)
      `
      )
      .eq("user_id", userId) // Only get current user's events
      .order("date");
    if (!error && data) {
      setEvents(data);
    } else {
      console.error("Error fetching events:", error);
    }
  };

  const handleFriendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      console.error("No user ID available");
      return;
    }

    try {
      if (editingFriend) {
        const { error } = await supabase
          .from("friends")
          .update(friendForm)
          .eq("id", editingFriend.id)
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("friends").insert([
          {
            ...friendForm,
            user_id: userId,
          },
        ]);

        if (error) throw error;
      }

      // Reset form and fetch updated friends list
      setFriendForm({ name: "", address: "", contact: "", interests: "" });
      setIsAddingFriend(false);
      setEditingFriend(null);
      await fetchFriends(); // Fetch updated friends list
      console.log("Friend added successfully");
    } catch (error) {
      console.error("Error handling friend submission:", error);
      alert("Error saving friend. Please try again.");
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !selectedFriend) return;

    const { error } = await supabase.from("events").insert([
      {
        ...eventForm,
        friend_id: selectedFriend.id,
        user_id: userId, // Add user_id to new event
      },
    ]);
    if (!error) {
      setIsAddingEvent(false);
      setSelectedFriend(null);
      fetchEvents();
    } else {
      console.error("Error adding event:", error);
    }
    setEventForm({ name: "", date: "", friend_id: "" });
  };

  // Update delete functions to include user_id check
  const handleDeleteFriend = async (friendId: string) => {
    if (!userId) return;

    const { error } = await supabase
      .from("friends")
      .delete()
      .eq("id", friendId)
      .eq("user_id", userId); // Add user_id check
    if (!error) {
      fetchFriends();
    } else {
      console.error("Error deleting friend:", error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!userId) return;

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId)
      .eq("user_id", userId); // Add user_id check
    if (!error) {
      fetchEvents();
    } else {
      console.error("Error deleting event:", error);
    }
  };

  // Helper function for date formatting
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yy");
  };

  return (
    <div className="min-h-screen bg-[#2E4034] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-[#778C6D]/20">
          <h1
            className="text-4xl font-bold"
            style={{
              background: "linear-gradient(135deg, #465947 0%, #2E4034 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Friend Management
          </h1>
          <p className="text-[#778C6D] mt-2">
            Keep track of your friends and their special moments
          </p>
        </div>

        {/* Friend Management Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-[#778C6D]/20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-[#465947]">Friends</h2>
            <button
              onClick={() => setIsAddingFriend(true)}
              className="bg-[#465947] text-white px-6 py-2.5 rounded-lg 
                       hover:bg-[#2E4034] transition-all duration-300
                       transform hover:-translate-y-0.5 hover:shadow-lg
                       flex items-center space-x-2 font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Add Friend</span>
            </button>
          </div>

          {/* Friend Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="bg-[#D9C6A3]/10 p-6 rounded-lg shadow-md
                         border border-[#778C6D]/20 hover:shadow-lg
                         transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-[#465947]">
                      {friend.name}
                    </h3>
                    {friend.contact && (
                      <p className="text-[#778C6D] flex items-center text-sm">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span className="truncate">{friend.contact}</span>
                      </p>
                    )}
                    {friend.address && (
                      <p className="text-[#778C6D] flex items-center text-sm">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="truncate">{friend.address}</span>
                      </p>
                    )}
                    {friend.interests && (
                      <p className="text-[#778C6D] flex items-center text-sm">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                        <span className="truncate">{friend.interests}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => {
                        setSelectedFriend(friend);
                        setIsAddingEvent(true);
                      }}
                      className="p-2 rounded-full hover:bg-[#465947]/10
                               text-[#465947] transition-colors duration-200"
                      title="Add Event"
                    >
                      <svg
                        className="w-5 h-5"
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
                    </button>
                    <button
                      onClick={() => setEditingFriend(friend)}
                      className="p-2 rounded-full hover:bg-[#778C6D]/10
                               text-[#778C6D] transition-colors duration-200"
                      title="Edit"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteFriend(friend.id)}
                      className="p-2 rounded-full hover:bg-red-50
                               text-red-600 transition-colors duration-200"
                      title="Delete"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Events Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-[#778C6D]/20">
          <h2 className="text-2xl font-bold text-[#465947] mb-8">Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-[#D9C6A3]/10 p-6 rounded-lg shadow-md
                         border border-[#778C6D]/20 hover:shadow-lg
                         transition-all duration-300 hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-[#465947]">
                    {event.name}
                  </h3>
                  <p className="text-[#778C6D] flex items-center text-sm">
                    <svg
                      className="w-4 h-4 mr-2"
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
                    {formatDate(event.date)}
                  </p>
                  <p className="text-[#778C6D] flex items-center text-sm">
                    <svg
                      className="w-4 h-4 mr-2"
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
                    {event.friend?.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modals */}
        {(isAddingFriend || editingFriend) && (
          <div
            className="fixed inset-0 bg-[#2E4034]/70 backdrop-blur-sm 
                        flex items-center justify-center p-4 z-50"
          >
            <div
              className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full
                          border border-[#778C6D]/20"
            >
              <h2 className="text-xl font-semibold mb-4 text-[#465947]">
                {editingFriend ? "Edit Friend" : "Add New Friend"}
              </h2>
              <form onSubmit={handleFriendSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={friendForm.name}
                  onChange={(e) =>
                    setFriendForm({ ...friendForm, name: e.target.value })
                  }
                  className="w-full p-3 bg-[#D9C6A3]/5 border border-[#778C6D]/20 rounded-lg
                           text-[#2E4034] placeholder-[#778C6D]/50
                           focus:ring-2 focus:ring-[#465947]/20 focus:border-[#465947]
                           transition-all duration-200"
                  required
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={friendForm.address}
                  onChange={(e) =>
                    setFriendForm({ ...friendForm, address: e.target.value })
                  }
                  className="w-full p-3 bg-[#D9C6A3]/5 border border-[#778C6D]/20 rounded-lg
                           text-[#2E4034] placeholder-[#778C6D]/50
                           focus:ring-2 focus:ring-[#465947]/20 focus:border-[#465947]
                           transition-all duration-200"
                  required
                />
                <input
                  type="text"
                  placeholder="Contact"
                  value={friendForm.contact}
                  onChange={(e) =>
                    setFriendForm({ ...friendForm, contact: e.target.value })
                  }
                  className="w-full p-3 bg-[#D9C6A3]/5 border border-[#778C6D]/20 rounded-lg
                           text-[#2E4034] placeholder-[#778C6D]/50
                           focus:ring-2 focus:ring-[#465947]/20 focus:border-[#465947]
                           transition-all duration-200"
                  required
                />
                <input
                  type="text"
                  placeholder="Interests"
                  value={friendForm.interests}
                  onChange={(e) =>
                    setFriendForm({ ...friendForm, interests: e.target.value })
                  }
                  className="w-full p-3 bg-[#D9C6A3]/5 border border-[#778C6D]/20 rounded-lg
                           text-[#2E4034] placeholder-[#778C6D]/50
                           focus:ring-2 focus:ring-[#465947]/20 focus:border-[#465947]
                           transition-all duration-200"
                  required
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#465947] text-white py-2.5 rounded-lg
                             hover:bg-[#2E4034] transition-all duration-300
                             transform hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {editingFriend ? "Save Changes" : "Add Friend"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingFriend(false);
                      setEditingFriend(null);
                    }}
                    className="flex-1 bg-[#D9C6A3]/20 text-[#465947] py-2.5 rounded-lg
                             hover:bg-[#D9C6A3]/30 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Event Modal with similar styling updates */}
        {isAddingEvent && selectedFriend && (
          <div
            className="fixed inset-0 bg-[#2E4034]/70 backdrop-blur-sm 
                        flex items-center justify-center p-4 z-50"
          >
            <div
              className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full
                          border border-[#778C6D]/20"
            >
              <h2 className="text-xl font-semibold mb-4 text-[#465947]">
                Add Event for {selectedFriend.name}
              </h2>
              <form onSubmit={handleEventSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Event Name"
                  value={eventForm.name}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, name: e.target.value })
                  }
                  className="w-full p-3 bg-[#D9C6A3]/5 border border-[#778C6D]/20 rounded-lg
                           text-[#2E4034] placeholder-[#778C6D]/50
                           focus:ring-2 focus:ring-[#465947]/20 focus:border-[#465947]
                           transition-all duration-200"
                  required
                />
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, date: e.target.value })
                  }
                  className="w-full p-3 bg-[#D9C6A3]/5 border border-[#778C6D]/20 rounded-lg
                           text-[#2E4034] placeholder-[#778C6D]/50
                           focus:ring-2 focus:ring-[#465947]/20 focus:border-[#465947]
                           transition-all duration-200"
                  required
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#465947] text-white py-2.5 rounded-lg
                             hover:bg-[#2E4034] transition-all duration-300
                             transform hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Add Event
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingEvent(false);
                      setSelectedFriend(null);
                    }}
                    className="flex-1 bg-[#D9C6A3]/20 text-[#465947] py-2.5 rounded-lg
                             hover:bg-[#D9C6A3]/30 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendManagement;
