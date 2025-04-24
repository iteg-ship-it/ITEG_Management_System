/* eslint-disable react/prop-types */
import { useState } from "react";
import { Pencil } from "lucide-react";

const CommonTable = ({
  columns,
  data,
  editable,
  pagination,
  rowsPerPage,
  setRowsPerPage,
  searchTerm,
}) => {
  const [visibleColumns] = useState(columns.map((col) => col.key));
  const [currentPage, setCurrentPage] = useState(1);

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
    <div className="w-full bg-[#f4f7fe] p-6">
      <div className="bg-white p-4 rounded-2xl shadow-md w-full">
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
                      <Pencil className="w-4 h-4 text-gray-500 hover:text-blue-500 cursor-pointer" />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="mt-4 flex flex-col md:flex-row justify-between items-center text-sm gap-3">
            <p className="text-gray-600">
              Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
              {Math.min(currentPage * rowsPerPage, filteredData.length)} of{" "}
              {filteredData.length}
            </p>
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
                    currentPage === i + 1
                      ? "bg-blue-500 text-white"
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

export default CommonTable;

// /* eslint-disable react/prop-types */
// const CommonTable = ({
//   data,
//   columnsToShow,
//   searchTerm,
//   onRowClick,
//   extraColumn,
// }) => {
//   const filteredData = data.filter((item) => {
//     const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
//     return fullName.includes(searchTerm.toLowerCase());
//   });

//   return (
//     <div className="overflow-x-auto rounded-lg">
//       <table className="w-full mt-4 border">
//         <thead>
//           <tr className="bg-gray-200 text-left">
//             <th className="p-3 text-center">S.No</th>
//             {columnsToShow.map((col, index) => (
//               <th key={index} className="p-3 text-center capitalize">
//                 {col === "profilePhoto" ? "Profile" : col}
//               </th>
//             ))}
//             {extraColumn && (
//               <th className="p-3 text-center">{extraColumn.header}</th>
//             )}
//           </tr>
//         </thead>
//         <tbody className="text-center">
//           {filteredData.length > 0 ? (
//             filteredData.map((item, index) => (
//               <tr
//                 key={item._id || item.id}
//                 className="border-t hover:bg-gray-100 cursor-pointer"
//                 onClick={() => onRowClick(item)}
//               >
//                 <td className="p-3">{index + 1}</td>
//                 {columnsToShow.map((col, idx) => (
//                   <td key={idx} className="p-3">
//                     {col === "profilePhoto" ? (
//                       <img
//                         src={item[col]}
//                         alt="Profile"
//                         className="w-10 h-10 rounded-full mx-auto"
//                       />
//                     ) : (
//                       item[col]
//                     )}
//                   </td>
//                 ))}
//                 {extraColumn && (
//                   <td className="p-3">{extraColumn.render(item)}</td>
//                 )}
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td
//                 colSpan={columnsToShow.length + (extraColumn ? 2 : 1)}
//                 className="text-gray-600 p-4"
//               >
//                 No matching students found.
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default CommonTable;
