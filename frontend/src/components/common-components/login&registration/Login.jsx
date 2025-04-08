// import React from "react";

const Login = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <div className="flex flex-col items-center">
          <img
            src="./src/assets/images/logo.png"
            alt="SSISM Logo"
            className="w-16 h-16 mb-4"
          />
          <h2 className="text-2xl font-bold">Login</h2>
        </div>
        
        <div className="mt-6">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <p className="text-right text-sm text-gray-500">Forgot Your Password</p>
        </div>

        <button className="w-full bg-orange-500 text-white py-3 rounded-lg mt-4 hover:bg-orange-600 transition">
          Sign in
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="flex justify-center gap-4">
          <button className="p-2 border rounded-full hover:bg-gray-200" >
            {/* <a href="https://www.google.com/"> </a> */}
            <img src="./src/assets/images/Google.png" alt="Google" className="w-6 h-6" />
          </button>
          <button className="p-2 border rounded-full hover:bg-gray-200">
            <img src="./src/assets/images/linkedin.png" alt="LinkedIn" className="w-6 h-6" />
          </button>
          <button className="p-2 border rounded-full hover:bg-gray-300">
            <img src="./src/assets/images/FB.png" alt="Facebook" className="w-6 h-6" />
          </button>
        </div>

        <p className="text-center mt-4 text-gray-600">Don't have an account? <span className="text-orange-500 cursor-pointer">Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
