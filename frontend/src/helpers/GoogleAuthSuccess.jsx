import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";

const secretKey = "ITEG@123";

const GoogleAuthSuccess = () => {
    const navigate = useNavigate();
    const [error, setError] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get("error");

        if (errorParam === "UserNotRegistered") {
            setError("You are not registered. Please contact the admin.");
            return;
        }

        const token = params.get("token");
        const refreshToken = params.get("refreshToken");
        const userEncoded = params.get("user");

        if (token && refreshToken && userEncoded) {
            try {
                const user = JSON.parse(decodeURIComponent(userEncoded));

                const encryptedToken = CryptoJS.AES.encrypt(token, secretKey).toString();
                const encryptedRefreshToken = CryptoJS.AES.encrypt(refreshToken, secretKey).toString();

                localStorage.setItem("token", encryptedToken);
                localStorage.setItem("refreshToken", encryptedRefreshToken);
                localStorage.setItem("user", JSON.stringify(user));
                localStorage.setItem("role", user.role);
                localStorage.setItem("positionRole", user.position);

                navigate("/", { replace: true });
            } catch (err) {
                setError("Invalid user data received.");
                console.log(err);

            }
        } else {
            setError("Missing authentication information.");
        }
    }, [navigate]);

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <button
                onClick={() => navigate("/")}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Dashboard
            </button>
            {error ? (
                <div className="bg-white p-6 rounded shadow text-center">
                    <h2 className="text-red-600 font-semibold text-lg">{error}</h2>
                    <button
                        onClick={() => navigate("/login")}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Back to Login
                    </button>
                </div>
            ) : (
                <p className="text-gray-600 text-lg">Logging you in with Google...</p>
            )}
        </div>
    );
};

export default GoogleAuthSuccess;
