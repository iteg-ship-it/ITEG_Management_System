// // import Sidebar from "./../../common-components/sidebar/Sidebar";

// const StudentProfile = () => {
//   return (
//     <div className="flex bg-gray-100 min-h-screen">
      
//       <div className="ml-64 p-6 w-full">
//         {/* <h1 className="text-gray-400 text-lg mb-4">Student Profile Page</h1> */}

//         {/* Main Container */}
//         <div className="bg-white p-8 rounded-xl shadow-lg w-11/12 mx-auto">
//           {/* Placeholder for the Header Section */}
//           <div className="h-16 w-1/2 bg-gray-300 rounded-md mb-8"></div>

//           {/* Year Sections - Bigger Boxes */}
//           <div className="flex gap-8 justify-center">
//             <div className="bg-green-200 w-60 h-40 flex items-center justify-center rounded-lg shadow-md text-xl font-bold">
//               1st Year
//             </div>
//             <div className="bg-red-200 w-60 h-40 flex items-center justify-center rounded-lg shadow-md text-xl font-bold">
//               2nd Year
//             </div>
//             <div className="bg-orange-200 w-60 h-40 flex items-center justify-center rounded-lg shadow-md text-xl font-bold">
//               3rd Year
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StudentProfile;

const Dashboard = () => {
  return (
    <div className="p-6 w-full">
      {/* Top Header Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow-md h-[500px]">
        <div className="bg-gray-300 h-10 w-1/3 rounded-md mb-6"></div>

        {/* Year-wise Cards Section */}
        <div className="flex gap-6">
          <div className="flex-1 bg-green-200 p-6 rounded-lg font-semibold text-lg shadow h-[300px] w-[100px]">
            1st Year
          </div>
          <div className="flex-1 bg-red-200 p-6 rounded-lg font-semibold text-lg shadow">
            2nd Year
          </div>
          <div className="flex-1 bg-orange-200 p-6 rounded-lg font-semibold text-lg shadow">
            3rd Year
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
