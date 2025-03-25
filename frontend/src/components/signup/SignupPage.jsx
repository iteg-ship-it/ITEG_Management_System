import React from "react";
import logo from "../../assets/images/logo.png"; // Make sure path is correct

const SignupPage = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      {" "}
      {/* Full screen, column on mobile, row on medium+ */}
      {/* First Column (Left on larger screens) */}
      <div className="md:w-1/2 md:p-16 p-8 flex items-center justify-center">
        <div className="w-full md:w-96">
          {" "}
          {/* Container for form content */}
          <div className="flex justify-center mb-6">
            <img src={logo} alt="logo" className="h-16 w-auto" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>
          <div className="mb-4 flex space-x-2">
            <div className="w-1/2">
              <label
                htmlFor="firstName"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                className="shadow appearance-none border rounded-2xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="First Name"
              />
            </div>
            <div className="w-1/2">
              <label
                htmlFor="lastName"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                className="shadow appearance-none border rounded-2xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Last Name"
              />
            </div>
          </div>
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
          <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline w-full">
            Sign Up
          </button>
          <div className="mt-6 text-center">
            <p className="text-sm">
              Already have an account?
              <a
                href="#"
                className="text-orange-500 hover:text-orange-700 ml-1 focus:outline-none"
              >
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
      {/* Second Column (Right on larger screens) - You can add content here */}
      <div className="md:w-1/2 md:p-16 p-8 flex items-center justify-center bg-gray-200">
        {" "}
        {/* Example background color */}
        {/* Add your image, information, or other content here */}
        <div>
          <h1 className="text-3xl font-bold text-center mb-4">
            Welcome to Our Platform!
          </h1>
          <p className="text-lg text-center">
            Some descriptive text about your platform or benefits of signing up.
          </p>
          {/* <img src={yourImage} alt="Promotional" className="max-w-full h-auto rounded-lg shadow-md"/> */}
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
