
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

            <thead className="border-b border-gray-50">
              {headerGroups.map((headerGroup) => {
                const { key, ...restHeaderGroupProps } =
                  headerGroup.getHeaderGroupProps();
                return (
                  <tr
                    key={key}
                    {...restHeaderGroupProps}
                    className="text-xs uppercase tracking-wider text-gray-500 font-semibold bg-gray-100"
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
          <div className="border-t border-gray-200 px-3 sm:px-6 py-3 sm:py-4 bg-gray-100">
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
