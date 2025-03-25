const Dashboard = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen w-[75vw]">
      <div className="bg-white shadow-md p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Explore Student Data by Year</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["1st Year", "2nd Year", "3rd Year"].map((year, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg p-5 border border-gray-200">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                👨‍🎓Trainee Level ({year})
              </h3>
              <p className="text-sm text-gray-600 mt-1">All enrolled {year.toLowerCase()} students categorized by department</p>
              <p className="text-sm font-medium mt-3">Total: 120 students</p>
              <div className={`h-1 w-full mt-2 rounded ${index === 0 ? "bg-orange-500" : index === 1 ? "bg-blue-500" : "bg-green-500"}`}></div>
              <button className="mt-4 w-full flex items-center justify-between text-blue-600 font-semibold py-2 px-4 border rounded-lg shadow-sm hover:bg-blue-100">
                View Students <span>➡️</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
