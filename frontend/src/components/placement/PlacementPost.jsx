import { useAdmitedStudentsQuery } from "../../redux/api/authApi";
import placementTemplate from "../../assets/images/ITEG_Placement_Post.jpg";

const PlacementPost = () => {
  console.log("PlacementPost component loaded");

  // Get admitted students data from API
  const { data: admittedStudents, isLoading, error } = useAdmitedStudentsQuery();

  // Filter only placed students (those with placedInfo)
  const placedStudents = admittedStudents?.filter(student => student.placedInfo !== null) || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="text-3xl mb-4">⏳</div>
          <p className="text-lg text-slate-500">Loading placement stories...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="text-3xl mb-4">❌</div>
          <p className="text-lg text-red-500">Error loading placement data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🎉 Placement Success Stories
        </h1>
        <p className="text-lg text-slate-500">
          Celebrating our students achievements and career milestones
        </p>
      </div>

      {/* Empty state when no placed students */}
      {placedStudents.length === 0 ? (
        <div className="text-center py-15 px-5 bg-white rounded-2xl shadow-lg max-w-2xl mx-auto">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-2xl font-semibold text-gray-600 mb-2">
            No Placement Stories Yet
          </h3>
          <p className="text-gray-500 text-lg">
            Success stories will appear here as students get placed
          </p>
        </div>
      ) : (
        /* Cards Grid - Responsive */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 max-w-full mx-auto">
          {placedStudents.map((student) => (
            <div
              key={student.id}
              className="bg-cover bg-center bg-no-repeat rounded-2xl overflow-hidden shadow-lg border border-slate-200 relative aspect-square w-full"
              style={{
                backgroundImage: `url(${placementTemplate})`
              }}
            >
              {/* Content wrapper */}
              <div className="relative h-full flex flex-col">

                {/* Student photo - centered in card */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="rounded-full p-1 bg-orange-600 shadow-lg">
                    <img
                      src={student.image || student.profileImage || "https://via.placeholder.com/120x120/e2e8f0/64748b?text=Student"}
                      alt={`${student.firstName} ${student.lastName}`}
                      className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full object-cover border-4 border-white"
                    />
                  </div>
                </div>

                {/* Student details - positioned at bottom */}
                <div className="absolute bottom-0 left-1 right-1 text-center rounded-lg p-1 sm:p-2 shadow-sm">
                  <h3 className="text-xs sm:text-sm lg:text-base font-bold text-grey-800 mb-1 leading-tight">
                    {student.firstName} {student.lastName}
                  </h3>
               
                  <p className="text-xs sm:text-sm text-gray-700 mb-2 leading-tight">
                    <span className="font-bold text-blue-800">{student.placedInfo.jobProfile}</span> at
                  </p>
                  <div className="text-xs sm:text-sm lg:text-base font-bold text-blue-600 mb-1 leading-tight">
                    {student.placedInfo.companyName}
                  </div>
                  <div className="text-xs sm:text-sm text-green-600 font-semibold leading-tight">
                    {student.placedInfo.location} • ₹{(student.placedInfo.salary / 100000).toFixed(1)} LPA
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlacementPost;  