// src/pages/auth/GoogleAuthSuccess.jsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";

const secretKey = "ITEG@123";

const GoogleAuthSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        const user = JSON.parse(decodeURIComponent(urlParams.get("user")));

        if (token && user) {
            const encryptedToken = CryptoJS.AES.encrypt(token, secretKey).toString();

            localStorage.setItem("token", encryptedToken);
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("role", user.role);
            localStorage.setItem("positionRole", user.positionRole);

            navigate("/", { replace: true });
        } else {
            navigate("/login");
        }
    }, [navigate]);

    return (
        <div className="flex justify-center items-center h-screen">
            <p className="text-gray-700 text-xl font-medium">Logging in with Google...</p>
        </div>
    );
};

export default GoogleAuthSuccess;
