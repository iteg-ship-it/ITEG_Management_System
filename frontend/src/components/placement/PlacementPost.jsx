import { useState } from "react";
import { useAdmitedStudentsQuery } from "../../redux/api/authApi";
import placementTemplate from "../../assets/images/ITEG_Placement_Post.jpg";
import PageNavbar from "../common-components/navbar/PageNavbar";
import CreatePostModal from "./CreatePostModal";

const PlacementPost = () => {
  console.log("PlacementPost component loaded");
  const [isCreatePostModalOpen, setCreatePostModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Helper function to capitalize first letter
  const toTitleCase = (str) => {
    return str?.toLowerCase().split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

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

      // Hide buttons temporarily
      const buttons = targetCard.querySelector('.absolute.top-2.right-2');
      if (buttons) {
        buttons.style.display = 'none';
      }

      // Capture the card element
      const canvas = await html2canvas(targetCard, {
        useCORS: true,
        allowTaint: true,
        scale: 3,
        backgroundColor: '#ffffff'
      });

      // Show buttons again
      if (buttons) {
        buttons.style.display = 'flex';
      }

      // Convert to JPG and download
      const link = document.createElement('a');
      link.download = `${student.firstName}_${student.lastName}_placement_post.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 1.0);
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
    <div className="min-h-screen">
      {/* Header */}
      <PageNavbar
        title="Placement Post"
        subtitle="Placed students post and details"
        showBackButton={false}
      />

      <div className="">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-">
            {placedStudents.map((student, index) => (
              <div
                key={student.id || index}
                data-student-id={student._id}
                className="bg-cover bg-center bg-no-repeat   overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border-0.5 border-slate-200 relative w-full"
                style={{
                  backgroundImage: `url(${placementTemplate})`,
                  backgroundSize: '100% 100%',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                  aspectRatio: '1/1',
                  minHeight: '100%',
                  imageRendering: 'crisp-edges'
                }}
              >
                {/* Content wrapper */}
                <div className="relative h-full flex flex-col">

                  {/* Student photo - centered in card */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="rounded-full p-1 sm:p-1.5 bg-white shadow-lg">
                      <div className="rounded-full p-1 sm:p-1.5 bg-orange-600">
                        <img
                          src={student.image || student.profileImage || "https://via.placeholder.com/120x120/e2e8f0/64748b?text=Student"}
                          alt={`${student.firstName} ${student.lastName}`}
                          className="rounded-full object-cover border-1 sm:border-2 border-white"
                          style={{
                            width: 'clamp(2rem, 8vw, 9rem)',
                            height: 'clamp(3rem, 8vw, 9rem)'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Student details - positioned at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 text-center rounded-b-xl sm:rounded-b-2xl p-2 sm:p-4">
                    <h3 className="text-sm sm:text-xl font-bold text-blue-800 mb-1">
                      {toTitleCase(student.firstName)} {toTitleCase(student.lastName)}
                    </h3>
                    <p className="text-lg sm:text-base text-black mb-1 font-medium">
                      {student.village || 'Address'}
                    </p>
                    <p className="text-xs sm:text-sm text-black font-semibold mb-1 ">
                      {student.course || 'Course'}
                    </p>
                    <hr className="my-1 border-black w-32 mx-auto" />
                    <p> got placed as a <span className="text-xs sm:text-sm text-black font-semibold mb-1">
                      {student.placedInfo.jobProfile}
                    </span> in </p>
                    <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-blue-800">
                      <span className="text-lg">🏢</span>
                      <span className="font-bold">{student.placedInfo.companyName}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStudent(student);
                        setCreatePostModalOpen(true);
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-full transition-colors shadow-lg"
                      title="Edit Post"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadPost(student);
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-full transition-colors shadow-lg"
                      title="Download Post"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
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