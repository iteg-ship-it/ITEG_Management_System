/* eslint-disable react/prop-types */
const CommonTable = ({
  data,
  columnsToShow,
  searchTerm,
  onRowClick,
  extraColumn,
}) => {
  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="w-full mt-4">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-3 text-center">S.No</th>
            {columnsToShow.map((col, index) => (
              <th key={index} className="p-3 text-center capitalize">
                {col === "profilePhoto" ? "Profile" : col}
              </th>
            ))}
            {extraColumn && (
              <th className="p-3 text-center">{extraColumn.header}</th>
            )}
          </tr>
        </thead>
        <tbody className="text-center">
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <tr
                key={item.id}
                className="border-t hover:bg-gray-100 cursor-pointer"
                onClick={() => onRowClick(item)}
              >
                <td className="p-3">{index + 1}</td>
                {columnsToShow.map((col, idx) => (
                  <td key={idx} className="p-3">
                    {col === "profilePhoto" ? (
                      <img
                        src={item[col]}
                        alt="Profile"
                        className="w-10 h-10 rounded-full mx-auto"
                      />
                    ) : (
                      item[col]
                    )}
                  </td>
                ))}
                {extraColumn && (
                  <td className="p-3">{extraColumn.render(item)}</td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columnsToShow.length + (extraColumn ? 2 : 1)}
                className="text-gray-600 p-4"
              >
                No matching students found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CommonTable;
