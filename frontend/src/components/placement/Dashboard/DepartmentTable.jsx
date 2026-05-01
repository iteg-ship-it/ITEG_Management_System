import { useNavigate } from "react-router-dom";


const DepartmentTable = ({ data = [], loading }) => {
  const navigate = useNavigate();


  if (loading) return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <div className="h-4 bg-gray-100 rounded w-40 mb-4 animate-pulse" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-10 bg-gray-50 rounded mb-2 animate-pulse" />
      ))}
    </div>
  );


  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b">
        <h3 className="font-semibold text-gray-700 text-sm">Department-wise Placement</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-5 py-3 text-left">Department</th>
              <th className="px-5 py-3 text-center">Students</th>
              <th className="px-5 py-3 text-center">Placed</th>
              <th className="px-5 py-3 text-center">Placement %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">No data available</td>
              </tr>
            ) : (
              data.map((dept) => (
                <tr
                  key={dept.subDepartmentId}
                  onClick={() => navigate(`/placements/department/${dept.subDepartmentId}`)}
                  className="hover:bg-orange-50 cursor-pointer transition"
                >
                  <td className="px-5 py-3 font-medium text-gray-700">{dept.subDepartmentName || "—"}</td>
                  <td className="px-5 py-3 text-center text-gray-600">{dept.totalStudents}</td>
                  <td className="px-5 py-3 text-center text-gray-600">{dept.placedStudents}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                      dept.placementPercentage >= 70 ? "bg-green-100 text-green-600"
                      : dept.placementPercentage >= 40 ? "bg-orange-100 text-orange-600"
                      : "bg-red-100 text-red-500"
                    }`}>
                      {dept.placementPercentage}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default DepartmentTable;