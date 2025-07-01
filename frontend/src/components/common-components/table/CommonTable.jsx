/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo, useRef } from "react";

const CommonTable = ({
  columns,
  data,
  editable,
  pagination,
  rowsPerPage = 10,
  searchTerm = "",
  actionButton,       // ✅ Optional action button per row
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [paginatedData]);

  return (
    <div className="w-full py-3">
      <div className="pb-4 w-full">
        <div className="overflow-x-auto max-w-full">
          <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-[--neutral-light] text-sm text-gray-600 border-b shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-start">
                    <input type="checkbox" className="h-4 w-4 text-black" />
                  </th>
                  <th className="px-4 py-3 text-start">S.no</th>
                  {columns.map(({ key, label }) => (
                    <th key={key} className="px-4 py-3 text-start">{label}</th>
                  ))}
                  {editable && actionButton && (
                    <th className="px-4 py-3 text-start">Action</th>
                  )}
                  {extraColumn && (
                    <th className="px-4 py-3 text-start">{extraColumn.header}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-100 border-b border-gray-200 transition">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded-md" />
                    </td>
                    <td className="px-4 py-3 text-start font-medium text-gray-800">
                      {(currentPage - 1) * pageSize + rowIndex + 1}
                    </td>
                    {columns.map(({ key, render }) => (
                      <td key={key} className="px-4 py-3 text-start text-gray-700">
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
                    {editable && actionButton && (
                      <td className="px-4 py-3 text-start">
                        <div className="inline-block hover:shadow-md transition cursor-pointer">
                          {actionButton(row)}
                        </div>
                      </td>
                    )}
                    {extraColumn && (
                      <td className="px-4 py-3 text-start">
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
                className="px-3 py-1 text-sm focus:outline-none"
              >
                <option value={filteredData.length}>All</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
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
                className="w-7 h-7   flex items-center justify-center text-[var(--text-color)] disabled:opacity-40"
              >
                <span className="text-3xl">‹</span>
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 text-lg  flex items-center justify-center text-[var(--text-color)] disabled:opacity-40"
              >
                <span className="text-3xl">›</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommonTable;