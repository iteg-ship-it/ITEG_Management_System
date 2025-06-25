/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo, useRef } from "react";

const CommonTable = ({
  columns,
  data,
  editable,
  pagination,
  rowsPerPage = 10,
  searchTerm = "",
  actionButton,
  extraColumn,
  currentPage: parentPage,
  onPageChange,
}) => {
  const [internalPage, setInternalPage] = useState(1);
  const scrollRef = useRef(null);

  const currentPage = parentPage ?? internalPage;
  const setCurrentPage = onPageChange ?? setInternalPage;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter((row) =>
      Object.values(row)
        .map((val) => String(val ?? ""))
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [paginatedData]);

  return (
    <div className="w-full bg-[#f4f7fe] py-6">
      <div className="bg-white pb-4 rounded-2xl shadow-md w-full">
        <div className="overflow-x-auto max-w-full">
          <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-gray-300 border-b border-gray-200 z-10 shadow-sm">
                <tr className="text-sm font-semibold text-gray-600">
                  <th className="text-start px-4 py-3">
                    <input type="checkbox" className="rounded-md" />
                  </th>
                  <th className="px-4 py-3 text-center">S.No</th>
                  {columns.map(({ key, label }) => (
                    <th key={key} className="px-4 py-3 text-center">{label}</th>
                  ))}
                  {editable && (
                    <th className="px-4 py-3 text-center">Edit</th>
                  )}
                  {extraColumn && (
                    <th className="px-4 py-3 text-center">{extraColumn.header}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-dashed border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded-md" />
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-gray-800">
                      {(currentPage - 1) * rowsPerPage + rowIndex + 1}
                    </td>
                    {columns.map(({ key, render }) => (
                      <td key={key} className="px-4 py-3 text-center text-gray-700">
                        {render ? (
                          render(row)
                        ) : key === "profile" ? (
                          <div className="flex justify-center">
                            <img
                              src={row[key]}
                              alt="avatar"
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          </div>
                        ) : (
                          row[key]
                        )}
                      </td>
                    ))}
                    {editable && (
                      <td className="px-4 py-3 text-center">
                        {actionButton?.(row)}
                      </td>
                    )}
                    {extraColumn && (
                      <td className="px-4 py-3 text-center">
                        {extraColumn.render?.(row)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-sm gap-4 px-2">
            <p className="text-gray-600">Rows Per Pages:</p>
            <div className="flex items-center gap-2">
              <select
                value={rowsPerPage}
                // eslint-disable-next-line no-unused-vars
                onChange={(_e) => setCurrentPage(1)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={filteredData.length}>All</option>
              </select>
              <span className="text-gray-600 ml-2">
                {`${(currentPage - 1) * rowsPerPage + 1} - ${Math.min(
                  currentPage * rowsPerPage,
                  filteredData.length
                )} of ${filteredData.length}`}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                {"<"}
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
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


// /* eslint-disable react-hooks/exhaustive-deps */
// /* eslint-disable react/prop-types */
// import { useState, useEffect, useMemo, useRef } from "react";

// const CommonTable = ({
//   columns,
//   data,
//   editable,
//   pagination,
//   rowsPerPage = 10,
//   searchTerm = "",
//   actionButton,
//   extraColumn,
//   currentPage: parentPage,
//   onPageChange,
// }) => {
//   const [internalPage, setInternalPage] = useState(1);
//   const scrollRef = useRef(null);

//   const currentPage = parentPage ?? internalPage;
//   const setCurrentPage = onPageChange ?? setInternalPage;

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm]);

//   const filteredData = useMemo(() => {
//     const term = searchTerm.toLowerCase();
//     return data.filter((row) =>
//       Object.values(row)
//         .map((val) => String(val ?? ""))
//         .join(" ")
//         .toLowerCase()
//         .includes(term)
//     );
//   }, [data, searchTerm]);

//   const totalPages = Math.ceil(filteredData.length / rowsPerPage);

//   const paginatedData = useMemo(() => {
//     const start = (currentPage - 1) * rowsPerPage;
//     return filteredData.slice(start, start + rowsPerPage);
//   }, [filteredData, currentPage, rowsPerPage]);

//   useEffect(() => {
//     scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
//   }, [paginatedData]);

//   return (
//     <div className="w-full bg-[#f4f7fe] py-8">
//       <div className="bg-white p-4 rounded-2xl shadow-md w-full">
//         <div className="overflow-x-auto max-w-full">
//           <div
//             ref={scrollRef}
//             className="max-h-[60vh] overflow-y-auto custom-scrollbar"
//           >
//             <table className="min-w-full text-sm">
//               <thead className="sticky top-0 bg-white border-b-2 border-b-orange-300">
//                 <tr>
//                   <th className="text-start ps-4">
//                     <input type="checkbox" />
//                   </th>
//                   <th className="px-4 py-2 text-center font-bold text-gray-700">S.No</th>
//                   {columns.map(({ key, label }) => (
//                     <th key={key} className="px-4 py-2 text-center font-bold text-gray-700">
//                       {label}
//                     </th>
//                   ))}
//                   {editable && (
//                     <th className="px-4 py-2 text-center text-gray-700">Action</th>
//                   )}
//                   {extraColumn && (
//                     <th className="px-4 py-2 text-center text-gray-700">
//                       {extraColumn.header}
//                     </th>
//                   )}
//                 </tr>
//               </thead>
//               <tbody>
//                 {paginatedData.map((row, rowIndex) => (
//                   <tr key={rowIndex} className="border-b hover:bg-gray-50">
//                     <td className="px-4 py-2">
//                       <input type="checkbox" />
//                     </td>
//                     <td className="px-4 py-2 text-center">
//                       {(currentPage - 1) * rowsPerPage + rowIndex + 1}
//                     </td>
//                     {columns.map(({ key, render }) => (
//                       <td key={key} className="px-4 py-2 text-center">
//                         {render ? (
//                           render(row)
//                         ) : key === "profile" ? (
//                           <div className="flex justify-center">
//                             <img
//                               src={row[key]}
//                               alt="avatar"
//                               className="w-8 h-8 rounded-full object-cover"
//                             />
//                           </div>
//                         ) : (
//                           row[key]
//                         )}
//                       </td>
//                     ))}
//                     {editable && (
//                       <td className="px-4 py-2 text-center">
//                         {actionButton?.(row)}
//                       </td>
//                     )}
//                     {extraColumn && (
//                       <td className="px-4 py-2 text-center">
//                         {extraColumn.render?.(row)}
//                       </td>
//                     )}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//         {pagination && (
//           <div className="mt-4 flex flex-col md:flex-row justify-between items-center text-sm gap-3">
//             <p className="text-gray-600">Total Count: {filteredData.length}</p>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//                 disabled={currentPage === 1}
//                 className={`px-2 py-1 font-extrabold text-base border rounded-md ${currentPage === 1
//                   ? "bg-white text-gray-400 cursor-not-allowed"
//                   : "bg-gray-300 text-white hover:bg-gray-400"
//                   }`}
//               >
//                 {"<"}
//               </button>

//               {/* Page Numbers with Ellipsis */}
//               {Array.from({ length: totalPages }, (_, i) => i + 1)
//                 .filter((page) => {
//                   return (
//                     page === 1 ||
//                     page === totalPages ||
//                     (page >= currentPage - 1 && page <= currentPage + 1)
//                   );
//                 })
//                 .reduce((acc, page, idx, arr) => {
//                   if (idx > 0 && page !== arr[idx - 1] + 1) acc.push("ellipsis");
//                   acc.push(page);
//                   return acc;
//                 }, [])
//                 .map((page, idx) =>
//                   page === "ellipsis" ? (
//                     <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
//                       ...
//                     </span>
//                   ) : (
//                     <button
//                       key={page}
//                       onClick={() => setCurrentPage(page)}
//                       className={`px-3 py-1 rounded-md border font-medium text-base ${currentPage === page
//                         ? "text-orange-500 bg-gray-100"
//                         : "hover:bg-gray-100"
//                         }`}
//                     >
//                       {page}
//                     </button>
//                   )
//                 )}

//               <button
//                 onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
//                 disabled={currentPage === totalPages}
//                 className={`px-2 py-1 font-extrabold text-base border rounded-md ${currentPage === totalPages
//                   ? "bg-white text-gray-400 cursor-not-allowed"
//                   : "bg-gray-300 text-white hover:bg-gray-400"
//                   }`}
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

