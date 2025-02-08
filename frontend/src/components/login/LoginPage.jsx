import React from "react";
import logo from "../../assets/images/logo.png"; // Make sure path is correct

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white rounded-2xl p-8 w-96 shadow-md">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="logo" className="h-16 w-auto" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border rounded-2xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter your email"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            className="shadow appearance-none border rounded-2xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter your password"
          />
        </div>

        <div className="mb-4">
          {" "}
          {/* Forgot password in its own div */}
          <a
            href="#"
            className="text-sm text-blue-500 hover:text-blue-700 focus:outline-none block w-full text-end"
          >
            {" "}
            {/* Added block and w-full */}
            Forgot Your Password?
          </a>
        </div>

        <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline w-full">
          {" "}
          {/* Added w-full and margin bottom */}
          Sign In
        </button>

        <div className="mt-6 flex items-center justify-center">
          {" "}
          {/* Divider and social login container */}
          <div className="border-t border-gray-500 w-24"></div>{" "}
          {/* Adjust width as needed */}
          <span className="mx-4 text-gray-600">or</span> {/* "or" text */}
          <div className="border-t border-gray-500 w-24"></div>{" "}
          {/* Adjust width as needed */}
        </div>

        <div className="flex justify-center mt-4">
          {" "}
          {/* Social login buttons */}
          <button className="bg-white hover:bg-gray-100 border border-gray-300 rounded-full p-2 mx-2 focus:outline-none">
            {/* Add your Google icon here */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M10 1c5.03 0 9 3.97 9 9s-3.97 9-9 9-9-3.97-9-9 3.97-9 9-9zm-1 16a7 7 0 110-14 7 7 0 010 14zm-8-7.5V9.5h2c0-.53.14-1.039.38-1.5H6v-1h2.38c.24-.461.38-.969.38-1.5H6V5h3c.47 0 .91.142 1.25.378A10.582 10.582 0 0113 6.5v3c-.47 0-.91-.142-1.25-.378A10.582 10.582 0 019 9.5z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button className="bg-white hover:bg-gray-100 border border-gray-300 rounded-full p-2 mx-2 focus:outline-none">
            {/* Add your LinkedIn icon here */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              {/* ... (LinkedIn SVG path) ... */}
            </svg>
          </button>
          <button className="bg-white hover:bg-gray-100 border border-gray-300 rounded-full p-2 mx-2 focus:outline-none">
            {/* Add your Facebook icon here */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              {/* ... (Facebook SVG path) ... */}
            </svg>
          </button>
        </div>

        <div className="mt-6 text-center">
          {" "}
          {/* Sign up link */}
          <p className="text-sm">
            Don't have an account?
            <a
              href="#"
              className="text-orange-500 hover:text-orange-700 ml-1 focus:outline-none"
            >
              Sign Up
            </a>
          </p>
          
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
