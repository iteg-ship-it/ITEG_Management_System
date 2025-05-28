// // GoogleSuccess.jsx
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// const GoogleSuccess = () => {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const queryParams = new URLSearchParams(window.location.search);
//     const token = queryParams.get("token");
//     const refreshToken = queryParams.get("refreshToken");
//     const userId = queryParams.get("userId");
//     const name = queryParams.get("name");
//     const role = queryParams.get("role");
//     const email = queryParams.get("email");

//     if (token && refreshToken && userId) {
//       // ✅ Save all necessary values to localStorage
//       localStorage.setItem("token", token);
//       localStorage.setItem("refreshToken", refreshToken);
//       localStorage.setItem("userId", userId);
//       localStorage.setItem("name", name);
//       localStorage.setItem("role", role);
//       localStorage.setItem("email", email);

//       // 🔄 Optional: Redirect to dashboard after small delay
//       setTimeout(() => {
//         navigate("/", { replace: true });
//       }, 1000);
//     } else {
//       // If token missing, go to login
//       navigate("/login");
//     }
//   }, [navigate]);

//   return (
//     <div className="text-center p-10">
//       <h2 className="text-xl font-bold">Logging you in...</h2>
//     </div>
//   );
// };

// export default GoogleSuccess;



// // GoogleSuccess.jsx
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import CryptoJS from "crypto-js";

// const GoogleSuccess = () => {
//   const navigate = useNavigate();
//   const secretKey = "ITEG@123"; // same as LoginPage

//   useEffect(() => {
//     const queryParams = new URLSearchParams(window.location.search);
//     const token = queryParams.get("token");
//     const refreshToken = queryParams.get("refreshToken");
//     const userId = queryParams.get("userId");
//     const name = queryParams.get("name");
//     const role = queryParams.get("role");
//     const email = queryParams.get("email");

//     if (token && refreshToken && userId) {
//       // ✅ Encrypt the token before storing
//       const encryptedToken = CryptoJS.AES.encrypt(token, secretKey).toString();
//       const encryptedRefreshToken = CryptoJS.AES.encrypt(refreshToken, secretKey).toString();

//       localStorage.setItem("token", encryptedToken);
//       localStorage.setItem("refreshToken", encryptedRefreshToken);
//       localStorage.setItem("userId", userId);
//       localStorage.setItem("name", name);
//       localStorage.setItem("role", role);
//       localStorage.setItem("email", email);

//       setTimeout(() => {
//         navigate("/", { replace: true });
//       }, 1000);
//     } else {
//       navigate("/login");
//     }
//   }, [navigate]);

//   return (
//     <div className="text-center p-10">
//       <h2 className="text-xl font-bold">Logging you in...</h2>
//     </div>
//   );
// };

// export default GoogleSuccess;



import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";

const GoogleSuccess = () => {
  const navigate = useNavigate();
  const secretKey = "ITEG@123"; // same as LoginPage

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");
    const refreshToken = queryParams.get("refreshToken");
    const userId = queryParams.get("userId");
    const name = queryParams.get("name");
    const role = queryParams.get("role");
    const email = queryParams.get("email");

    if (token && refreshToken && userId) {
      // ✅ Encrypt tokens
      const encryptedToken = CryptoJS.AES.encrypt(token, secretKey).toString();
      const encryptedRefreshToken = CryptoJS.AES.encrypt(refreshToken, secretKey).toString();

      // ✅ Save encrypted tokens
      localStorage.setItem("token", encryptedToken);
      localStorage.setItem("refreshToken", encryptedRefreshToken);

      // ✅ Save user as object
      const user = {
        id: userId,
        name,
        email,
        role,
      };
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", role); // if you still rely on role directly

      // ✅ Redirect to dashboard
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="text-center p-10">
      <h2 className="text-xl font-bold">Logging you in...</h2>
    </div>
  );
};

export default GoogleSuccess;
