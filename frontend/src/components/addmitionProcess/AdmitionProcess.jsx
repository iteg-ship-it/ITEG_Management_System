const AdmitionProcess = () => {
  return (
    <div className="p-4">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-semibold">Harda Registration</h2>
      <div className="flex items-center space-x-2">
        <button className="bg-white border rounded px-3 py-1 text-sm">Show Entries</button>
        <button className="bg-white border rounded px-3 py-1 text-sm">Download</button>
        <button className="bg-white border rounded px-3 py-1 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <div className="relative">
          <input type="text" placeholder="Search..." className="border rounded px-3 py-1 text-sm pl-8" />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2 top-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded">
        <thead>
          <tr className="bg-gray-50">
            <th className="py-2 px-4 border-b text-left"></th>
            <th className="py-2 px-4 border-b text-left">S. No.</th>
            <th className="py-2 px-4 border-b text-left">Name</th>
            <th className="py-2 px-4 border-b text-left">Fathers Name</th>
            <th className="py-2 px-4 border-b text-left">Mobile</th>
            <th className="py-2 px-4 border-b text-left">Village</th>
            <th className="py-2 px-4 border-b text-left">Course</th>
            <th className="py-2 px-4 border-b text-left">Edit</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 9 }).map((_, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
              <td className="py-2 px-4 border-b">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out" />
              </td>
              <td className="py-2 px-4 border-b">{index + 1}</td>
              <td className="py-2 px-4 border-b">ana sha</td>
              <td className="py-2 px-4 border-b">John Sha</td>
              <td className="py-2 px-4 border-b">8123456787</td>
              <td className="py-2 px-4 border-b">Harda</td>
              <td className="py-2 px-4 border-b">Iteg</td>
              <td className="py-2 px-4 border-b">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="mt-4 flex justify-between items-center">
      <div className="text-sm text-gray-600">Show Entries 1 to 9</div>
      <div>
        <button className="bg-white border rounded px-3 py-1 text-sm">...</button>
      </div>
    </div>
  </div>
  );
};

export default AdmitionProcess;
