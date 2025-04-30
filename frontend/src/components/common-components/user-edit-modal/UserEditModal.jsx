import profile from "../../../assets/images/profile-img.png";

function UserEditModal() {
  const handleClose = () => {
    console.log();
  };

  return (
    <div className="relative bg-white rounded-md shadow-md overflow-hidden mx-auto max-w-md mt-10">
      <div className="bg-[#FCD2AA] py-6 px-9">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="flex flex-col items-center">
          <div className="relative ">
            <img
              src={profile}
              alt="Profile"
              className="rounded-full bg-white w-20 h-20 object-cover"
            />
            <span className="absolute bottom-0 right-0 bg-green-500 rounded-full w-3 h-3 border-2 border-white"></span>
          </div>
          <p className="text-gray-600 text-sm mt-2">olivia@untitledui.com</p>
          <span className=" text-black py-2 px-4 rounded-md font-bold text-xl  focus:outline-none focus:ring-2  focus:ring-offset-1 mt-2">
            Edit Profile
          </span>
        </div>
      </div>
      <div className="py-6 px-8">
        <div className="mb-4">
          <input
            type="text"
            className="w-full px-4 py-4 border rounded-xl text-gray-800 focus:outline-none focus:border-gray-700"
            placeholder="Name"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            className="w-full px-4 py-4 border rounded-xl text-gray-800 focus:outline-none   focus:border-gray-700"
            placeholder="Current Password"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            className="w-full px-4 py-4 border rounded-xl text-gray-800 focus:outline-none  focus:border-gray-700"
            placeholder="New Password"
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            className="w-full px-4 py-4 border rounded-md text-gray-800 focus:outline-none   focus:border-gray-700"
            placeholder="Confirm Password"
          />
        </div>
        <button className="w-full bg-orange-500 text-white py-4 rounded-3xl text-sm font-medium hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1">
          Save
        </button>
      </div>
    </div>
  );
}

export default UserEditModal;
