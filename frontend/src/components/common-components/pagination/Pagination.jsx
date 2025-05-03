/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import del from "../../../assets/icons/delete-icon.png";
import filtericon from "../../../assets/icons/filter.png";

// Main Pagination Component
const Pagination = ({
  rowsPerPage,
  setRowsPerPage,
  searchTerm,
  setSearchTerm,
  filtersConfig, // Dynamic filters config
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const options = [10, 25, 50, 100];

  const handleSelect = (value) => {
    setRowsPerPage(value);
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-between items-center w-full flex-wrap gap-4 py-5">
      {/* Entries dropdown + action buttons */}
      <div className="flex items-center">
        <div className="relative w-fit" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="border h-10 rounded-md px-3 py-1 text-sm flex items-center gap-2 bg-white shadow-sm hover:bg-gray-100"
          >
            Show Entries: {rowsPerPage}
            <ChevronDown size={16} />
          </button>
          {showDropdown && (
            <ul className="absolute left-0 mt-1 w-full bg-white border rounded-md shadow-lg z-10">
              {options.map((option) => (
                <li
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${
                    rowsPerPage === option ? "bg-blue-100 font-semibold" : ""
                  }`}
                >
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Action buttons */}
        <button className="mx-3 bg-red-300 p-2 px-2.5 border rounded">
          <img className="h-5" src={del} alt="delete" />
        </button>
      </div>

      {/* Search and filters */}
      <FilterSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filtersConfig={filtersConfig}
      />
    </div>
  );
};

export default Pagination;

// Filter Section Component
const FilterSection = ({ searchTerm, setSearchTerm, filtersConfig }) => {
  const [showFilter, setShowFilter] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSelection = (value, setter, selected) => {
    if (selected.includes(value)) {
      setter(selected.filter((v) => v !== value));
    } else {
      setter([...selected, value]);
    }
  };

  return (
    <div className="relative flex items-center gap-2 my-1">
      {/* Filter button */}
      <button
        onClick={() => setShowFilter(!showFilter)}
        className="border border-gray-300 p-2 rounded hover:bg-gray-100 bg-white"
      >
        <img className="w-5 h-5" src={filtericon} alt="Filter" />
      </button>

      {/* Search input */}
      <div className="flex border border-gray-300 rounded-md bg-white overflow-hidden">
        <div className="flex items-center px-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="outline-none border-none focus:outline-none focus:ring-0 px-2 py-1 w-48 h-10 text-sm bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter popover */}
      {showFilter && (
        <div
          ref={filterRef}
          className="absolute top-12 right-full mr-2 w-40 bg-white border rounded-md shadow-md z-20 p-2 text-sm"
        >
          {filtersConfig.map(({ title, options, selected, setter }) => (
            <div key={title} className="relative group">
              <div
                onClick={() =>
                  setExpandedSection(expandedSection === title ? null : title)
                }
                className="flex justify-between items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
              >
                <span>{title}</span>
                <ChevronRight
                  size={14}
                  className={expandedSection === title ? "rotate-90" : ""}
                />
              </div>

              {expandedSection === title && (
                <div className="absolute top-0 left-full ml-5 w-44 bg-white border rounded-md shadow-md p-2 space-y-1 z-30">
                  {options.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(opt)}
                        onChange={() => toggleSelection(opt, setter, selected)}
                        className="accent-green-500"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// import { useState, useRef, useEffect } from "react";
// import { ChevronDown, ChevronRight, Search } from "lucide-react";
// import download from "../../../assets/icons/download-icon.png";
// import del from "../../../assets/icons/delete-icon.png";
// import filtericon from "../../../assets/icons/filter.png";
// const Pagination = ({
//   rowsPerPage,
//   setRowsPerPage,
//   searchTerm,
//   setSearchTerm,
//   selectedTracks,
//   setSelectedTracks,
//   selectedYears,
//   setSelectedYears,
//   selectedPercentages,
//   setSelectedPercentages,
// }) => {
//   const [showDropdown, setShowDropdown] = useState(false);
//   const dropdownRef = useRef(null);
//   const options = [10, 25, 50, 100];

//   const handleSelect = (value) => {
//     setRowsPerPage(value);
//     setShowDropdown(false);
//   };

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setShowDropdown(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   return (
//     <div className="flex justify-between items-center w-full flex-wrap gap-4 py-5">
//       <div className="flex">
//         <div className="relative w-fit" ref={dropdownRef}>
//           <button
//             onClick={() => setShowDropdown((prev) => !prev)}
//             className="border h-10 rounded-md px-3 py-1 text-sm flex items-center gap-2 bg-white shadow-sm hover:bg-gray-100"
//           >
//             Show Entries: {rowsPerPage}
//             <ChevronDown size={16} />
//           </button>

//           {showDropdown && (
//             <ul className="absolute left-0 mt-1 w-full bg-white border rounded-md shadow-lg z-10">
//               {options.map((option) => (
//                 <li
//                   key={option}
//                   onClick={() => handleSelect(option)}
//                   className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${
//                     rowsPerPage === option ? "bg-blue-100 font-semibold" : ""
//                   }`}
//                 >
//                   {option}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//         <button className="mx-3 bg-blue-500 px-2 border rounded">
//           <img className="" src={download} alt="download" />
//         </button>
//         <button className="bg-red-300 px-3 border rounded">
//           <img className="h-5" src={del} alt="delete" />
//         </button>
//       </div>

//       <FilterSection
//         searchTerm={searchTerm}
//         setSearchTerm={setSearchTerm}
//         selectedTracks={selectedTracks}
//         setSelectedTracks={setSelectedTracks}
//         selectedYears={selectedYears}
//         setSelectedYears={setSelectedYears}
//         selectedPercentages={selectedPercentages}
//         setSelectedPercentages={setSelectedPercentages}
//       />
//     </div>
//   );
// };

// export default Pagination;

// const FilterSection = ({
//   searchTerm,
//   setSearchTerm,
//   selectedTracks,
//   setSelectedTracks,
//   selectedYears,
//   setSelectedYears,
//   selectedPercentages,
//   setSelectedPercentages,
// }) => {
//   const [showFilter, setShowFilter] = useState(false);
//   const [expandedSection, setExpandedSection] = useState(null);
//   const filterRef = useRef(null);

//   const trackOptions = [
//     "Harda",
//     "Kannod",
//     "Khategaon",
//     "Nemawar",
//     "Nardullaganj",
//     "Satwas",
//   ];
//   const result = ["Pass", "Fail"];
//   const interview = ["50-60%", "60-70%", "70-80%", "80-90%", "90-100%"];

//   const toggleSelection = (value, listSetter, list) => {
//     if (list.includes(value)) {
//       listSetter(list.filter((v) => v !== value));
//     } else {
//       listSetter([...list, value]);
//     }
//   };

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (filterRef.current && !filterRef.current.contains(e.target)) {
//         setShowFilter(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div className="relative flex items-center gap-2 mt-4">
//       <button
//         onClick={() => setShowFilter(!showFilter)}
//         className="border border-gray-300 p-2 rounded hover:bg-gray-100 bg-white"
//       >
//         <img className="w-5 h-5" src={filtericon} alt="Filter" />
//       </button>

//       <div className="flex border border-gray-300 rounded-md bg-white overflow-hidden">
//         <div className="flex items-center px-2">
//           <Search className="w-4 h-4 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search..."
//             className="outline-none focus:outline-none focus:ring-0 px-2 py-1 w-48 h-10 text-sm bg-white"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//       </div>

//       {showFilter && (
//         <div
//           ref={filterRef}
//           className="absolute top-12 right-full mr-2 w-40 bg-white border rounded-md shadow-md z-20 p-2 text-sm"
//         >
//           {[
//             {
//               title: "Track",
//               options: trackOptions,
//               selected: selectedTracks,
//               setter: setSelectedTracks,
//             },
//             {
//               title: "Result",
//               options: result,
//               selected: selectedYears,
//               setter: setSelectedYears,
//             },
//             {
//               title: "Interview",
//               options: interview,
//               selected: selectedPercentages,
//               setter: setSelectedPercentages,
//             },
//           ].map(({ title, options, selected, setter }) => (
//             <div key={title} className="relative group">
//               <div
//                 onClick={() =>
//                   setExpandedSection(expandedSection === title ? null : title)
//                 }
//                 className="flex justify-between items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
//               >
//                 <span>{title}</span>
//                 <ChevronRight
//                   size={14}
//                   className={expandedSection === title ? "rotate-90" : ""}
//                 />
//               </div>

//               {expandedSection === title && (
//                 <div className="absolute top-0 left-full ml-5 w-44 bg-white border rounded-md shadow-md p-2 space-y-1 z-30">
//                   {options.map((opt) => (
//                     <label
//                       key={opt}
//                       className="flex items-center gap-2 cursor-pointer"
//                     >
//                       <input
//                         type="checkbox"
//                         checked={selected.includes(opt)}
//                         onChange={() => toggleSelection(opt, setter, selected)}
//                         className="accent-green-500"
//                       />
//                       {opt}
//                     </label>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };
