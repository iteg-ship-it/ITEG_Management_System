/* eslint-disable react/prop-types */
import { useState } from "react";

const CommonTable = ({
  columns,
  data,
  editable,
  pagination,
  rowsPerPage,
  searchTerm,
  actionButton,
  extraColumn,
}) => {
  const [visibleColumns] = useState(columns.map((col) => col.key));
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = data.filter((row) =>
    Object.values(row)
      .map((val) => String(val ?? ""))
      .join(" ")
      .toLowerCase()
      .includes((searchTerm ?? "").toLowerCase())
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
            <thead className="border-b-2 border-b-orange-300">
              <tr>
                <th className="text-start ps-4">
                  <input type="checkbox" />
                </th>
                <th className="px-4 py-2 text-center font-bold text-gray-700">S.No</th>
                {columns
                  .filter((col) => visibleColumns.includes(col.key))
                  .map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-2 text-center font-bold text-gray-700"
                    >
                      {col.label}
                    </th>
                  ))}
                {editable && (
                  <th className="px-4 py-2 text-center text-gray-700">Action</th>
                )}
                {extraColumn && (
                  <th className="px-4 py-2 text-center text-gray-700">
                    {extraColumn.header}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <input type="checkbox" />
                  </td>
                  <td className="px-4 text-center py-2">
                    {(currentPage - 1) * rowsPerPage + rowIndex + 1}
                  </td>
                  {columns
                    .filter((col) => visibleColumns.includes(col.key))
                    .map((col) => (
                      <td key={col.key} className="px-4 text-center py-2">
                        {col.render ? (
                          col.render(row)
                        ) : col.key === "profile" ? (
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
                    <td className="px-4 text-center py-2">
                      {actionButton && actionButton(row)}
                    </td>
                  )}
                  {extraColumn && (
                    <td className="px-4 text-center py-2">
                      {extraColumn.render && extraColumn.render(row)}
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`px-2 py-1 font-extrabold text-base border rounded-md ${
                  currentPage === 1
                    ? "bg-white text-gray-400 cursor-not-allowed"
                    : "bg-gray-300 text-white hover:bg-gray-400"
                }`}
              >
                {"<"}
              </button>
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
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-2 py-1 font-extrabold text-base border rounded-md ${
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
