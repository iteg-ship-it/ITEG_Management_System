/* eslint-disable react/prop-types */
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  totalPages = 1,
  onPageChange,
  label = "users",
}) => {

  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const visiblePages = [];
  for (let i = 1; i <= totalPages; i++) visiblePages.push(i);

  return (
    <div className="flex items-center justify-between bg-gray-100 rounded-xl px-6 py-4 mt-4">

      {/* left text */}
      <div className="text-sm text-gray-600">
        Showing {start} to {end} of {totalItems} {label}
      </div>

      {/* buttons */}
      <div className="flex items-center gap-2">

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-9 h-9 flex items-center justify-center border rounded-lg bg-white disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>

        {visiblePages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-lg text-sm font-medium
              ${currentPage === p
                ? "bg-orange-500 text-white"
                : "bg-white border text-gray-700"}
            `}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-9 h-9 flex items-center justify-center border rounded-lg bg-white disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>

      </div>
    </div>
  );
};

export default Pagination;


// // File: components/Pagination.jsx
// /* eslint-disable react/prop-types */
// import { useState, useRef, useEffect, useMemo } from "react";
// import { Search, ChevronRight } from "lucide-react";
// import { FaFilter } from "react-icons/fa";
// import { BsFillCloudDownloadFill } from "react-icons/bs";

// import {
//   downloadCSV,
//   downloadExcel,
//   downloadPDF,
//   toggleSelection,
// } from "../../../helpers/DownloadHelpers";

// const Pagination = ({
//   searchTerm,
//   setSearchTerm,
//   filtersConfig,
//   allData = [],
//   selectedRows = [],
//   sectionName = "data",
// }) => {
//   const [showFilter, setShowFilter] = useState(false);
//   const [downloadDropdown, setDownloadDropdown] = useState(false);
//   const [expandedSection, setExpandedSection] = useState(null);

//   const filterRef = useRef(null);
//   const downloadRef = useRef(null);

//   // ✅ Search logic (skip ID and number fields)
//   const filteredData = useMemo(() => {
//     if (!searchTerm) return allData;

//     return allData.filter((row) =>
//       Object.entries(row).some(([key, val]) => {
//         if (val == null) return false;

//         // 🚫 Ignore ID fields and numbers
//         if (key.toLowerCase().includes('id') || key === '_id') return false;
//         if (typeof val === "number") return false;

//         // ✅ Match only string fields
//         return String(val).toLowerCase().includes(searchTerm.toLowerCase());
//       })
//     );
//   }, [allData, searchTerm]);

//   // Close dropdowns on outside click
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (!filterRef.current?.contains(e.target)) setShowFilter(false);
//       if (!downloadRef.current?.contains(e.target))
//         setDownloadDropdown(false);
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () =>
//       document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div className="flex items-center w-full py-5 flex-wrap gap-4 relative">
//       {/* Search Box */}
//       <div className="flex border border-gray-300 rounded-md overflow-hidden w-full max-w-3xl h-12 bg-[var(--backgroundColor)] focus-within:border-black transition-colors">
//         <div className="flex items-center px-3 w-full">
//           <Search className="w-4 h-4 text-gray-600 flex-shrink-0" />
//           <input
//             type="text"
//             placeholder="Search..."
//             className="outline-none border-none ring-0 focus:ring-0 px-2 py-2 w-full h-9 text-sm text-gray-600 bg-[var(--backgroundColor)]"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//       </div>

//       {/* Filters & Export Buttons */}
//       <div className="flex items-center gap-10">
//         {/* Filters */}
//         <button
//           onClick={() => setShowFilter(!showFilter)}
//           className="flex items-center text-md gap-1 text-gray-700 hover:text-black"
//         >
//           <FaFilter />
//           Filters
//         </button>

//         {/* Export */}
//         <div className="relative" ref={downloadRef}>
//           <button
//             onClick={() => setDownloadDropdown(!downloadDropdown)}
//             className="flex items-center gap-1 text-md text-gray-700 hover:text-black"
//           >
//             <BsFillCloudDownloadFill className="text-md" />
//             Export
//           </button>
//           {downloadDropdown && (
//             <div
//               className="absolute top-10 left-0 border rounded-xl shadow-lg w-40 z-[9999]"
//               style={{
//                 background: `
//                   linear-gradient(to bottom left, rgba(173, 216, 230, 0.4) 0%, transparent 40%),
//                   linear-gradient(to top right, rgba(255, 182, 193, 0.4) 0%, transparent 40%),
//                   white
//                 `,
//               }}
//             >
//               <button
//                 className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
//                 onClick={() => {
//                   const dataToExport =
//                     selectedRows.length > 0
//                       ? allData.filter((row) =>
//                         selectedRows.includes(row._id)
//                       )
//                       : filteredData;
//                   downloadCSV(dataToExport, `${sectionName}.csv`);
//                   setDownloadDropdown(false);
//                 }}
//               >
//                 Download CSV
//               </button>
//               <button
//                 className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
//                 onClick={() => {
//                   const dataToExport =
//                     selectedRows.length > 0
//                       ? allData.filter((row) =>
//                         selectedRows.includes(row._id)
//                       )
//                       : filteredData;
//                   downloadExcel(dataToExport, `${sectionName}.xlsx`);
//                   setDownloadDropdown(false);
//                 }}
//               >
//                 Download Excel
//               </button>
//               <button
//                 className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
//                 onClick={() => {
//                   const dataToExport =
//                     selectedRows.length > 0
//                       ? allData.filter((row) =>
//                         selectedRows.includes(row._id)
//                       )
//                       : filteredData;
//                   downloadPDF(dataToExport, `${sectionName}.pdf`);
//                   setDownloadDropdown(false);
//                 }}
//               >
//                 Download PDF
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Filter Dropdown */}
//       {showFilter && (
//         <div
//           ref={filterRef}
//           className="absolute top-16 left-[40vw] border rounded-xl shadow-lg w-48 z-[9999] p-2 text-sm"
//           style={{
//             background: `
//               linear-gradient(to bottom left, rgba(173, 216, 230, 0.4) 0%, transparent 20%),
//               linear-gradient(to top right, rgba(255, 182, 193, 0.4) 0%, transparent 20%),
//               white
//             `,
//           }}
//         >
//           {filtersConfig.map(({ title, options, selected, setter }) => (
//             <div key={title} className="relative">
//               <div
//                 onClick={() =>
//                   setExpandedSection(
//                     expandedSection === title ? null : title
//                   )
//                 }
//                 className="flex justify-between items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
//               >
//                 <span>{title}</span>
//                 <ChevronRight
//                   size={14}
//                   className={
//                     expandedSection === title ? "rotate-90" : ""
//                   }
//                 />
//               </div>

//               {expandedSection === title && (
//                 <div
//                   className="absolute top-0 left-full ml-2 w-44 border rounded-xl shadow-lg p-2 space-y-1 z-[9999]"
//                   style={{
//                     background: `
//                       linear-gradient(to bottom left, rgba(173, 216, 230, 0.4) 0%, transparent 40%),
//                       linear-gradient(to top right, rgba(255, 182, 193, 0.4) 0%, transparent 40%),
//                       white
//                     `,
//                   }}
//                 >
//                   {options.map((opt) => {
//                     const value =
//                       typeof opt === "object" ? opt.value : opt;
//                     const label =
//                       typeof opt === "object" ? opt.label : opt;

//                     return (
//                       <label
//                         key={value}
//                         className="flex items-center gap-2 cursor-pointer"
//                       >
//                         <input
//                           type="checkbox"
//                           checked={selected.includes(value)}
//                           onChange={() =>
//                             toggleSelection(value, setter, selected)
//                           }
//                           className="accent-black"
//                         />
//                         {label}
//                       </label>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Pagination;

