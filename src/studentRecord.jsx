const StudentRecord = () => {
    // Sample student data
    const students = [
      {
        id: 1,
        name: "John Doe",
        rollNumber: "101",
        course: "Computer Science",
        year: "2023",
        status: "Active",
      },
      {
        id: 2,
        name: "Jane Smith",
        rollNumber: "102",
        course: "Electrical Engineering",
        year: "2022",
        status: "Inactive",
      },

      {
        id: 3,
        name: "Alice Johnson",
        rollNumber: "103",
        course: "Mechanical Engineering",
        year: "2024",
        status: "Active",
      },
      {
        id: 4,
        name: "Bob Brown",
        rollNumber: "104",
        course: "Civil Engineering",
        year: "2023",
        status: "Active",
      },
      {
        id: 23,
        name: "Jane Smith",
        rollNumber: "102",
        course: "Electrical Engineering",
        year: "2022",
        status: "Inactive",
      },{
        id: 2,
        name: "Jane Smith",
        rollNumber: "102",
        course: "Electrical Engineering",
        year: "2022",
        status: "Active",
      },{
        id: 2,
        name: "Jane Smith",
        rollNumber: "102",
        course: "Electrical Engineering",
        year: "2022",
        status: "Inactive",
      },{
        id: 2,
        name: "Jane Smith",
        rollNumber: "102",
        course: "Electrical Engineering",
        year: "2022",
        status: "Inactive",
      },{
        id: 2,
        name: "Jane Smith",
        rollNumber: "102",
        course: "Electrical Engineering",
        year: "2022",
        status: "Active",
      },
    ];
  
    return (
      <div className="p-6 bg-white rounded-lg ">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Student Records</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roll Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-800">{student.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{student.rollNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{student.course}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{student.year}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        student.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  export default StudentRecord;