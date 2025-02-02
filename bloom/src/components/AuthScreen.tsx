import { useState } from "react";
import { supabase } from "../lib/supabase";

const AuthScreen = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      alert("Check your email for the login link!");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        background: `linear-gradient(135deg, #2E4034 0%, #465947 100%)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 space-y-8 border border-[#778C6D]/20">
        {/* Logo and Tagline */}
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center justify-center space-y-3">
            <h1
              className="text-6xl font-bold"
              style={{
                background: `linear-gradient(135deg, #465947 0%, #2E4034 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              bloom
            </h1>
            <div className="flex items-center space-x-3">
              <span className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#778C6D] to-transparent" />
              <span className="text-sm uppercase tracking-widest text-[#465947] font-medium">
                nurture connections
              </span>
              <span className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#778C6D] to-transparent" />
            </div>
          </div>
          <p className="text-lg font-medium text-[#465947]">
            Connect. Celebrate. Cherish.
          </p>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#465947]"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3.5 rounded-xl text-lg
                         bg-[#D9C091]/5 border-2 border-[#778C6D]/20 
                         text-[#2E4034] placeholder-[#778C6D]/50
                         focus:border-[#465947] focus:bg-white/50
                         focus:ring-2 focus:ring-[#465947]/20 
                         transition-all duration-300 outline-none"
              />
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#778C6D]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 text-lg font-medium rounded-xl text-white
                     transition-all duration-300 hover:shadow-lg 
                     transform hover:-translate-y-0.5
                     disabled:opacity-50 disabled:cursor-not-allowed
                     bg-gradient-to-r from-[#2E4034] to-[#465947]
                     hover:from-[#465947] hover:to-[#2E4034]
                     focus:ring-2 focus:ring-[#778C6D]/50 focus:ring-offset-2
                     focus:ring-offset-white/90"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Sending Magic Link...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
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
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
                <span>Sign in with Email</span>
              </div>
            )}
          </button>

          <p className="text-center text-sm text-[#778C6D]">
            We'll send you a magic link to sign in securely
          </p>
        </form>

        {/* Footer */}
        <div className="text-center space-y-4">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#778C6D]/20 to-transparent" />
          <p className="text-xs text-[#778C6D]">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
