/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo } from "react";
import Pagination from "../common-components/pagination/Pagination";
import { useGetReadyStudentsForPlacementQuery } from "../../redux/api/authApi";
import Loader from "../common-components/loader/Loader";
import CommonTable from "../common-components/table/CommonTable";
import ScheduleInterviewModal from "./ScheduleInterviewModal";
import profile from "../../assets/images/profileImgDummy.jpeg";

// Capitalize function
const toTitleCase = (str) =>
  str
    ?.toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const PlacementReadyStudents = () => {
  const { data = {}, isLoading } = useGetReadyStudentsForPlacementQuery();
  const students = data?.data || [];

  const [rowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [selectedResults, setSelectedResults] = useState([]);
  const [selectedPercentages] = useState([]);
  const [activeTab, setActiveTab] = useState("Qualified Students");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const tabs = ["Qualified Students", "Ongoing Interviews", "Selected Student"];

  const dynamicTrackOptions = useMemo(() => {
    return [...new Set(students.map((s) => toTitleCase(s.track || "")))].filter(Boolean);
  }, [students]);

  const dynamicResultOptions = useMemo(() => {
    return [
      ...new Set(
        students.flatMap((s) =>
          s.interviews?.map((i) => toTitleCase(i.result || "")) || []
        )
      ),
    ].filter(Boolean);
  }, [students]);

  const filtersConfig = [
    {
      title: "Track",
      options: dynamicTrackOptions,
      selected: selectedTracks,
      setter: setSelectedTracks,
    },
    {
      title: "Result",
      options: dynamicResultOptions,
      selected: selectedResults,
      setter: setSelectedResults,
    },
  ];

  const getLatestInterviewResult = (interviews = []) => {
    if (!interviews.length) return null;
    return [...interviews]
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.result;
  };

  const getFilteredData = () => {
    let filtered = [...students];

    // 🌐 Tab-specific filtering
    if (activeTab === "Ongoing Interviews") {
      filtered = filtered.filter(
        (s) => Array.isArray(s.interviewRecord) && s.interviewRecord.length > 0
      );
    } else if (activeTab === "Qualified Students") {
      filtered = filtered.filter(
        (s) => !s.interviewRecord || s.interviewRecord.length === 0
      );
    } else if (activeTab === "Selected Student") {
      filtered = filtered.filter(
        (s) =>
          Array.isArray(s.interviewRecord) &&
          s.interviewRecord.some(
            (rec) => rec.result?.toLowerCase() === "selected"
          )
      );
    }

    // 🧠 Apply filter + search
    return filtered.filter((student) => {
      const track = toTitleCase(student.track || "");
      const latestResult = toTitleCase(
        getLatestInterviewResult(student.interviews || []) || ""
      );
      const percentage = student.interviewPercentage || 0;

      const trackMatch =
        selectedTracks.length === 0 || selectedTracks.includes(track);
      const resultMatch =
        selectedResults.length === 0 ||
        selectedResults.includes(latestResult);
      const percentageMatch =
        selectedPercentages.length === 0 ||
        selectedPercentages.some((range) => {
          const [min, max] = range.replace("%", "").split("-").map(Number);
          return percentage >= min && percentage <= max;
        });

      const searchMatch =
        searchTerm.trim() === "" ||
        `${student.firstName} ${student.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentMobile?.includes(searchTerm);

      return (
        trackMatch && resultMatch && percentageMatch && searchMatch
      );
    });
  };

  const columns = [
    {
      key: "profile",
      label: "Full Name",
      render: (row) => (
        <div className="flex items-center gap-2">
          <img
            src={row.image || profile}
            alt="avatar"
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">{`${row.firstName} ${row.lastName}`}</span>
            <span className="text-xs text-gray-500">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "fatherName",
      label: "Father Name",
      render: (row) => toTitleCase(row.fatherName),
    },
    {
      key: "studentMobile",
      label: "Mobile no.",
      render: (row) => `+91 ${row.studentMobile}`,
    },
    {
      key: "techno",
      label: "Technology",
      render: (row) => toTitleCase(row.techno),
    },
    {
      key: "course",
      label: "Course",
      render: (row) => toTitleCase(row.course),
    },
  ];

  const actionButton = (student) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setSelectedStudent(student);
        setIsModalOpen(true);
      }}
      className="bg-orange-400 text-md text-white px-3 py-1 rounded"
    >
      + Add Interview
    </button>
  );

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("admissionActiveTab", tab);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl py-4 font-bold">Placement Process</h1>
      <div className="mt-1 border bg-[var(--backgroundColor)] shadow-sm rounded-lg">
        <div className="px-6">
          {/* Tabs */}
          <div className="flex gap-6 mt-4">
            {tabs.map((tab) => (
              <p
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`cursor-pointer text-md text-[var(--text-color)] pb-2 border-b-2 ${
                  activeTab === tab
                    ? "border-[var(--text-color)] font-semibold"
                    : "border-gray-200"
                }`}
              >
                {tab}
              </p>
            ))}
          </div>

          {/* Filters + Search */}
          <div className="flex justify-between items-center flex-wrap gap-4">
            <Pagination
              rowsPerPage={rowsPerPage}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filtersConfig={filtersConfig}
            />
          </div>
        </div>

        {/* Table */}
        <CommonTable
          columns={columns}
          data={getFilteredData()}
          editable={true}
          pagination={true}
          rowsPerPage={rowsPerPage}
          searchTerm={searchTerm}
          actionButton={actionButton}
        />

        {/* Modal */}
        <ScheduleInterviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          studentId={selectedStudent?._id}
        />
      </div>
    </>
  );
};

export default PlacementReadyStudents;



// /* eslint-disable react-hooks/exhaustive-deps */
// import { useState, useMemo } from "react";
// import Pagination from "../common-components/pagination/Pagination";
// import { useGetReadyStudentsForPlacementQuery } from "../../redux/api/authApi";
// import Loader from "../common-components/loader/Loader";
// import CommonTable from "../common-components/table/CommonTable";
// import ScheduleInterviewModal from "./ScheduleInterviewModal";
// import profile from "../../assets/images/profileImgDummy.jpeg";

// // Capitalize function
// const toTitleCase = (str) =>
//   str
//     ?.toLowerCase()
//     .split(" ")
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(" ");

// const PlacementReadyStudents = () => {
//   const { data = {}, isLoading } = useGetReadyStudentsForPlacementQuery();
//   const students = data?.data || [];

//   const [rowsPerPage] = useState(10);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedTracks, setSelectedTracks] = useState([]);
//   const [selectedResults, setSelectedResults] = useState([]);
//   const [selectedPercentages] = useState([]);
//   const [activeTab, setActiveTab] = useState("Qualified Students");

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState(null);

//   const tabs = ["Qualified Students", "Ongoing Interviews", "Selected Student"];

//   const dynamicTrackOptions = useMemo(() => {
//     return [...new Set(students.map((s) => toTitleCase(s.track || "")))].filter(Boolean);
//   }, [students]);

//   const dynamicResultOptions = useMemo(() => {
//     return [
//       ...new Set(
//         students.flatMap((s) =>
//           s.interviews?.map((i) => toTitleCase(i.result || "")) || []
//         )
//       ),
//     ].filter(Boolean);
//   }, [students]);

//   const filtersConfig = [
//     {
//       title: "Track",
//       options: dynamicTrackOptions,
//       selected: selectedTracks,
//       setter: setSelectedTracks,
//     },
//     {
//       title: "Result",
//       options: dynamicResultOptions,
//       selected: selectedResults,
//       setter: setSelectedResults,
//     },
//   ];

//   const getLatestInterviewResult = (interviews = []) => {
//     if (!interviews.length) return null;
//     return [...interviews]
//       .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.result;
//   };

//   const getFilteredData = () => {
//     let filtered = [...students];

//     // 🌐 Tab-specific filtering
//     if (activeTab === "Ongoing Interviews") {
//       filtered = filtered.filter((s) => Array.isArray(s.interviewRecord) && s.interviewRecord.length > 0);
//     } else if (activeTab === "Qualified Students") {
//       filtered = filtered.filter((s) => !s.interviewRecord || s.interviewRecord.length === 0);
//     } else if (activeTab === "Selected Student") {
//       // Customize this condition as per your logic (example below)
//       filtered = filtered.filter((s) =>
//         s.interviewRecord?.some((rec) => rec.result?.toLowerCase() === "pass")
//       );
//     }

//     // 🧠 Apply filter + search
//     return filtered.filter((student) => {
//       const track = toTitleCase(student.track || "");
//       const latestResult = toTitleCase(getLatestInterviewResult(student.interviews || []) || "");
//       const percentage = student.interviewPercentage || 0;

//       const trackMatch = selectedTracks.length === 0 || selectedTracks.includes(track);
//       const resultMatch = selectedResults.length === 0 || selectedResults.includes(latestResult);
//       const percentageMatch =
//         selectedPercentages.length === 0 ||
//         selectedPercentages.some((range) => {
//           const [min, max] = range.replace("%", "").split("-").map(Number);
//           return percentage >= min && percentage <= max;
//         });

//       const searchMatch =
//         searchTerm.trim() === "" ||
//         `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         student.studentMobile?.includes(searchTerm);

//       return trackMatch && resultMatch && percentageMatch && searchMatch;
//     });
//   };

//   const columns = [
//     {
//       key: "profile",
//       label: "Full Name",
//       render: (row) => (
//         <div className="flex items-center gap-2">
//           <img
//             src={row.image || profile}
//             alt="avatar"
//             className="w-9 h-9 rounded-full object-cover"
//           />
//           <div className="flex flex-col">
//             <span className="font-medium text-gray-800">{`${row.firstName} ${row.lastName}`}</span>
//             <span className="text-xs text-gray-500">{row.email}</span>
//           </div>
//         </div>
//       ),
//     },
//     { key: "fatherName", label: "Father Name", render: (row) => toTitleCase(row.fatherName) },
//     {
//       key: "studentMobile",
//       label: "Mobile no.",
//       render: (row) => `+91 ${row.studentMobile}`,
//     },
//     { key: "techno", label: "Technology", render: (row) => toTitleCase(row.techno) },
//     { key: "course", label: "Course", render: (row) => toTitleCase(row.course) },
//   ];

//   const actionButton = (student) => (
//     <button
//       onClick={(e) => {
//         e.stopPropagation();
//         setSelectedStudent(student);
//         setIsModalOpen(true);
//       }}
//       className="bg-orange-400 text-md text-white px-3 py-1 rounded"
//     >
//       + Add Interview
//     </button>
//   );

//   const handleTabClick = (tab) => {
//     setActiveTab(tab);
//     localStorage.setItem("admissionActiveTab", tab);
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white">
//         <Loader />
//       </div>
//     );
//   }

//   return (
//     <>
//       <h1 className="text-3xl py-4 font-bold">Admission Process</h1>
//       <div className="mt-1 border bg-[var(--backgroundColor)] shadow-sm rounded-lg">
//         <div className="px-6">
//           {/* Tabs */}
//           <div className="flex gap-6 mt-4">
//             {tabs.map((tab) => (
//               <p
//                 key={tab}
//                 onClick={() => handleTabClick(tab)}
//                 className={`cursor-pointer text-md text-[var(--text-color)] pb-2 border-b-2 ${
//                   activeTab === tab
//                     ? "border-[var(--text-color)] font-semibold"
//                     : "border-gray-200"
//                 }`}
//               >
//                 {tab}
//               </p>
//             ))}
//           </div>

//           {/* Filters + Search */}
//           <div className="flex justify-between items-center flex-wrap gap-4">
//             <Pagination
//               rowsPerPage={rowsPerPage}
//               searchTerm={searchTerm}
//               setSearchTerm={setSearchTerm}
//               filtersConfig={filtersConfig}
//             />
//           </div>
//         </div>

//         {/* Table */}
//         <CommonTable
//           columns={columns}
//           data={getFilteredData()}
//           editable={true}
//           pagination={true}
//           rowsPerPage={rowsPerPage}
//           searchTerm={searchTerm}
//           actionButton={actionButton}
//         />

//         {/* Modal */}
//         <ScheduleInterviewModal
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           studentId={selectedStudent?._id}
//         />
//       </div>
//     </>
//   );
// };

// export default PlacementReadyStudents;




// // /* eslint-disable react-hooks/exhaustive-deps */
// // import { useState, useMemo } from "react";
// // import Pagination from "../common-components/pagination/Pagination";
// // import {
// //   useGetReadyStudentsForPlacementQuery,
// // } from "../../redux/api/authApi";
// // import Loader from "../common-components/loader/Loader";
// // import CommonTable from "../common-components/table/CommonTable";
// // import ScheduleInterviewModal from "./ScheduleInterviewModal";
// // import profile from "../../assets/images/profileImgDummy.jpeg";

// // // Capitalize function
// // const toTitleCase = (str) =>
// //   str
// //     ?.toLowerCase()
// //     .split(" ")
// //     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
// //     .join(" ");

// // const PlacementReadyStudents = () => {
// //   const { data = {}, isLoading } = useGetReadyStudentsForPlacementQuery();
// //   const students = data?.data || [];

// //   const [rowsPerPage] = useState(10);
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [selectedTracks, setSelectedTracks] = useState([]);
// //   const [selectedResults, setSelectedResults] = useState([]);
// //   const [selectedPercentages] = useState([]);
// //   const [activeTab, setActiveTab] = useState("Qualified Students");

// //   const [isModalOpen, setIsModalOpen] = useState(false);
// //   const [selectedStudent, setSelectedStudent] = useState(null);

// //   const tabs = [
// //     "Qualified Students",
// //     "Ongoing Interviews",
// //     "Selected Student",
// //   ];

// //   // Dynamic filter options
// //   const dynamicTrackOptions = useMemo(() => {
// //     return [...new Set(students.map((s) => toTitleCase(s.track || "")))].filter(Boolean);
// //   }, [students]);

// //   const dynamicResultOptions = useMemo(() => {
// //     return [
// //       ...new Set(
// //         students.flatMap((s) =>
// //           s.interviews?.map((i) => toTitleCase(i.result || "")) || []
// //         )
// //       ),
// //     ].filter(Boolean);
// //   }, [students]);

// //   const filtersConfig = [
// //     {
// //       title: "Track",
// //       options: dynamicTrackOptions,
// //       selected: selectedTracks,
// //       setter: setSelectedTracks,
// //     },
// //     {
// //       title: "Result",
// //       options: dynamicResultOptions,
// //       selected: selectedResults,
// //       setter: setSelectedResults,
// //     },
  
// //   ];

// //   const getLatestInterviewResult = (interviews = []) => {
// //     if (!interviews.length) return null;
// //     return [...interviews]
// //       .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.result;
// //   };

// //   const getFilteredData = () => {
// //     return students.filter((student) => {
// //       const track = toTitleCase(student.track || "");
// //       const latestResult = toTitleCase(getLatestInterviewResult(student.interviews || []) || "");
// //       const percentage = student.interviewPercentage || 0;

// //       const trackMatch =
// //         selectedTracks.length === 0 || selectedTracks.includes(track);
// //       const resultMatch =
// //         selectedResults.length === 0 || selectedResults.includes(latestResult);
// //       const percentageMatch =
// //         selectedPercentages.length === 0 ||
// //         selectedPercentages.some((range) => {
// //           const [min, max] = range.replace("%", "").split("-").map(Number);
// //           return percentage >= min && percentage <= max;
// //         });

// //       const searchMatch =
// //         searchTerm.trim() === "" ||
// //         `${student.firstName} ${student.lastName}`
// //           .toLowerCase()
// //           .includes(searchTerm.toLowerCase()) ||
// //         student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //         student.studentMobile?.includes(searchTerm);

// //       return trackMatch && resultMatch && percentageMatch && searchMatch;
// //     });
// //   };

// //   const columns = [
// //     {
// //       key: "profile",
// //       label: "Full Name",
// //       render: (row) => (
// //         <div className="flex items-center gap-2">
// //           <img
// //             src={row.image || profile}
// //             alt="avatar"
// //             className="w-9 h-9 rounded-full object-cover"
// //           />
// //           <div className="flex flex-col">
// //             <span className="font-medium text-gray-800">{`${row.firstName} ${row.lastName}`}</span>
// //             <span className="text-xs text-gray-500">{row.email}</span>
// //           </div>
// //         </div>
// //       ),
// //     },
// //     { key: "fatherName", label: "Father Name", render: (row) => toTitleCase(row.fatherName) },
// //     {
// //       key: "studentMobile",
// //       label: "Mobile no.",
// //       render: (row) => `+91 ${row.studentMobile}`,
// //     },
// //     { key: "techno", label: "Technology", render: (row) => toTitleCase(row.techno) },
// //     { key: "course", label: "Course", render: (row) => toTitleCase(row.course) },
// //   ];

// //   const actionButton = (student) => (
// //     <button
// //       onClick={(e) => {
// //         e.stopPropagation();
// //         setSelectedStudent(student);
// //         setIsModalOpen(true);
// //       }}
// //       className="bg-orange-400 text-md text-white px-3 py-1 rounded"
// //     >
// //       + Add Interview
// //     </button>
// //   );

// //   const handleTabClick = (tab) => {
// //     setActiveTab(tab);
// //     localStorage.setItem("admissionActiveTab", tab);
// //   };

// //   if (isLoading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-white">
// //         <Loader />
// //       </div>
// //     );
// //   }

// //   return (
// //     <>
// //       <h1 className="text-3xl py-4 font-bold">Admission Process</h1>
// //       <div className="mt-1 border bg-[var(--backgroundColor)] shadow-sm rounded-lg">
// //         <div className="px-6">
// //           {/* Tabs */}
// //           <div className="flex gap-6 mt-4">
// //             {tabs.map((tab) => (
// //               <p
// //                 key={tab}
// //                 onClick={() => handleTabClick(tab)}
// //                 className={`cursor-pointer text-md text-[var(--text-color)] pb-2 border-b-2 ${
// //                   activeTab === tab
// //                     ? "border-[var(--text-color)] font-semibold"
// //                     : "border-gray-200"
// //                 }`}
// //               >
// //                 {tab}
// //               </p>
// //             ))}
// //           </div>

// //           {/* Filters + Search */}
// //           <div className="flex justify-between items-center flex-wrap gap-4">
// //             <Pagination
// //               rowsPerPage={rowsPerPage}
// //               searchTerm={searchTerm}
// //               setSearchTerm={setSearchTerm}
// //               filtersConfig={filtersConfig}
// //             />
// //           </div>
// //         </div>

// //         {/* Table */}
// //         <CommonTable
// //           columns={columns}
// //           data={getFilteredData()}
// //           editable={true}
// //           pagination={true}
// //           rowsPerPage={rowsPerPage}
// //           searchTerm={searchTerm}
// //           actionButton={actionButton}
// //         />

// //         {/* Modal */}
// //         <ScheduleInterviewModal
// //           isOpen={isModalOpen}
// //           onClose={() => setIsModalOpen(false)}
// //           studentId={selectedStudent?._id}
// //         />
// //       </div>
// //     </>
// //   );
// // };

// // export default PlacementReadyStudents;
