import { useState } from "react";
import { useAdmitedStudentsQuery } from "../../redux/api/authApi";
import placementTemplate from "../../assets/images/ITEG_Placement_Post.jpg";
import PageNavbar from "../common-components/navbar/PageNavbar";
import CreatePostModal from "./CreatePostModal";

const PlacementPost = () => {
  console.log("PlacementPost component loaded");
  const [isCreatePostModalOpen, setCreatePostModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Get admitted students data from API
  const { data: admittedStudents, isLoading, error } = useAdmitedStudentsQuery();

  // Filter only placed students (those with placedInfo)
  const placedStudents = admittedStudents?.filter(student => student.placedInfo !== null) || [];

  // Download post function
  const downloadPost = async (student) => {
    try {
      // Import html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;
      
      // Find the specific card element
      const cardElements = document.querySelectorAll('[data-student-id]');
      let targetCard = null;
      
      cardElements.forEach(card => {
        if (card.getAttribute('data-student-id') === student._id) {
          targetCard = card;
        }
      });
      
      if (!targetCard) {
        console.error('Card element not found');
        return;
      }
      
      // Capture the card element
      const canvas = await html2canvas(targetCard, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        backgroundColor: null
      });
      
      // Convert to JPG and download
      const link = document.createElement('a');
      link.download = `${student.firstName}_${student.lastName}_placement_post.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    } catch (error) {
      console.error('Error downloading post:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageNavbar
          title="Placement Post" 
          subtitle="Loading..."
          showBackButton={false}
        />
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-base sm:text-lg text-slate-500">Loading placement stories...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageNavbar
          title="Placement Post" 
          subtitle="Error occurred"
          showBackButton={false}
        />
        <div className="flex justify-center items-center h-96">
          <div className="text-center bg-white p-6 sm:p-8 rounded-2xl shadow-lg mx-4">
            <div className="text-4xl sm:text-6xl mb-4">❌</div>
            <h3 className="text-lg sm:text-xl font-semibold text-red-600 mb-2">Error Loading Data</h3>
            <p className="text-sm sm:text-base text-gray-600">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageNavbar
        title="Placement Post" 
        subtitle="Placed students post and details"
        showBackButton={false}
      />

      <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        {/* Empty state when no placed students */}
        {placedStudents.length === 0 ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="text-center py-12 sm:py-16 px-4 sm:px-8 bg-white rounded-2xl shadow-lg max-w-md mx-auto">
              <div className="text-4xl sm:text-6xl mb-4">🎓</div>
              <h3 className="text-lg sm:text-2xl font-semibold text-gray-600 mb-2">
                No Placement Stories Yet
              </h3>
              <p className="text-sm sm:text-lg text-gray-500">
                Success stories will appear here as students get placed
              </p>
            </div>
          </div>
        ) : (
          /* Cards Grid - Fully Responsive */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
            {placedStudents.map((student, index) => (
              <div
                key={student.id || index}
                data-student-id={student._id}
                className="bg-cover bg-center bg-no-repeat rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-200 relative w-full"
                style={{
                  backgroundImage: `url(${placementTemplate})`,
                  aspectRatio: '1/1'
                }}
              >
                {/* Content wrapper */}
                <div className="relative h-full flex flex-col">

                  {/* Student photo - centered in card */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="rounded-full p-0.5 sm:p-1 bg-orange-600 shadow-lg">
                      <img
                        src={student.image || student.profileImage || "https://via.placeholder.com/120x120/e2e8f0/64748b?text=Student"}
                        alt={`${student.firstName} ${student.lastName}`}
                        className="w-12 h-12 xs:w-16 xs:h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-full object-cover border-2 sm:border-4 border-white"
                      />
                    </div>
                  </div>

                  {/* Student details - positioned at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 text-center rounded-b-xl sm:rounded-b-2xl p-1 xs:p-2 sm:p-3 bg-gradient-to-t from-black/60 to-transparent">
                    <h3 className="text-xs xs:text-sm sm:text-base md:text-lg font-bold text-white mb-1 leading-tight drop-shadow-lg">
                      {student.firstName} {student.lastName}
                    </h3>
                 
                    <p className="text-xs xs:text-xs sm:text-sm text-white/90 mb-1 leading-tight drop-shadow">
                      <span className="font-bold text-blue-200">{student.placedInfo.jobProfile}</span> at
                    </p>
                    <div className="text-xs xs:text-sm sm:text-base font-bold text-blue-100 mb-1 leading-tight drop-shadow">
                      {student.placedInfo.companyName}
                    </div>
                    <div className="text-xs xs:text-xs sm:text-sm text-green-200 font-semibold leading-tight drop-shadow">
                      {student.placedInfo.location} • ₹{(student.placedInfo.salary / 100000).toFixed(1)} LPA
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Create Post button clicked for:', student.firstName);
                        setSelectedStudent(student);
                        setCreatePostModalOpen(true);
                        console.log('Modal should open now');
                      }}
                      className="bg-[#FDA92D] hover:bg-orange-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors shadow-lg"
                    >
                      Create Post
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadPost(student);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors shadow-lg"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setCreatePostModalOpen(false)}
        student={selectedStudent}
        onSuccess={() => {
          // Refresh data or show success message
          console.log('Post created successfully');
        }}
      />
    </div>
  );
};

export default PlacementPost;  