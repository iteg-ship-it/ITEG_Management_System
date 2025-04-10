import { useState } from "react";
import { Pencil } from "lucide-react";

const Table = ({ columns, data, searchable = false, selectable = false, editable = false, pagination = false }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = data.filter((row) =>
    columns.some((col) => row[col.key]?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      {searchable && (
        <input
          type="text"
          placeholder="Search..."
          className="mb-4 p-2 border rounded w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      )}
      <table className="min-w-full text-left">
        <thead>
          <tr className="border-b">
            {selectable && <th className="p-2"><input type="checkbox" /></th>}
            {columns.map((col) => (
              <th key={col.key} className="p-2">{col.label}</th>
            ))}
            {editable && <th className="p-2">Edit</th>}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-100">
              {selectable && <td className="p-2"><input type="checkbox" /></td>}
              {columns.map((col) => (
                <td key={col.key} className="p-2">{row[col.key]}</td>
              ))}
              {editable && (
                <td className="p-2">
                  <Pencil className="h-4 w-4 text-blue-500 cursor-pointer" />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
