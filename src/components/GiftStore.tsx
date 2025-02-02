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

const GiftStore = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGifts();
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

        {/* Gift Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  <div className="p-6 space-y-4">
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
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

export default GiftStore;
