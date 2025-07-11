/* eslint-disable react/prop-types */
import { useState } from "react";
import { Pencil } from "lucide-react";
import { downloadCSV, downloadExcel, downloadPDF } from "../../utils/downloadHelpers";

const Table = ({ columns, data, searchable, filterable, editable, pagination }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(columns.map((col) => col.key));
  const [showFilter, setShowFilter] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);

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

  const isRowSelected = (row) => selectedRows.includes(row);

  const toggleRowSelection = (row) => {
    setSelectedRows((prev) =>
      isRowSelected(row) ? prev.filter((r) => r !== row) : [...prev, row]
    );
  };

  const toggleSelectAll = () => {
    const allSelected = paginatedData.every(isRowSelected);
    if (allSelected) {
      setSelectedRows((prev) => prev.filter((r) => !paginatedData.includes(r)));
    } else {
      const newSelections = paginatedData.filter((row) => !selectedRows.includes(row));
      setSelectedRows([...selectedRows, ...newSelections]);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f4f7fe] p-6">
      <div className="bg-white p-4 rounded-2xl shadow-md w-full">

        {/* Search & Filter Controls */}
        <div className="flex justify-between items-center gap-2 mb-4">
          <div className="flex gap-2">
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

          {/* Download Buttons */}
          <div className="flex gap-2">
            <button
              disabled={selectedRows.length === 0}
              onClick={() => downloadCSV(selectedRows)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              CSV
            </button>
            <button
              disabled={selectedRows.length === 0}
              onClick={() => downloadExcel(selectedRows)}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
            >
              Excel
            </button>
            <button
              disabled={selectedRows.length === 0}
              onClick={() => downloadPDF(selectedRows)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
            >
              PDF
            </button>
          </div>
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
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && paginatedData.every(isRowSelected)}
                    onChange={toggleSelectAll}
                  />
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
                    <input
                      type="checkbox"
                      checked={isRowSelected(row)}
                      onChange={() => toggleRowSelection(row)}
                    />
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
            <p className="text-gray-600">
              Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
              {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length}
            </p>

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
                  className={`px-3 py-1 rounded-md border ${currentPage === i + 1 ? "bg-blue-500 text-white" : "hover:bg-gray-100"
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


// /* eslint-disable react/prop-types */
// import { useState } from "react";
// import { Pencil } from "lucide-react";

// const Table = ({ columns, data, searchable, filterable, editable, pagination }) => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [visibleColumns, setVisibleColumns] = useState(columns.map((col) => col.key));
//   const [showFilter, setShowFilter] = useState(false);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);

//   // Filtered & Paginated Data
//   const filteredData = data.filter((row) =>
//     Object.values(row).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const paginatedData = filteredData.slice(
//     (currentPage - 1) * rowsPerPage,
//     currentPage * rowsPerPage
//   );
//   const totalPages = Math.ceil(filteredData.length / rowsPerPage);

//   const toggleColumn = (key) => {
//     setVisibleColumns((prev) =>
//       prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
//     );
//   };

//   return (
//     <div className="w-full min-h-screen bg-[#f4f7fe] p-6">
//       <div className="bg-white p-4 rounded-2xl shadow-md w-full">

//         {/* Search & Filter - aligned right */}
//         <div className="flex justify-end items-center gap-2 mb-4">
//           {searchable && (
//             <input
//               type="text"
//               placeholder="Search..."
//               className="border px-3 py-2 rounded-md w-64 focus:outline-none text-sm"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           )}
//           {filterable && (
//             <button
//               onClick={() => setShowFilter(!showFilter)}
//               className="p-2 border rounded-md shadow-sm hover:bg-gray-100"
//             >
//               <img src="https://img.icons8.com/ios-glyphs/24/filter.png" alt="Filter" />
//             </button>
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
//               {paginatedData.map((row, rowIndex) => (
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

//         {/* Pagination Controls */}
//         {pagination && (
//           <div className="mt-4 flex flex-col md:flex-row justify-between items-center text-sm gap-3">
//             {/* Rows Info */}
//             <p className="text-gray-600">
//               Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
//               {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length}
//             </p>

//             {/* Rows Per Page */}
//             <div className="flex items-center gap-2">
//               <label htmlFor="rowsPerPage" className="text-gray-600">
//                 Rows per page:
//               </label>
//               <select
//                 id="rowsPerPage"
//                 value={rowsPerPage}
//                 onChange={(e) => {
//                   setRowsPerPage(Number(e.target.value));
//                   setCurrentPage(1);
//                 }}
//                 className="border px-2 py-1 rounded-md"
//               >
//                 {[5, 10, 20, 50].map((count) => (
//                   <option key={count} value={count}>
//                     {count}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Page numbers */}
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//                 className="px-2 py-1 border rounded-md"
//               >
//                 {"<"}
//               </button>
//               {[...Array(totalPages)].map((_, i) => (
//                 <button
//                   key={i}
//                   onClick={() => setCurrentPage(i + 1)}
//                   className={`px-3 py-1 rounded-md border ${
//                     currentPage === i + 1 ? "bg-blue-500 text-white" : "hover:bg-gray-100"
//                   }`}
//                 >
//                   {i + 1}
//                 </button>
//               ))}
//               <button
//                 onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
//                 className="px-2 py-1 border rounded-md"
//               >
//                 {">"}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Table;