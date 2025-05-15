import { useState } from "react";
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
} from "../../../redux/api/authApi";
import UserProfile from "../../common-components/user-profile/UserProfile";

const AdmissionDashboard = () => {
  return (
    <>
      <UserProfile heading="Admission Dashboard" />
      <SendOtpForm />
      <OtpVerifier />
    </>
  );
};

export default AdmissionDashboard;

const SendOtpForm = () => {
  const [email, setEmail] = useState("");
  const [sendOtp, { isLoading, isSuccess, error }] = useSendOtpMutation();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await sendOtp({ email }).unwrap();
      console.log("OTP sent successfully:", response);
      // Show a toast or redirect
    } catch (err) {
      console.error("Failed to send OTP:", err);
      // Handle error (e.g., show message)
    }
  };

  return (
    <form onSubmit={handleSendOtp} className="max-w-md mx-auto space-y-4">
      <input
        type="email"
        placeholder="Enter your email"
        className="border rounded px-4 py-2 w-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded"
        disabled={isLoading}
      >
        {isLoading ? "Sending OTP..." : "Send OTP"}
      </button>

      {isSuccess && <p className="text-green-600">OTP sent!</p>}
      {error && <p className="text-red-600">Failed to send OTP.</p>}
    </form>
  );
};

const OtpVerifier = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [status, setStatus] = useState(null);

  const handleVerify = async () => {
    try {
      const response = await verifyOtp({ email, otp }).unwrap();
      console.log("OTP is valid:", response);
      setStatus({ type: "success", message: "✅ OTP is valid." });
    } catch (err) {
      console.error("Invalid OTP:", err);
      setStatus({ type: "error", message: "❌ OTP is invalid or expired." });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Verify OTP</h2>

      <input
        type="email"
        className="w-full border px-3 py-2 rounded mb-3"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="text"
        className="w-full border px-3 py-2 rounded mb-3"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        required
      />

      <button
        onClick={handleVerify}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        disabled={isLoading}
      >
        {isLoading ? "Verifying..." : "Verify OTP"}
      </button>

      {status && (
        <p
          className={`mt-3 text-sm ${
            status.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {status.message}
        </p>
      )}
    </div>
  );
};
