import { useState } from "react";
import { Pencil } from "lucide-react";

const Table = ({ columns, data, searchable, filterable, editable, pagination }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(columns.map((col) => col.key));
  const [showFilter, setShowFilter] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered & Paginated Data
  const filteredData = data.filter((row) =>
    Object.values(row).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const toggleColumn = (key) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#f4f7fe] p-6">
      <div className="bg-white p-4 rounded-2xl shadow-md w-full">

        {/* Search & Filter - aligned right */}
        <div className="flex justify-end items-center gap-2 mb-4">
          {searchable && (
            <input
              type="text"
              placeholder="Search..."
              className="border px-3 py-2 rounded-md w-64 focus:outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}
          {filterable && (
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="p-2 border rounded-md shadow-sm hover:bg-gray-100"
            >
              <img src="https://img.icons8.com/ios-glyphs/24/filter.png" alt="Filter" />
            </button>
          )}
        </div>

        {/* Filter dropdown */}
        {showFilter && (
          <div className="bg-white border rounded-md shadow p-4 mb-4 w-fit text-sm">
            <p className="font-semibold mb-2">Select Columns to Show</p>
            <div className="grid grid-cols-2 gap-2">
              {columns.map((col) => (
                <label key={col.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(col.key)}
                    onChange={() => toggleColumn(col.key)}
                  />
                  {col.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f9fafb] border-b">
              <tr>
                <th className="px-4 py-2">
                  <input type="checkbox" />
                </th>
                {columns
                  .filter((col) => visibleColumns.includes(col.key))
                  .map((col) => (
                    <th key={col.key} className="px-4 py-2 text-left font-medium text-gray-700">
                      {col.label}
                    </th>
                  ))}
                {editable && <th className="px-4 py-2 text-left text-gray-700">Edit</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <input type="checkbox" />
                  </td>
                  {columns
                    .filter((col) => visibleColumns.includes(col.key))
                    .map((col) => (
                      <td key={col.key} className="px-4 py-2">
                        {col.key === "profile" ? (
                          <img
                            src={row[col.key]}
                            alt="avatar"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          row[col.key]
                        )}
                      </td>
                    ))}
                  {editable && (
                    <td className="px-4 py-2">
                      <Pencil className="w-4 h-4 text-gray-500 hover:text-blue-500 cursor-pointer" />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination && (
          <div className="mt-4 flex flex-col md:flex-row justify-between items-center text-sm gap-3">
            {/* Rows Info */}
            <p className="text-gray-600">
              Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
              {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length}
            </p>

            {/* Rows Per Page */}
            <div className="flex items-center gap-2">
              <label htmlFor="rowsPerPage" className="text-gray-600">
                Rows per page:
              </label>
              <select
                id="rowsPerPage"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border px-2 py-1 rounded-md"
              >
                {[5, 10, 20, 50].map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </div>

            {/* Page numbers */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-2 py-1 border rounded-md"
              >
                {"<"}
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-md border ${
                    currentPage === i + 1 ? "bg-blue-500 text-white" : "hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-2 py-1 border rounded-md"
              >
                {">"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;
// import { useState } from "react";
// import { Pencil } from "lucide-react";

// const Table = ({ columns, data, searchable, filterable, editable, pagination }) => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [visibleColumns, setVisibleColumns] = useState(columns.map((col) => col.key));
//   const [showFilter, setShowFilter] = useState(false);

//   const filteredData = data.filter((row) =>
//     Object.values(row)
//       .join(" ")
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase())
//   );

//   const toggleColumn = (key) => {
//     setVisibleColumns((prev) =>
//       prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
//     );
//   };

//   return (
//     <div className="w-full min-h-screen bg-[#f4f7fe] p-6">
//       <div className="bg-white p-4 rounded-2xl shadow-md w-full">
//         {/* Header Controls */}
//         <div className="flex justify-end items-center gap-2 mb-4">
//           {filterable && (
//             <button
//               onClick={() => setShowFilter(!showFilter)}
//               className="p-2 border rounded-md shadow-sm hover:bg-gray-100"
//             >
//               <img src="https://img.icons8.com/ios-glyphs/24/filter.png" alt="Filter" />
//             </button>
//           )}
//           {searchable && (
//             <input
//               type="text"
//               placeholder="Search..."
//               className="border px-3 py-2 rounded-md w-64 focus:outline-none text-sm"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           )}
//         </div>

//         {/* Filter dropdown */}
//         {showFilter && (
//           <div className="bg-white border rounded-md shadow p-4 mb-4 w-fit text-sm">
//             <p className="font-semibold mb-2">Select Columns to Show</p>
//             <div className="grid grid-cols-2 gap-2">
//               {columns.map((col) => (
//                 <label key={col.key} className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     checked={visibleColumns.includes(col.key)}
//                     onChange={() => toggleColumn(col.key)}
//                   />
//                   {col.label}
//                 </label>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="min-w-full text-sm">
//             <thead className="bg-[#f9fafb] border-b">
//               <tr>
//                 <th className="px-4 py-2">
//                   <input type="checkbox" />
//                 </th>
//                 {columns
//                   .filter((col) => visibleColumns.includes(col.key))
//                   .map((col) => (
//                     <th key={col.key} className="px-4 py-2 text-left font-medium text-gray-700">
//                       {col.label}
//                     </th>
//                   ))}
//                 {editable && <th className="px-4 py-2 text-left text-gray-700">Edit</th>}
//               </tr>
//             </thead>
//             <tbody>
//               {filteredData.map((row, rowIndex) => (
//                 <tr key={rowIndex} className="border-b hover:bg-gray-50">
//                   <td className="px-4 py-2">
//                     <input type="checkbox" />
//                   </td>
//                   {columns
//                     .filter((col) => visibleColumns.includes(col.key))
//                     .map((col) => (
//                       <td key={col.key} className="px-4 py-2">
//                         {col.key === "profile" ? (
//                           <img
//                             src={row[col.key]}
//                             alt="avatar"
//                             className="w-8 h-8 rounded-full object-cover"
//                           />
//                         ) : (
//                           row[col.key]
//                         )}
//                       </td>
//                     ))}
//                   {editable && (
//                     <td className="px-4 py-2">
//                       <Pencil className="w-4 h-4 text-gray-500 hover:text-blue-500 cursor-pointer" />
//                     </td>
//                   )}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {pagination && (
//           <div className="mt-4 flex justify-between items-center text-sm">
//             <p className="text-gray-600">Show Entries 1 to {filteredData.length}</p>
//             <div className="flex items-center gap-2">
//               <button className="px-2 py-1 border rounded-md">{"<"}</button>
//               {[1, 2, 3].map((num) => (
//                 <button
//                   key={num}
//                   className={`px-3 py-1 rounded-md border ${num === 1 ? "bg-blue-500 text-white" : "hover:bg-gray-100"
//                     }`}
//                 >
//                   {num}
//                 </button>
//               ))}
//               <button className="px-2 py-1 border rounded-md">{">"}</button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Table;
// import React, { useState } from "react";

// const Table = ({
//   columns,
//   data,
//   searchable = false,
//   filterable = false,
//   selectable = false,
//   editable = false,
//   pagination = false,
//   rowsPerPage = 10,
// }) => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showFilters, setShowFilters] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);

//   // Column visibility toggle
//   const [visibleColumns, setVisibleColumns] = useState(
//     columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
//   );

//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//     setCurrentPage(1);
//   };

//   const filteredData = data.filter((row) =>
//     Object.values(row).some(
//       (val) =>
//         val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
//     )
//   );

//   const totalPages = Math.ceil(filteredData.length / rowsPerPage);
//   const paginatedData = pagination
//     ? filteredData.slice(
//         (currentPage - 1) * rowsPerPage,
//         currentPage * rowsPerPage
//       )
//     : filteredData;

//   const goToPage = (page) => setCurrentPage(page);

//   const toggleColumn = (key) => {
//     setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
//   };

//   return (
//     <div className="bg-white rounded-md shadow-md overflow-hidden relative">
//       {/* Search & Filter Buttons */}
//       <div className="flex justify-end items-center px-4 py-2 border-b bg-white">
//         <div className="flex items-center gap-2">
//           {searchable && (
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 className="pl-10 pr-4 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
//                 value={searchTerm}
//                 onChange={handleSearch}
//               />
//               <svg
//                 className="w-4 h-4 absolute left-3 top-2.5 text-gray-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
//                 />
//               </svg>
//             </div>
//           )}
//           {filterable && (
//             <div className="relative">
//               <button
//                 onClick={() => setShowFilters(!showFilters)}
//                 className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
//                 title="Toggle Filters"
//               >
//                 <svg
//                   className="w-5 h-5 text-gray-600"
//                   fill="currentColor"
//                   viewBox="0 0 20 20"
//                 >
//                   <path d="M3 5a1 1 0 011-1h12a1 1 0 01.8 1.6l-4.4 5.87V17a1 1 0 01-1.45.89l-2-1A1 1 0 018 16v-5.53L3.2 5.6A1 1 0 013 5z" />
//                 </svg>
//               </button>

//               {/* Filter Panel */}
//               {showFilters && (
//                 <div className="absolute right-0 z-10 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg p-3">
//                   <p className="text-sm font-medium mb-2 text-gray-700">Show Columns:</p>
//                   {columns.map((col) => (
//                     <label key={col.key} className="flex items-center gap-2 mb-1 text-sm text-gray-600">
//                       <input
//                         type="checkbox"
//                         checked={visibleColumns[col.key]}
//                         onChange={() => toggleColumn(col.key)}
//                         className="accent-blue-500"
//                       />
//                       {col.label}
//                     </label>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="min-w-full text-sm text-left border-t">
//           <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
//             <tr>
//               {selectable && <th className="px-4 py-3"><input type="checkbox" /></th>}
//               {columns.map(
//                 (col) =>
//                   visibleColumns[col.key] && (
//                     <th key={col.key} className="px-4 py-3 font-medium">
//                       {col.label}
//                     </th>
//                   )
//               )}
//               {editable && <th className="px-4 py-3">Edit</th>}
//             </tr>
//           </thead>
//           <tbody className="text-gray-700">
//             {paginatedData.map((row, idx) => (
//               <tr key={idx} className="border-b hover:bg-gray-50">
//                 {selectable && (
//                   <td className="px-4 py-2"><input type="checkbox" /></td>
//                 )}
//                 {columns.map(
//                   (col) =>
//                     visibleColumns[col.key] && (
//                       <td key={col.key} className="px-4 py-2">
//                         {col.key === "profile" ? (
//                           <img
//                             src={row[col.key]}
//                             alt="avatar"
//                             className="w-8 h-8 rounded-full"
//                           />
//                         ) : (
//                           row[col.key]
//                         )}
//                       </td>
//                     )
//                 )}
//                 {editable && (
//                   <td className="px-4 py-2">
//                     <button className="text-blue-500 hover:underline">
//                       ✎
//                     </button>
//                   </td>
//                 )}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       {pagination && totalPages > 1 && (
//         <div className="flex justify-end items-center p-4 gap-1">
//           {Array.from({ length: totalPages }, (_, i) => (
//             <button
//               key={i}
//               onClick={() => goToPage(i + 1)}
//               className={`px-3 py-1 rounded-md border text-sm ${
//                 currentPage === i + 1
//                   ? "bg-blue-500 text-white"
//                   : "bg-white text-gray-700 border-gray-300"
//               }`}
//             >
//               {i + 1}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Table;
