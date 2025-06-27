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
  const [pageSize, setPageSize] = useState(rowsPerPage);

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

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);


  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [paginatedData]);

  return (
    <div className="w-full bg-[#f4f7fe] py-6">
      <div className="bg-white pb-4 rounded-2xl shadow-md w-full">
        <div className="overflow-x-auto max-w-full">
          <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-[#F9FAFB] text-sm text-gray-600 border-b shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-start">
                    <input type="checkbox" className="h-4 w-4 text-black" />
                  </th>
                  <th className="px-4 py-3 text-center">S.no</th>
                  {columns.map(({ key, label }) => (
                    <th key={key} className="px-4 py-3 text-center">{label}</th>
                  ))}
                  {editable && <th className="px-4 py-3 text-center">Edit</th>}
                  {extraColumn && <th className="px-4 py-3 text-center">{extraColumn.header}</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-100 border-b border-gray-200 transition"
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
                        <div className="inline-block p-2 border border-gray-300 rounded-md hover:shadow-md transition cursor-pointer">
                          {actionButton?.(row)}
                        </div>
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

        {pagination && (
          <div className="flex justify-end items-center gap-6 px-6 py-4 border-t border-gray-200 bg-white rounded-b-2xl text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-semibold">Rows Per Pages:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const selected = parseInt(e.target.value);
                  setPageSize(selected);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={filteredData.length}>All</option>
              </select>
            </div>

            <span className="text-gray-700 font-medium">
              {filteredData.length === 0
                ? "0"
                : `${(currentPage - 1) * pageSize + 1} - ${Math.min(
                  currentPage * pageSize,
                  filteredData.length
                )} of ${filteredData.length}`}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 border rounded-md flex items-center justify-center text-gray-500 disabled:opacity-40"
              >
                ‹
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 border rounded-md flex items-center justify-center text-gray-500 disabled:opacity-40"
              >
                ›
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
//     <div className="w-full bg-[#f4f7fe] py-6">
//       <div className="bg-white pb-4 rounded-2xl shadow-md w-full">
//         <div className="overflow-x-auto max-w-full">
//           <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto custom-scrollbar">
//             <table className="min-w-full text-sm">
//               <thead className="sticky top-0 bg-gray-300 border-b border-gray-200 z-10 shadow-sm">
//                 <tr className="text-sm font-semibold text-gray-600">
//                   <th className="text-start px-4 py-3">
//                     <input type="checkbox" className="rounded-md" />
//                   </th>
//                   <th className="px-4 py-3 text-center">S.No</th>
//                   {columns.map(({ key, label }) => (
//                     <th key={key} className="px-4 py-3 text-center">{label}</th>
//                   ))}
//                   {editable && (
//                     <th className="px-4 py-3 text-center">Edit</th>
//                   )}
//                   {extraColumn && (
//                     <th className="px-4 py-3 text-center">{extraColumn.header}</th>
//                   )}
//                 </tr>
//               </thead>
//               <tbody>
//                 {paginatedData.map((row, rowIndex) => (
//                   <tr
//                     key={rowIndex}
//                     className="border-b border-dashed border-gray-200 hover:bg-gray-50 transition"
//                   >
//                     <td className="px-4 py-3">
//                       <input type="checkbox" className="rounded-md" />
//                     </td>
//                     <td className="px-4 py-3 text-center font-medium text-gray-800">
//                       {(currentPage - 1) * rowsPerPage + rowIndex + 1}
//                     </td>
//                     {columns.map(({ key, render }) => (
//                       <td key={key} className="px-4 py-3 text-center text-gray-700">
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
//                       <td className="px-4 py-3 text-center">
//                         {actionButton?.(row)}
//                       </td>
//                     )}
//                     {extraColumn && (
//                       <td className="px-4 py-3 text-center">
//                         {extraColumn.render?.(row)}
//                       </td>
//                     )}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Pagination */}
//         {pagination && (
//           <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-sm gap-4 px-2">
//             <p className="text-gray-600">Rows Per Pages:</p>
//             <div className="flex items-center gap-2">
//               <select
//                 value={rowsPerPage}
//                 // eslint-disable-next-line no-unused-vars
//                 onChange={(_e) => setCurrentPage(1)}
//                 className="border border-gray-300 rounded px-2 py-1 text-sm"
//               >
//                 <option value={5}>5</option>
//                 <option value={10}>10</option>
//                 <option value={25}>25</option>
//                 <option value={50}>50</option>
//                 <option value={100}>100</option>
//                 <option value={filteredData.length}>All</option>
//               </select>
//               <span className="text-gray-600 ml-2">
//                 {`${(currentPage - 1) * rowsPerPage + 1} - ${Math.min(
//                   currentPage * rowsPerPage,
//                   filteredData.length
//                 )} of ${filteredData.length}`}
//               </span>
//               <button
//                 onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//                 disabled={currentPage === 1}
//                 className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
//               >
//                 {"<"}
//               </button>
//               <button
//                 onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
//                 disabled={currentPage === totalPages}
//                 className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
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
