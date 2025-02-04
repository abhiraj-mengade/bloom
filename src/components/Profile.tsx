import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

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

              {/* New Phone Input */}
              <div className="group">
                <label
                  className="block text-[#465947] font-medium mb-2 group-focus-within:text-[#2E4034]
                                transition-colors duration-200"
                >
                  Phone Number
                </label>
                <div className="phone-input-container">
                  <PhoneInput
                    international
                    defaultCountry="US"
                    value={phone}
                    onChange={(value) => setPhone(value || "")}
                    className="custom-phone-input"
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

      {/* Updated styles for the new phone input */}
      <style>{`
        .custom-phone-input {
          background: rgba(217, 198, 163, 0.05);
          border: 1px solid rgba(119, 140, 109, 0.2);
          border-radius: 0.5rem;
          padding: 0.75rem;
          width: 100%;
          color: #2E4034;
          transition: all 0.2s;
        }

        .custom-phone-input:focus-within {
          border-color: #465947;
          box-shadow: 0 0 0 2px rgba(70, 89, 71, 0.2);
        }

        .custom-phone-input input {
          background: transparent;
          border: none;
          color: #2E4034;
          font-size: 1rem;
          padding: 0;
          margin-left: 0.5rem;
          width: 100%;
        }

        .custom-phone-input input:focus {
          outline: none;
        }

        .PhoneInputCountrySelect {
          background: transparent;
          border: none;
          color: #2E4034;
          font-size: 1rem;
          padding-right: 0.5rem;
        }

        .PhoneInputCountryIcon {
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 0.25rem;
          overflow: hidden;
        }

        .PhoneInputCountrySelectArrow {
          color: #778C6D;
          opacity: 0.7;
          margin-left: 0.5rem;
        }

        /* Dropdown styles */
        .PhoneInputCountrySelect option {
          background: white;
          color: #2E4034;
          padding: 0.75rem;
        }

        /* Focus styles */
        .PhoneInputCountrySelect:focus {
          outline: none;
        }

        .PhoneInputCountrySelect:focus + .PhoneInputCountryIcon {
          box-shadow: 0 0 0 2px rgba(70, 89, 71, 0.2);
        }

        /* Invalid number styles */
        .PhoneInputInput[aria-invalid='true'] {
          border-color: #EF4444;
        }

        /* Valid number styles */
        .PhoneInputInput[aria-invalid='false'] {
          border-color: #10B981;
        }
      `}</style>
    </div>
  );
}
