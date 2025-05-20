import { useState } from "react";
import ReusableForm from "../../../ReusableForm";
import EmailField from "../common-feild/EmailField";
import logo from "../../../assets/images/otpVerify.png"
import logoVerify from "../../../assets/images/otpEnter.png"
const OtpVeriFication = () => {
    return (
        <>
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="bg-white p-10 rounded-lg w-full max-w-sm">
                    <div className="flex flex-col items-center">
                        <img src={logo} alt="SSISM Logo" />
                        <h2 className="text-2xl font-bold text-gray-800 mt-5 mb-2">Verify Your email address</h2>
                        <p className="text-sm text-gray-500">
                            Enter your Email Address
                        </p>
                    </div>

                    {/* ✅ ReusableForm properly used */}
                    <ReusableForm
                    // initialValues={initialValues}
                    // validationSchema={loginValidationSchema}
                    >
                        {(values, handleChange) => (
                            <>
                                <div className="mt-4">
                                    <EmailField value={values.email} onChange={handleChange} />
                                </div>

                                <button
                                    // onClick={navigate("/confirm-password")}
                                    type="submit"
                                    className="w-full bg-orange-500 text-white py-3 rounded-full mt-4 hover:bg-orange-600 transition"
                                >
                                    Send OTP
                                </button>
                            </>
                        )}
                    </ReusableForm>
                </div >
            </div>
            <VerifyEmail />
        </>
    )
}

export default OtpVeriFication



const VerifyEmail = () => {
    const [otp, setOtp] = useState(new Array(6).fill(""));

    const handleChange = (element, index) => {
        const val = element.value.replace(/[^0-9]/g, "");
        if (val.length > 1) return;

        let newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);

        // Move focus
        if (val && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white border rounded-2xl shadow-lg px-6 py-8 w-full max-w-md text-center">
                {/* Lock Icon */}
                <div className="flex justify-center">
                    <div className="rounded-lg p-4">
                        <img src={logoVerify} alt="SSISM Logo" />

                        {/* <FiLock className="text-white text-2xl" /> */}
                    </div>
                </div>

                {/* Heading */}
                <h2 className="text-2xl font-bold text-gray-800 mt-5 mb-2">Enter Your Valid OTP</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                </p>

                {/* OTP Inputs */}
                <div className="flex justify-center gap-2 mb-4">
                    {otp.map((data, index) => (
                        <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            maxLength="1"
                            value={data}
                            onChange={(e) => handleChange(e.target, index)}
                            className={`w-12 h-14 text-center text-xl border ${data ? "border-orange-500" : "border-gray-300"
                                } rounded-md focus:outline-none`}
                        />
                    ))}
                </div>

                {/* Change Email Link */}
                <p className="text-sm text-gray-700 mb-4">
                    Want to Change Your Email Address?{" "}
                    <a href="#" className="text-black font-semibold underline">Change Here</a>
                </p>

                {/* Submit Button */}
                <button className="w-full bg-orange-400 hover:bg-orange-500 text-white py-3 rounded-full text-lg font-semibold transition">
                    Verify Email
                </button>

                {/* Resend Link */}
                <p className="mt-4 text-sm text-gray-800">
                    <a href="#" className="underline font-medium">Resend Code</a>
                </p>
            </div>
        </div>
    );
};

