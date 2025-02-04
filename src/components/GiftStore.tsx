// src/components/GiftStore.tsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

type Gift = {
  id: string;
  name: string;
  description: string;
  code: string;
  available_units: number;
  price: number;
  image_url: string;
};

type Friend = {
  id: string;
  name: string;
};

type Event = {
  id: string;
  name: string;
  date: string;
  friend_id: string;
};

const GiftStore = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGifts();
    fetchFriends();
  }, []);

  const fetchGifts = async () => {
    try {
      const { data, error } = await supabase
        .from("gifts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGifts(data || []);
    } catch (error) {
      console.error("Error fetching gifts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("friends")
        .select("id, name")
        .eq("user_id", user.id);

      if (error) throw error;
      setFriends(data || []);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const fetchEvents = async (friendId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("events")
        .select("id, name, date, friend_id")
        .eq("friend_id", friendId)
        .gte("date", new Date().toISOString())
        .order("date");

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleGiftClick = (gift: Gift) => {
    setSelectedGift(gift);
    setShowRequestForm(true);
    setRequestSent(false);
  };

  const handleFriendChange = (friendId: string) => {
    setSelectedFriend(friendId);
    setSelectedEvent("");
    fetchEvents(friendId);
  };

  const handleSubmitRequest = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("gift_requests").insert([
        {
          user_id: user.id,
          gift_id: selectedGift?.id,
          friend_id: selectedFriend,
          event_id: selectedEvent,
          status: "pending",
        },
      ]);

      if (error) throw error;
      setRequestSent(true);
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#2E4034] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-white/80 hover:text-white 
                   transition-colors duration-200 mb-4"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-[#778C6D]/20">
          <h1
            className="text-4xl font-bold"
            style={{
              background: "linear-gradient(135deg, #465947 0%, #2E4034 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Gift Store
          </h1>
          <p className="mt-2 text-[#778C6D]">
            Discover thoughtful gifts for your loved ones
          </p>
        </div>

        {/* Request Form Modal */}
        {showRequestForm && selectedGift && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl p-6 max-w-md w-full m-4 relative">
              <button
                title="Close"
                onClick={() => setShowRequestForm(false)}
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {!requestSent ? (
                <>
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#465947] mb-4">
                    Request Gift
                  </h2>

                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                    <div className="w-24 h-24 rounded-lg overflow-hidden">
                      <img
                        src={selectedGift.image_url}
                        alt={selectedGift.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-[#465947] font-medium">
                        {selectedGift.name}
                      </p>
                      <p className="text-[#778C6D] text-sm">
                        ${selectedGift.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[#465947] mb-2">
                        Select Friend
                      </label>
                      <select
                        title="Select Friend"
                        value={selectedFriend}
                        onChange={(e) => handleFriendChange(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="">Choose a friend</option>
                        {friends.map((friend) => (
                          <option key={friend.id} value={friend.id}>
                            {friend.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedFriend && (
                      <div>
                        <label className="block text-[#465947] mb-2">
                          Select Event
                        </label>
                        <select
                          title="Select Event"
                          value={selectedEvent}
                          onChange={(e) => setSelectedEvent(e.target.value)}
                          className="w-full p-2 border rounded-lg"
                        >
                          <option value="">Choose an event</option>
                          {events.map((event) => (
                            <option key={event.id} value={event.id}>
                              {event.name} (
                              {new Date(event.date).toLocaleDateString()})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        onClick={() => setShowRequestForm(false)}
                        className="px-4 py-2 text-[#465947] hover:bg-gray-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitRequest}
                        disabled={!selectedFriend || !selectedEvent}
                        className="px-4 py-2 bg-gradient-to-r from-[#465947] to-[#2E4034] 
                                 text-white rounded-lg disabled:opacity-50"
                      >
                        Submit Request
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <svg
                    className="w-16 h-16 text-green-500 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <h2 className="text-2xl font-semibold text-[#465947] mb-2">
                    Request Sent!
                  </h2>
                  <p className="text-[#778C6D] mb-6">
                    Our team will contact you soon about your gift request.
                  </p>
                  <button
                    onClick={() => setShowRequestForm(false)}
                    className="px-6 py-2 bg-gradient-to-r from-[#465947] to-[#2E4034] 
                             text-white rounded-lg"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gift Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {loading
            ? // Loading skeleton
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white/95 rounded-xl p-4"
                >
                  <div className="bg-[#778C6D]/20 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-[#778C6D]/20 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-[#778C6D]/20 rounded w-1/2"></div>
                </div>
              ))
            : gifts.map((gift) => (
                <div
                  key={gift.id}
                  className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg 
                         border border-[#778C6D]/20 overflow-hidden
                         transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-[#D9C6A3]/10">
                    {gift.image_url && (
                      <img
                        src={gift.image_url}
                        alt={gift.name}
                        className="object-cover w-full h-48"
                      />
                    )}
                  </div>
                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-[#465947]">
                          {gift.name}
                        </h3>
                        <p className="text-[#778C6D] text-sm mt-1">
                          {gift.description}
                        </p>
                      </div>
                      <span className="bg-[#D9C091]/20 text-[#465947] px-3 py-1 rounded-full text-sm font-medium">
                        {gift.code}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-[#465947]">
                        ${gift.price.toFixed(2)}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          gift.available_units > 10
                            ? "text-green-600"
                            : gift.available_units > 0
                            ? "text-orange-600"
                            : "text-red-600"
                        }`}
                      >
                        {gift.available_units > 0
                          ? `${gift.available_units} available`
                          : "Out of stock"}
                      </span>
                    </div>

                    <button
                      onClick={() => handleGiftClick(gift)}
                      className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-[#465947] to-[#2E4034] 
                               text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Request Gift
                    </button>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

export default GiftStore;
