import React from "react";
import logo from "../../assets/images/logo.png";

const LoginPage = () => {
  return (
    <>
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="bg-white rounded p-6 w-96">
          {" "}
          {/* Added width and padding */}
          <div className="flex items-center justify-center mb-4">
            {" "}
            {/* Added margin bottom */}
            <img src={logo} alt="logo" className="h-16 w-auto" />
          </div>
          <h1 className="text-2xl text-center font-bold mb-6">Login</h1>{" "}
          {/* Added margin bottom */}
          <div className="mb-4">
            {" "}
            {/* Input 1 container with margin bottom */}
            <label
              htmlFor="username"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your username"
            />
          </div>
          <div>
            {" "}
            {/* Input 2 container */}
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your password"
            />
          </div>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 w-full">
            Login
          </button>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
