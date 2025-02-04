import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { WishlistItem } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

type SearchResult = {
  id: string;
  name: string;
  phone: string;
  wishlist: WishlistItem[];
};

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", description: "" });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkProfileAndLoadWishlist();
  }, []);

  const checkProfileAndLoadWishlist = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Check if profile is complete
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const profileComplete = profile && profile.name && profile.phone;
      setIsProfileComplete(profileComplete);

      if (profileComplete) {
        // Load user's wishlist
        const { data: wishlist } = await supabase
          .from("wishlist")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        setWishlistItems(wishlist || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      // First get the profiles that match the search query
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, name, phone")
        .or(`name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
        .order("name");

      if (profileError) throw profileError;

      if (!profiles || profiles.length === 0) {
        setSearchResults([]);
        return;
      }

      // Then get the wishlists for these profiles
      const profileIds = profiles.map((profile) => profile.id);
      const { data: wishlistItems, error: wishlistError } = await supabase
        .from("wishlist")
        .select("*")
        .in("user_id", profileIds);

      if (wishlistError) throw wishlistError;

      // Combine the data
      const formattedResults = profiles.map((profile) => ({
        ...profile,
        wishlist:
          wishlistItems?.filter((item) => item.user_id === profile.id) || [],
      }));

      // Filter out profiles without wishlists if needed
      // const resultsWithWishlists = formattedResults.filter(profile => profile.wishlist.length > 0);
      setSearchResults(formattedResults);
    } catch (error) {
      console.error("Error searching:", error);
      alert("Error searching for wishlists. Please try again.");
    }
  };

  const addWishlistItem = async () => {
    if (!isProfileComplete) {
      alert("Please complete your profile first");
      return;
    }

    if (!newItem.name.trim() || !newItem.description.trim()) {
      alert("Please fill in both name and description");
      return;
    }

    if (wishlistItems.length >= 10) {
      alert("You can only have up to 10 items in your wishlist");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("wishlist")
        .insert([
          {
            user_id: user.id,
            name: newItem.name,
            description: newItem.description,
          },
        ])
        .select();

      if (error) throw error;

      setWishlistItems([...(data || []), ...wishlistItems]);
      setNewItem({ name: "", description: "" });
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const deleteWishlistItem = async (itemId: string) => {
    try {
      await supabase.from("wishlist").delete().eq("id", itemId);

      setWishlistItems(wishlistItems.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#2E4034] p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-white text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2E4034] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-white/80 hover:text-white 
                   transition-colors duration-200 group"
        >
          <svg
            className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200"
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
        <div
          className="bg-gradient-to-br from-[#465947] to-[#2E4034] rounded-xl shadow-lg p-8 
                      border border-white/10 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
              <p className="text-[#D9C6A3] opacity-90">
                Manage your gift preferences
              </p>
            </div>
            <div className="hidden sm:block">
              <svg
                className="w-16 h-16 text-[#D9C091] opacity-80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
          </div>
          {!isProfileComplete && (
            <div className="mt-4 p-4 bg-[#D9C091]/10 rounded-lg border border-[#D9C091]/20 text-[#D9C091]">
              ⚠️ Please complete your profile to create a wishlist
            </div>
          )}
        </div>

        {/* Search Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-[#778C6D]/20 overflow-hidden">
          <div className="p-6 border-b border-[#778C6D]/10">
            <h2 className="text-2xl font-bold text-[#465947]">
              Search Wishlists
            </h2>
            <p className="text-[#778C6D] mt-1">
              Find and explore other users' wishlists
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-4 pl-12 bg-[#D9C6A3]/5 border border-[#778C6D]/20 rounded-lg
                           text-[#2E4034] placeholder-[#778C6D]/50
                           focus:ring-2 focus:ring-[#465947]/20 focus:border-[#465947]
                           transition-all duration-200"
                />
                <svg
                  className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#778C6D]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#465947] to-[#2E4034] 
                         text-white rounded-lg hover:shadow-lg transition-all duration-300
                         transform hover:-translate-y-0.5"
              >
                Search Wishlists
              </button>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 ? (
              <div className="mt-6 space-y-4">
                {searchResults.map((profile) => (
                  <div
                    key={profile.id}
                    className="bg-[#D9C6A3]/5 rounded-lg p-6 border border-[#778C6D]/20
                             hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-[#465947]">
                          {profile.name}
                        </h3>
                      </div>
                      <div className="bg-[#465947]/10 px-3 py-1 rounded-full">
                        <span className="text-sm text-[#465947]">
                          {profile.wishlist?.length || 0} items
                        </span>
                      </div>
                    </div>
                    {profile.wishlist && profile.wishlist.length > 0 ? (
                      <div className="space-y-3">
                        {profile.wishlist.map((item: WishlistItem) => (
                          <div
                            key={item.id}
                            className="bg-white/50 p-4 rounded-lg border border-[#778C6D]/10
                                     hover:shadow-md transition-all duration-200"
                          >
                            <h4 className="font-medium text-[#465947]">
                              {item.name}
                            </h4>
                            <p className="text-[#778C6D] mt-1">
                              {item.description}
                            </p>
                            <p className="text-xs text-[#778C6D]/70 mt-2">
                              Added{" "}
                              {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#778C6D] italic">
                        No items in wishlist
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              searchQuery.trim() !== "" && (
                <div className="mt-6 p-4 bg-[#D9C6A3]/10 rounded-lg border border-[#D9C6A3]/20">
                  <p className="text-[#465947] text-center">
                    No wishlists found for "{searchQuery}"
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        {/* My Wishlist Section */}
        {isProfileComplete && (
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-[#778C6D]/20 overflow-hidden">
            <div className="p-6 border-b border-[#778C6D]/10">
              <h2 className="text-2xl font-bold text-[#465947]">
                Add to Wishlist
              </h2>
              <p className="text-[#778C6D] mt-1">You can add up to 10 items</p>
            </div>

            <div className="p-6">
              {/* Add New Item Form */}
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Item name"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  className="w-full p-4 bg-[#D9C6A3]/5 border border-[#778C6D]/20 rounded-lg
                           text-[#2E4034] placeholder-[#778C6D]/50
                           focus:ring-2 focus:ring-[#465947]/20 focus:border-[#465947]
                           transition-all duration-200"
                  maxLength={50}
                />
                <textarea
                  placeholder="Description"
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  className="w-full p-4 bg-[#D9C6A3]/5 border border-[#778C6D]/20 rounded-lg
                           text-[#2E4034] placeholder-[#778C6D]/50
                           focus:ring-2 focus:ring-[#465947]/20 focus:border-[#465947]
                           transition-all duration-200"
                  maxLength={200}
                  rows={3}
                />
                <button
                  onClick={addWishlistItem}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#465947] to-[#2E4034] 
                           text-white rounded-lg hover:shadow-lg transition-all duration-300
                           transform hover:-translate-y-0.5"
                >
                  Add to Wishlist
                </button>
              </div>

              {/* Wishlist Items */}
              <div className="mt-8 space-y-4">
                {wishlistItems.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-[#D9C6A3]/5 p-4 rounded-lg border border-[#778C6D]/20
                                hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-[#465947]">
                          {item.name}
                        </h3>
                        <p className="text-[#778C6D] mt-1">
                          {item.description}
                        </p>
                      </div>
                      <button
                        title="Delete"
                        onClick={() => deleteWishlistItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-red-600 
                                 hover:bg-red-50 rounded-full transition-all duration-200"
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
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
