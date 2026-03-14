
/* eslint-disable react/prop-types */
import { useMemo, useEffect } from "react";
import {
  useTable,
  useSortBy,
  usePagination,
  useGlobalFilter,
} from "react-table";
import { ChevronUp, ChevronDown } from "lucide-react";
import Pagination from "../pagination/Pagination";

const CommonTable = ({
  columns,
  data,
  editable,
  pagination,
  rowsPerPage = 10,
  searchTerm = "",
  actionButton,
  extraColumn,
  onRowClick,
}) => {

  /* ===================== TABLE COLUMNS ===================== */

  const tableColumns = useMemo(() => {
    const cols = columns.map((col) => ({
      Header: col.label,
      accessor: col.key,
      Cell: ({ row }) =>
        col.render ? col.render(row.original) : row.original[col.key],
    }));

    if (editable && actionButton) {
      cols.push({
        Header: "Action",
        id: "action",
        disableSortBy: true,
        Cell: ({ row }) => actionButton(row.original),
      });
    }

    if (extraColumn) {
      cols.push({
        Header: extraColumn.header,
        id: "extra",
        disableSortBy: true,
        Cell: ({ row }) => extraColumn.render?.(row.original),
      });
    }

    return cols;
  }, [columns, editable, actionButton, extraColumn]);

  /* ===================== TABLE INSTANCE ===================== */

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    setGlobalFilter,
    state: { pageIndex, pageSize },
    pageCount,
    gotoPage,
  } = useTable(
    {
      columns: tableColumns,
      data,
      initialState: {
        pageIndex: 0,
        pageSize: rowsPerPage,
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  /* ===================== SEARCH ===================== */

  useEffect(() => {
    setGlobalFilter(searchTerm || undefined);
  }, [searchTerm]);

  /* ========================================================= */

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* ================= TABLE ================= */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table {...getTableProps()} className="min-w-full text-sm">

            <thead className="border-b border-gray-200">
              {headerGroups.map((headerGroup) => {
                const { key, ...restHeaderGroupProps } =
                  headerGroup.getHeaderGroupProps();
                return (
                  <tr
                    key={key}
                    {...restHeaderGroupProps}
                    className="text-xs uppercase tracking-wider text-gray-500 font-semibold bg-blue-50"
                  >
                    {headerGroup.headers.map((column) => {
                      const { key: colKey, ...restColProps } =
                        column.getHeaderProps(column.getSortByToggleProps());
                      return (
                        <th
                          key={colKey}
                          {...restColProps}
                          className="px-3 sm:px-6 py-3 sm:py-4 text-left"
                        >
                          <div className="flex items-center gap-2">
                            {column.render("Header")}

                            {column.canSort && (
                              <span className="text-gray-400">
                                {column.isSorted ? (
                                  column.isSortedDesc ? (
                                    <ChevronDown size={14} />
                                  ) : (
                                    <ChevronUp size={14} />
                                  )
                                ) : (
                                  <ChevronDown
                                    size={14}
                                    className="opacity-30"
                                  />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                );
              })}
            </thead>

            <tbody {...getTableBodyProps()} className="bg-white">
              {page.length === 0 ? (
                <tr>
                  <td colSpan={tableColumns.length} className="text-center py-10 text-gray-400">
                    No data found
                  </td>
                </tr>
              ) : (
                page.map((row) => {
                  prepareRow(row);
                  const rowProps = row.getRowProps();
                  const { key, ...restRowProps } = rowProps;
                  return (
                    <tr
                      key={key}
                      {...restRowProps}
                      className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {row.cells.map((cell) => {
                        const cellProps = cell.getCellProps();
                        const { key: cellKey, ...restCellProps } = cellProps;
                        return (
                          <td
                            key={cellKey}
                            {...restCellProps}
                            className="px-3 sm:px-6 py-3 sm:py-4 text-gray-700"
                            onClick={(e) => {
                              if (cell.column.id === "action") e.stopPropagation();
                            }}
                          >
                            {cell.render("Cell")}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>

        {/* ================= PAGINATION ================= */}
        {pagination && (
          <div className="border-t border-gray-200 px-3 sm:px-6 py-3 sm:py-4 bg-blue-50">
            <Pagination
              totalItems={data.length}
              currentPage={pageIndex + 1}
              pageSize={pageSize}
              totalPages={pageCount}
              onPageChange={(page) => gotoPage(page - 1)}
              label="entries"
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default CommonTable;

// /* eslint-disable react/prop-types */
// import { useState, useEffect, useMemo } from "react";
// import {
//   useReactTable,
//   getCoreRowModel,
//   getSortedRowModel,
//   getPaginationRowModel,
//   getFilteredRowModel,
//   flexRender,
// } from "@tanstack/react-table";
// import { ChevronUp, ChevronDown } from "lucide-react";
// import Pagination from "../pagination/Pagination";

// const CommonTable = ({
//   columns,
//   data,
//   editable,
//   pagination,
//   rowsPerPage = 10,
//   searchTerm = "",
//   actionButton,
//   extraColumn,
//   onRowClick,
//   onSelectionChange,
// }) => {

//   const [rowSelection, setRowSelection] = useState({});
//   const [sorting, setSorting] = useState([]);
//   const [globalFilter, setGlobalFilter] = useState("");

//   useEffect(() => {
//     setGlobalFilter(searchTerm);
//   }, [searchTerm]);

//   /* ===================== COLUMNS ===================== */

//   const tableColumns = useMemo(() => {
//     const cols = [
//       ...columns.map((col) => ({
//         accessorKey: col.key,
//         header: col.label,
//         cell: ({ row }) =>
//           col.render ? col.render(row.original) : row.original[col.key],
//       })),
//     ];

//     if (editable && actionButton) {
//       cols.push({
//         id: "action",
//         header: "Action",
//         cell: ({ row }) => actionButton(row.original),
//         enableSorting: false,
//       });
//     }

//     if (extraColumn) {
//       cols.push({
//         id: "extra",
//         header: extraColumn.header,
//         cell: ({ row }) => extraColumn.render?.(row.original),
//         enableSorting: false,
//       });
//     }

//     return cols;
//   }, [columns, editable, actionButton, extraColumn]);

//   /* ===================== TABLE ===================== */

//   const table = useReactTable({
//     data,
//     columns: tableColumns,
//     state: {
//       rowSelection,
//       sorting,
//       globalFilter,
//     },
//     enableRowSelection: true,
//     onRowSelectionChange: setRowSelection,
//     onSortingChange: setSorting,
//     onGlobalFilterChange: setGlobalFilter,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
//     initialState: {
//       pagination: { pageSize: rowsPerPage },
//     },
//   });

//   /* ===================== SELECTED IDS ===================== */

//   useEffect(() => {
//     if (!onSelectionChange) return;

//     const selectedIds = Object.keys(rowSelection)
//       .filter((key) => rowSelection[key])
//       .map((index) => data[parseInt(index)]?._id)
//       .filter(Boolean);

//     onSelectionChange(selectedIds);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [rowSelection]);

//   /* ========================================================= */

//   return (
//     <div className="w-full ">
//       <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

//         {/* ================= TABLE ================= */}
//         <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
//           <table className="min-w-full text-sm">

//             <thead className="border-b border-gray-200 ">
//               {table.getHeaderGroups().map((headerGroup) => (
//                 <tr
//                   key={headerGroup.id}
//                   className="text-xs uppercase tracking-wider text-gray-500 font-semibold bg-blue-50"
//                 >
//                   {headerGroup.headers.map((header) => (
//                     <th
//                       key={header.id}
//                       className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm"
//                     >
//                       {header.isPlaceholder ? null : (
//                         <div
//                           className={`flex items-center gap-2 ${header.column.getCanSort()
//                             ? "cursor-pointer select-none"
//                             : ""
//                             }`}
//                           onClick={header.column.getToggleSortingHandler()}
//                         >
//                           {flexRender(
//                             header.column.columnDef.header,
//                             header.getContext()
//                           )}

//                           {header.column.getCanSort() && (
//                             <span className="text-gray-400">
//                               {header.column.getIsSorted() === "asc"
//                                 ? <ChevronUp size={14} />
//                                 : header.column.getIsSorted() === "desc"
//                                   ? <ChevronDown size={14} />
//                                   : <ChevronDown size={14} className="opacity-30" />}
//                             </span>
//                           )}
//                         </div>
//                       )}
//                     </th>
//                   ))}
//                 </tr>
//               ))}
//             </thead>

//             <tbody className="bg-white">
//               {table.getRowModel().rows.length === 0 ? (
//                 <tr>
//                   <td colSpan={tableColumns.length} className="text-center py-10 text-gray-400">
//                     No data found
//                   </td>
//                 </tr>
//               ) : (
//                 table.getRowModel().rows.map((row) => (
//                   <tr
//                     key={row.id}
//                     className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
//                     onClick={() => onRowClick?.(row.original)}
//                   >
//                     {row.getVisibleCells().map((cell) => (
//                       <td
//                         key={cell.id}
//                         className="px-3 sm:px-6 py-3 sm:py-4 text-left text-gray-700 text-xs sm:text-sm"
//                         onClick={(e) => {
//                           if (cell.column.id === "action") e.stopPropagation();
//                         }}
//                       >
//                         {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* ================= PAGINATION FOOTER ================= */}
//         {pagination && (
//           <div className="border-t border-gray-200 px-3 sm:px-6 py-3 sm:py-4 bg-blue-50">
//             <Pagination
//               totalItems={table.getFilteredRowModel().rows.length}
//               currentPage={table.getState().pagination.pageIndex + 1}
//               pageSize={table.getState().pagination.pageSize}
//               totalPages={table.getPageCount()}
//               onPageChange={(page) => table.setPageIndex(page - 1)}
//               label="entries"
//             />
//           </div>
//         )}

//       </div>
//     </div>
//   );
// };

// export default CommonTable;


// // /* eslint-disable react/prop-types */
// // import { useState, useEffect, useMemo } from "react";
// // import {
// //   useReactTable,
// //   getCoreRowModel,
// //   getSortedRowModel,
// //   getPaginationRowModel,
// //   getFilteredRowModel,
// //   flexRender,
// // } from "@tanstack/react-table";
// // import { ChevronUp, ChevronDown } from "lucide-react";
// // import Pagination from "../pagination/Pagination";

// // const CommonTable = ({
// //   columns,
// //   data,
// //   editable,
// //   pagination,
// //   rowsPerPage = 10,
// //   searchTerm = "",
// //   actionButton,
// //   extraColumn,
// //   onRowClick,
// //   onSelectionChange,
// // }) => {
// //   const [rowSelection, setRowSelection] = useState({});
// //   const [sorting, setSorting] = useState([]);
// //   const [globalFilter, setGlobalFilter] = useState("");

// //   useEffect(() => {
// //     setGlobalFilter(searchTerm);
// //   }, [searchTerm]);

// //   const tableColumns = useMemo(() => {
// //     const cols = [
// //       {
// //         id: "select",
// //         header: ({ table }) => (
// //           <input
// //             type="checkbox"
// //             className="w-4 h-4 accent-black"
// //             checked={table.getIsAllRowsSelected()}
// //             onChange={table.getToggleAllRowsSelectedHandler()}
// //           />
// //         ),
// //         cell: ({ row }) => (
// //           <input
// //             type="checkbox"
// //             className="w-4 h-4 accent-black"
// //             checked={row.getIsSelected()}
// //             onChange={row.getToggleSelectedHandler()}
// //           />
// //         ),
// //         enableSorting: false,
// //       },
// //       {
// //         id: "sno",
// //         header: "S.No",
// //         cell: ({ row, table }) => {
// //           const pageIndex = table.getState().pagination.pageIndex;
// //           const pageSize = table.getState().pagination.pageSize;
// //           return pageIndex * pageSize + row.index + 1;
// //         },
// //         enableSorting: false,
// //       },
// //       ...columns.map((col) => ({
// //         accessorKey: col.key,
// //         header: col.label,
// //         cell: ({ row }) => col.render ? col.render(row.original) : row.original[col.key],
// //         enableSorting: true,
// //       })),
// //     ];

// //     if (editable && actionButton) {
// //       cols.push({
// //         id: "action",
// //         header: "Action",
// //         cell: ({ row }) => actionButton(row.original),
// //         enableSorting: false,
// //       });
// //     }

// //     if (extraColumn) {
// //       cols.push({
// //         id: "extra",
// //         header: extraColumn.header,
// //         cell: ({ row }) => extraColumn.render?.(row.original),
// //         enableSorting: false,
// //       });
// //     }

// //     return cols;
// //   }, [columns, editable, actionButton, extraColumn]);

// //   const table = useReactTable({
// //     data,
// //     columns: tableColumns,
// //     state: {
// //       rowSelection,
// //       sorting,
// //       globalFilter,
// //     },
// //     enableRowSelection: true,
// //     onRowSelectionChange: setRowSelection,
// //     onSortingChange: setSorting,
// //     onGlobalFilterChange: setGlobalFilter,
// //     getCoreRowModel: getCoreRowModel(),
// //     getSortedRowModel: getSortedRowModel(),
// //     getFilteredRowModel: getFilteredRowModel(),
// //     getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
// //     initialState: {
// //       pagination: {
// //         pageSize: rowsPerPage,
// //       },
// //     },
// //   });

// //   useEffect(() => {
// //     const selectedIds = Object.keys(rowSelection)
// //       .filter((key) => rowSelection[key])
// //       .map((index) => data[parseInt(index)]?._id)
// //       .filter(Boolean);
// //     onSelectionChange?.(selectedIds);
// //   }, [rowSelection, data, onSelectionChange]);

// //   return (
// //     <div className="w-full py-4">
// //       <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
// //         <div className="overflow-x-auto max-h-[60vh]">
// //           <table className="min-w-full text-sm">
// //             <thead className="bg-gray-50 border-b border-gray-200">
// //               {table.getHeaderGroups().map((headerGroup) => (
// //                 <tr
// //                   key={headerGroup.id}
// //                   className="text-xs uppercase tracking-wider text-gray-500 font-semibold"
// //                 >
// //                   {headerGroup.headers.map((header) => (
// //                     <th
// //                       key={header.id}
// //                       className={`px-6 py-4 ${
// //                         header.id === "select" ? "text-center" : "text-left"
// //                       }`}
// //                     >
// //                       {header.isPlaceholder ? null : (
// //                         <div
// //                           className={`flex items-center gap-2 ${
// //                             header.column.getCanSort() ? "cursor-pointer select-none" : ""
// //                           }`}
// //                           onClick={header.column.getToggleSortingHandler()}
// //                         >
// //                           {flexRender(
// //                             header.column.columnDef.header,
// //                             header.getContext()
// //                           )}
// //                           {header.column.getCanSort() && (
// //                             <span className="text-gray-400">
// //                               {header.column.getIsSorted() === "asc" ? (
// //                                 <ChevronUp size={14} />
// //                               ) : header.column.getIsSorted() === "desc" ? (
// //                                 <ChevronDown size={14} />
// //                               ) : (
// //                                 <ChevronDown size={14} className="opacity-30" />
// //                               )}
// //                             </span>
// //                           )}
// //                         </div>
// //                       )}
// //                     </th>
// //                   ))}
// //                 </tr>
// //               ))}
// //             </thead>
// //             <tbody>
// //               {table.getRowModel().rows.map((row) => (
// //                 <tr
// //                   key={row.id}
// //                   className="border-b border-gray-100 hover:bg-gray-50 transition"
// //                   onClick={() => onRowClick?.(row.original)}
// //                 >
// //                   {row.getVisibleCells().map((cell) => (
// //                     <td
// //                       key={cell.id}
// //                       className={`px-6 py-4 ${
// //                         cell.column.id === "select" ? "text-center" : "text-left"
// //                       } text-gray-700`}
// //                       onClick={(e) => {
// //                         if (cell.column.id === "select" || cell.column.id === "action") {
// //                           e.stopPropagation();
// //                         }
// //                       }}
// //                     >
// //                       {flexRender(cell.column.columnDef.cell, cell.getContext())}
// //                     </td>
// //                   ))}
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>

// //         {pagination && (
// //           <Pagination
// //             totalItems={table.getFilteredRowModel().rows.length}
// //             currentPage={table.getState().pagination.pageIndex + 1}
// //             pageSize={table.getState().pagination.pageSize}
// //             totalPages={table.getPageCount()}
// //             onPageChange={(page) => table.setPageIndex(page - 1)}
// //             label="items"
// //           />
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default CommonTable;
