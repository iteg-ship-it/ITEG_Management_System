/* eslint-disable react/prop-types */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import edit from "../../../assets/icons/edit-fill-icon.png";
const CommonTable = ({
  columns,
  data,
  editable,
  pagination,
  rowsPerPage,
  searchTerm,
}) => {
  const [visibleColumns] = useState(columns.map((col) => col.key));
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const filteredData = data.filter((row) =>
    Object.values(row)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <div className="w-full bg-[#f4f7fe] py-8">
      <div className="bg-white p-4 rounded-2xl shadow-md w-full">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f9fafb] border-b">
              <tr>
                <th className="py-2">
                  <input type="checkbox" />
                </th>
                {columns
                  .filter((col) => visibleColumns.includes(col.key))
                  .map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-2 text-left font-medium text-gray-700"
                    >
                      {col.label}
                    </th>
                  ))}
                {editable && (
                  <th className="px-4 py-2 text-left text-gray-700">Edit</th>
                )}
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
                      <img
                        src={edit}
                        alt="edit icon"
                        className="cursor-pointer"
                        onClick={() =>
                          navigate(`/admission-edit/${row.id}`, { state: row })
                        }
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="mt-4 flex flex-col md:flex-row justify-between items-center text-sm gap-3">
            <p className="text-gray-600">Total Count {filteredData.length}</p>

            {/* Pagination controls */}
            {/* <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-2 py-1 bg-gray-300 text-white font-extrabold text-base border rounded-md"
              >
                {"<"}
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-md border font-medium text-base ${
                    currentPage === i + 1
                      ? "text-orange-500 "
                      : "hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                className="px-2 py-1 bg-gray-300 text-white font-extrabold text-base border rounded-md"
              >
                {">"}
              </button>
            </div> */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`px-2 py-1  font-extrabold text-base border rounded-md ${
                  currentPage === 1
                    ? "bg-white text-gray-400 cursor-not-allowed"
                    : "bg-gray-300 text-white hover:bg-gray-400"
                }`}
              >
                {"<"}
              </button>

              {/* Page Numbers */}
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-md border font-medium text-base ${
                    currentPage === i + 1
                      ? "text-orange-500 bg-gray-100"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-2 py-1  font-extrabold text-base border rounded-md ${
                  currentPage === totalPages
                    ? "bg-white text-gray-400 cursor-not-allowed"
                    : "bg-gray-300 text-white hover:bg-gray-400"
                }`}
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

export default CommonTable;

// /* eslint-disable react/prop-types */
// import { useState } from "react";
// import { Pencil } from "lucide-react";

// const CommonTable = ({
//   columns,
//   data,
//   editable,
//   pagination,
//   rowsPerPage,
//   setRowsPerPage,
//   searchTerm,
// }) => {
//   const [visibleColumns] = useState(columns.map((col) => col.key));
//   const [currentPage, setCurrentPage] = useState(1);

//   const filteredData = data.filter((row) =>
//     Object.values(row)
//       .join(" ")
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase())
//   );

//   const paginatedData = filteredData.slice(
//     (currentPage - 1) * rowsPerPage,
//     currentPage * rowsPerPage
//   );
//   const totalPages = Math.ceil(filteredData.length / rowsPerPage);

//   return (
//     <div className="w-full bg-[#f4f7fe] py-8">
//       <div className="bg-white p-4 rounded-2xl shadow-md w-full">
//         <div className="overflow-x-auto">
//           <table className="min-w-full text-sm">
//             <thead className="bg-[#f9fafb] border-b">
//               <tr>
//                 <th className="py-2">
//                   <input type="checkbox" />
//                 </th>
//                 {columns
//                   .filter((col) => visibleColumns.includes(col.key))
//                   .map((col) => (
//                     <th
//                       key={col.key}
//                       className="px-4 py-2 text-left font-medium text-gray-700"
//                     >
//                       {col.label}
//                     </th>
//                   ))}
//                 {editable && (
//                   <th className="px-4 py-2 text-left text-gray-700">Edit</th>
//                 )}
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

//         {pagination && (
//           <div className="mt-4 flex flex-col md:flex-row justify-between items-center text-sm gap-3">
//             <p className="text-gray-600">
//               Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
//               {Math.min(currentPage * rowsPerPage, filteredData.length)} of{" "}
//               {filteredData.length}
//             </p>
//             <select
//               id="rowsPerPage"
//               value={rowsPerPage}
//               onChange={(e) => {
//                 setRowsPerPage(Number(e.target.value));
//                 setCurrentPage(1);
//               }}
//               className="border px-2 py-1 rounded-md"
//             >
//               {[5, 10, 20, 50].map((count) => (
//                 <option key={count} value={count}>
//                   {count}
//                 </option>
//               ))}
//             </select>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//                 className="px-2 py-1 bg-gray-300 text-white font-extrabold text-base border rounded-md"
//               >
//                 {"<"}
//               </button>
//               {[...Array(totalPages)].map((_, i) => (
//                 <button
//                   key={i}
//                   onClick={() => setCurrentPage(i + 1)}
//                   className={`px-3 py-1 rounded-md border font-medium text-base ${
//                     currentPage === i + 1
//                       ? "text-orange-500 "
//                       : "hover:bg-gray-100"
//                   }`}
//                 >
//                   {i + 1}
//                 </button>
//               ))}
//               <button
//                 onClick={() =>
//                   setCurrentPage((p) => Math.min(p + 1, totalPages))
//                 }
//                 className="px-2 py-1 bg-gray-300 text-white font-extrabold text-base border rounded-md"
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

// export default CommonTable;
