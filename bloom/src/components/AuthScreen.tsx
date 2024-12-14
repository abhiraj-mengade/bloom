import { useState } from "react";

interface AuthScreenProps {
  onLogin: () => void;
}

const AuthScreen = ({ onLogin }: AuthScreenProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setShowOtpInput(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md mx-auto p-6 sm:p-8 space-y-6 sm:space-y-8">
        <div className="text-center space-y-2 sm:space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            bloom
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Connect. Celebrate. Cherish.
          </p>
        </div>

        <form
          className="space-y-4 sm:space-y-6"
          onSubmit={showOtpInput ? handleVerifyOtp : handleSendOtp}
        >
          <div className="space-y-4">
            <div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 
                          placeholder-gray-500 text-gray-900 
                          focus:outline-none focus:ring-2 focus:ring-primary 
                          focus:border-primary transition-all duration-200
                          text-base sm:text-lg"
              />
            </div>

            {showOtpInput && (
              <div className="transition-all duration-300 ease-in-out">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 
                            placeholder-gray-500 text-gray-900 
                            focus:outline-none focus:ring-2 focus:ring-primary 
                            focus:border-primary transition-all duration-200
                            text-base sm:text-lg"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 text-base sm:text-lg font-medium 
                     rounded-lg text-white bg-primary 
                     hover:bg-secondary focus:outline-none 
                     focus:ring-2 focus:ring-offset-2 focus:ring-primary 
                     transition-colors duration-200
                     active:transform active:scale-[0.98]"
          >
            {showOtpInput ? "Verify OTP" : "Send OTP"}
          </button>
        </form>

        <div className="space-y-4 sm:space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-sm sm:text-base bg-gray-50 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="w-full flex items-center justify-center py-3 px-4 
                       border border-gray-300 rounded-lg shadow-sm bg-white 
                       text-sm sm:text-base font-medium text-gray-500 
                       hover:bg-gray-50 transition-colors duration-200
                       active:transform active:scale-[0.98]"
            >
              Google
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center py-3 px-4 
                       border border-gray-300 rounded-lg shadow-sm bg-white 
                       text-sm sm:text-base font-medium text-gray-500 
                       hover:bg-gray-50 transition-colors duration-200
                       active:transform active:scale-[0.98]"
            >
              Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
