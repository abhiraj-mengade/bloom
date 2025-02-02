import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// interface ProfileData {
//   id: string;
//   name: string;
//   phone: string;
//   avatar_url: string;
// }

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      setUserId(user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setName(data.name || "");
        setPhone(data.phone || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    if (!userId) return;

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        name,
        phone,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile!");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2E4034] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D9C091] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2E4034] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
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

        {/* Header Card */}
        <div
          className="bg-gradient-to-br from-[#465947] to-[#2E4034] rounded-xl shadow-lg p-8 
                      border border-white/10 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
              <p className="text-[#D9C6A3] opacity-90">
                Customize your personal information
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
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-[#778C6D]/20 
                      overflow-hidden"
        >
          <div className="p-4 sm:p-8">
            <div className="space-y-6">
              {/* Name Input */}
              <div className="group">
                <label
                  className="block text-[#465947] font-medium mb-2 group-focus-within:text-[#2E4034]
                                transition-colors duration-200"
                >
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-4 bg-[#D9C6A3]/5 border border-[#778C6D]/20 rounded-lg
                             text-[#2E4034] placeholder-[#778C6D]/50
                             focus:ring-2 focus:ring-[#465947]/20 focus:border-[#465947]
                             transition-all duration-200 pl-12"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div className="group">
                <label
                  className="block text-[#465947] font-medium mb-2 group-focus-within:text-[#2E4034]
                                transition-colors duration-200"
                >
                  Phone Number
                </label>
                <div className="relative phone-input-container">
                  <PhoneInput
                    country={"us"}
                    value={phone}
                    onChange={(phone) => setPhone(phone)}
                    containerClass="w-full"
                    searchClass="search-class"
                    enableSearch={true}
                    disableSearchIcon={false}
                    inputStyle={{
                      width: "100%",
                      background: "rgba(217, 198, 163, 0.05)",
                      border: "1px solid rgba(119, 140, 109, 0.2)",
                      color: "#2E4034",
                      borderRadius: "0.5rem",
                      padding: "0.75rem 0.75rem 0.75rem 3.5rem",
                      fontSize: "1rem",
                      height: "3.5rem",
                    }}
                    buttonStyle={{
                      background: "rgba(217, 198, 163, 0.1)",
                      border: "1px solid rgba(119, 140, 109, 0.2)",
                      borderRight: "none",
                      borderRadius: "0.5rem 0 0 0.5rem",
                      padding: "0.75rem",
                    }}
                    dropdownStyle={{
                      width: "350px",
                      maxHeight: "400px",
                      background: "#FFFFFF",
                      border: "1px solid rgba(119, 140, 109, 0.2)",
                      borderRadius: "0.5rem",
                      boxShadow:
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    }}
                    searchStyle={{
                      width: "calc(100% - 1rem)",
                      margin: "0.5rem",
                      padding: "0.75rem",
                      border: "1px solid rgba(119, 140, 109, 0.2)",
                      borderRadius: "0.5rem",
                      backgroundColor: "rgba(217, 198, 163, 0.05)",
                    }}
                  />
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={updateProfile}
                className="w-full bg-gradient-to-r from-[#465947] to-[#2E4034] 
                         text-white py-3 px-6 rounded-lg font-medium
                         hover:shadow-lg transition-all duration-300
                         transform hover:-translate-y-0.5"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global styles */}
      <style>{`
        .phone-input-container {
          width: 100%;
        }

        .react-tel-input {
          width: 100% !important;
        }

        .react-tel-input .country-list {
          width: 350px !important;
          background-color: white !important;
          border: 1px solid rgba(119, 140, 109, 0.2) !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          margin-top: 0.25rem !important;
          max-height: 400px !important;
          overflow-y: auto !important;
          scrollbar-width: thin !important;
          scrollbar-color: #778c6d transparent !important;
          z-index: 50 !important;
        }

        .react-tel-input .country-list .country {
          padding: 0.75rem !important;
          color: #2e4034 !important;
          display: flex !important;
          align-items: center !important;
        }

        .react-tel-input .country-list .country:hover,
        .react-tel-input .country-list .country.highlight {
          background-color: rgba(217, 198, 163, 0.1) !important;
        }

        .react-tel-input .country-list .country.highlight {
          background-color: rgba(70, 89, 71, 0.1) !important;
        }

        .react-tel-input .country-list .country .dial-code {
          color: #778c6d !important;
          margin-left: auto !important;
        }

        .react-tel-input .search-class {
          width: calc(100% - 1rem) !important;
          margin: 0.5rem !important;
          padding: 0.75rem !important;
          border: 1px solid rgba(119, 140, 109, 0.2) !important;
          border-radius: 0.5rem !important;
          background-color: rgba(217, 198, 163, 0.05) !important;
          color: #2e4034 !important;
          font-size: 1rem !important;
        }

        .react-tel-input .search-class:focus {
          outline: none !important;
          border-color: #465947 !important;
          box-shadow: 0 0 0 2px rgba(70, 89, 71, 0.2) !important;
        }

        .react-tel-input .country-list .search-box {
          padding: 0.5rem !important;
          margin: 0 !important;
        }

        .react-tel-input .country-list::-webkit-scrollbar {
          width: 6px !important;
        }

        .react-tel-input .country-list::-webkit-scrollbar-track {
          background: transparent !important;
        }

        .react-tel-input .country-list::-webkit-scrollbar-thumb {
          background-color: #778c6d !important;
          border-radius: 3px !important;
        }

        .react-tel-input .flag-dropdown {
          border-radius: 0.5rem 0 0 0.5rem !important;
        }

        .react-tel-input .selected-flag {
          padding: 0 0.75rem !important;
          border-radius: 0.5rem 0 0 0.5rem !important;
        }

        .react-tel-input .selected-flag:hover,
        .react-tel-input .selected-flag:focus {
          background-color: rgba(217, 198, 163, 0.1) !important;
        }

        .react-tel-input .flag-dropdown.open .selected-flag {
          background-color: rgba(217, 198, 163, 0.1) !important;
          border-radius: 0.5rem 0 0 0.5rem !important;
        }
      `}</style>
    </div>
  );
}
