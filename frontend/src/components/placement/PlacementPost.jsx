import { useState } from "react";
import { useAdmitedStudentsQuery } from "../../redux/api/authApi";
// import placementTemplate from "../../assets/images/ITEG_Placement_Post.jpg";
import PageNavbar from "../common-components/navbar/PageNavbar";
import CreatePostModal from "./CreatePostModal";
import CommonTable from "../common-components/table/CommonTable";
import Loader from "../common-components/loader/Loader";
import profile from "../../assets/images/profileImgDummy.jpeg";
import iteg from "../../assets/images/logo.png";
import ssism from "../../assets/images/iteg-logo.png";
import Pagination from "../common-components/pagination/Pagination";

const PlacementPost = () => {
  console.log("PlacementPost component loaded");
  const [isCreatePostModalOpen, setCreatePostModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // Helper function to capitalize first letter
  const toTitleCase = (str) => {
    return str?.toLowerCase().split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Get admitted students data from API
  const { data: admittedStudents, isLoading, error } = useAdmitedStudentsQuery();

  // Filter only placed students (those with placedInfo)
  const allPlacedStudents = admittedStudents?.filter(student => student.placedInfo !== null) || [];

  // Dynamic filter options
  const dynamicTrackOptions = [...new Set(allPlacedStudents.map(s => toTitleCase(s.track || "")))].filter(Boolean);
  const dynamicSubjectOptions = [...new Set(allPlacedStudents.map(s => toTitleCase(s.course || "")))].filter(Boolean);

  // Filter configuration for Pagination
  const filtersConfig = [
    {
      title: "Track",
      options: dynamicTrackOptions,
      selected: selectedTracks,
      setter: setSelectedTracks,
    },
    {
      title: "Subject",
      options: dynamicSubjectOptions,
      selected: selectedSubjects,
      setter: setSelectedSubjects,
    },
  ];

  // Apply filters to get final data
  const placedStudents = allPlacedStudents.filter((student) => {
    const track = toTitleCase(student.track || "");
    const subject = toTitleCase(student.course || "");

    const trackMatch = selectedTracks.length === 0 || selectedTracks.includes(track);
    const subjectMatch = selectedSubjects.length === 0 || selectedSubjects.includes(subject);

    const searchMatch = searchTerm.trim() === "" ||
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.placedInfo?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());

    return trackMatch && subjectMatch && searchMatch;
  });

  // Download post function
  const downloadPost = async (student) => {
    try {
      // Import html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;

      let targetCard = null;
      let isTemporary = false;

      // First try to find existing card element (for grid view)
      const cardElements = document.querySelectorAll('[data-student-id]');
      cardElements.forEach(card => {
        if (card.getAttribute('data-student-id') === student._id) {
          targetCard = card;
        }
      });

      // If no card found (table view), create temporary card
      if (!targetCard) {
        isTemporary = true;
        targetCard = document.createElement('div');
        targetCard.className = 'bg-cover bg-center bg-no-repeat rounded-xl shadow-lg border border-gray-200 aspect-square flex flex-col items-center justify-between p-4 relative';
        targetCard.style.width = '400px';
        targetCard.style.height = '400px';
        targetCard.style.backgroundColor = '#ffffff';
        
        targetCard.innerHTML = `
          <div class="w-full text-center">
            <div class="flex justify-between items-center mb-1">
              <img src="${iteg}" alt="ITEG" class="h-14" />
              <img src="${ssism}" alt="SSISM" class="h-14" />
            </div>
            <h3 class="text-4xl font-bold text-[#133783] -mt-1">Congratulations</h3>
            <p class="text-xl text-gray-500">We are proud to announce that <br />Our ITEG student</p>
          </div>
          <div class="flex justify-center items-center flex-1">
            <div class="rounded-full p-1 bg-white">
              <div class="rounded-full p-1 bg-orange-500">
                <img
                  src="${student.image || student.profileImage || "https://via.placeholder.com/150x150/e2e8f0/64748b?text=Student"}"
                  alt="${student.firstName} ${student.lastName}"
                  class="w-24 h-24 rounded-full object-cover border-2 border-white shadow-md"
                />
              </div>
            </div>
          </div>
          <div class="w-full text-center pt-3">
            <h3 class="text-lg font-bold text-[#133783] mb-1">
              ${toTitleCase(student.firstName)} ${toTitleCase(student.lastName)}
            </h3>
            <p class="text-xs text-black">${student.village || "Location"}</p>
            <p class="text-sm font-semibold text-black">${student.course || "Course"}</p>
            <div class="mt-3 relative">
              <div class="border-t border-black w-1/5 mx-auto mb-3"></div>
              <p class="text-sm text-black">got placed as a <span class="font-semibold">
                ${student.placedInfo?.jobProfile || "Position"}
              </span> in</p>
              <p class="text-sm font-bold text-[#133783]">
                ${student.placedInfo?.companyName || "Company"}
              </p>
            </div>
          </div>
        `;
        
        // Add to DOM temporarily
        targetCard.style.position = 'absolute';
        targetCard.style.left = '-9999px';
        document.body.appendChild(targetCard);
      }

      // Hide buttons temporarily (only for existing cards)
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

      // Show buttons again (only for existing cards)
      if (buttons) {
        buttons.style.display = 'flex';
      }

      // Remove temporary card
      if (isTemporary) {
        document.body.removeChild(targetCard);
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
          <Loader />
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
    <div className="min-h-screen pb-7">
      {/* Header */}
      <PageNavbar
        title="Placement Post"
        subtitle="Placed students post and details"
        showBackButton={false}
        rightContent={
          <div className="bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 py-2 rounded-md transition-colors ${viewMode === 'grid'
                ? 'bg-orange-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2 py-2 rounded-md transition-colors ${viewMode === 'table'
                ? 'bg-orange-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        }
      />

      <div className="mt-1 border bg-[var(--backgroundColor)] shadow-sm rounded-lg pb-5">
        {/* Pagination Controls - Show in both modes */}
        <div className="px-6">
          <Pagination
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filtersConfig={filtersConfig}
            allData={allPlacedStudents}
            selectedRows={[]}
            sectionName="placement-posts"
          />
        </div>

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
        ) : viewMode === 'table' ? (
          /* Table View */
          <CommonTable
            columns={[
              {
                key: "profile",
                label: "Student",
                render: (row) => (
                  <div className="flex items-center gap-3">
                    <img
                      src={row.image || profile}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium">
                        {toTitleCase(row.firstName)} {toTitleCase(row.lastName)}
                      </div>
                      <div className="text-sm text-gray-500">{row.email}</div>
                    </div>
                  </div>
                ),
              },
              {
                key: "course",
                label: "Course",
                render: (row) => row.course || 'N/A',
              },
              {
                key: "location",
                label: "Location",
                render: (row) => row.village || 'N/A',
              },
              {
                key: "company",
                label: "Company",
                render: (row) => toTitleCase(row.placedInfo?.companyName || 'N/A'),
              },
              {
                key: "position",
                label: "Position",
                render: (row) => toTitleCase(row.placedInfo?.jobProfile || 'N/A'),
              },
              {
                key: "salary",
                label: "Salary",
                render: (row) => row.placedInfo?.salary ? `₹${(row.placedInfo.salary / 100000).toFixed(1)} LPA` : 'N/A',
              },
              {
                key: "update",
                label: "Update",
                render: (row) => (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStudent(row);
                      setCreatePostModalOpen(true);
                    }}
                    className="bg-orange-400 hover:bg-orange-500 text-white px-3 py-2 rounded-md transition-colors flex items-center gap-2"
                    title="Update Post"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Update
                  </button>
                )
              },
              {
                key: "download",
                label: "Download",
                render: (row) => (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadPost(row);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md transition-colors flex items-center gap-2"
                    title="Download Post"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Download
                  </button>
                )
              },
            ]}
            data={placedStudents}
            pagination={true}
            rowsPerPage={10}
          />
        ) : (
          /* Cards Grid - Fully Responsive */
          <div className="mt-8 px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {placedStudents.map((student, index) => (
                <div
                  key={student._id || index}
                  data-student-id={student._id}
                  className="bg-cover bg-center bg-no-repeat rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 aspect-square flex flex-col items-center justify-between p-4 relative"
                // style={{
                //   backgroundImage: `url(${placementTemplate})`,
                //   backgroundSize: 'cover',
                //   backgroundPosition: 'center'
                // }}
                >
                  <div className="w-full text-center">
                    <div className="flex justify-between items-center mb-1">
                      <img src={iteg} alt="ITEG" className="h-14" />
                      <img src={ssism} alt="SSISM" className="h-14" />
                    </div>
                    <h3 className="text-4xl font-bold text-[#133783] -mt-1">Congratulations</h3>
                    <p className="text-xl text-gray-500">We are proud to announce that <br />Our ITEG student</p>
                  </div>
                  <div className="flex justify-center items-center flex-1">
                    <div className="rounded-full p-1 bg-white">
                      <div className="rounded-full p-1 bg-orange-500">
                        <img
                          src={student.image || student.profileImage || "https://via.placeholder.com/150x150/e2e8f0/64748b?text=Student"}
                          alt={`${student.firstName} ${student.lastName}`}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-white shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="w-full text-center pt-3">
                    <h3 className="text-lg font-bold text-[#133783] mb-1">
                      {toTitleCase(student.firstName)} {toTitleCase(student.lastName)}
                    </h3>
                    <p className="text-xs text-black">{student.village || "Location"}</p>
                    <p className="text-sm font-semibold text-black">{student.course || "Course"}</p>
                    <div className="mt-3 relative">
                      <div className="border-t border-black w-1/5 mx-auto mb-3"></div>
                      <p className="text-sm text-black">got placed as a <span className="font-semibold">
                        {student.placedInfo?.jobProfile || "Position"}
                      </span> in</p>
                      <p className="text-sm font-bold text-[#133783]">
                        {student.placedInfo?.companyName || "Company"}
                      </p>
                    </div>
                  </div>
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
              ))}
            </div>
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

      {/* Square Responsive Cards */}
      {/* {viewMode === "grid" && (
        <div className="mt-8 px-4">
          <h2 className="text-2xl font-bold text-center mb-6">Our Success Stories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {placedStudents.map((student, index) => (
              <div
                key={student._id || index}
                data-student-id={student._id}
                className="bg-cover bg-center bg-no-repeat rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 aspect-square flex flex-col items-center justify-between p-4 relative"
                // style={{
                //   backgroundImage: `url(${placementTemplate})`,
                //   backgroundSize: 'cover',
                //   backgroundPosition: 'center'
                // }}
              >
                <div className="w-full text-center">
                  <div className="flex justify-between items-center mb-2">
                    <img src={iteg} alt="ITEG" className="h-14" />
                    <img src={ssism} alt="SSISM" className="h-14" />
                  </div>
                  <h3 className="text-4xl font-bold text-[#133783]">Congratulations</h3>
                  <p className="text-xl text-gray-500">We are proud to announce that <br />Our ITEG student</p>
                </div>
                <div className="flex justify-center items-center flex-1">
                  <div className="rounded-full p-1 bg-white">
                    <div className="rounded-full p-1 bg-orange-500">
                      <img
                        src={student.image || student.profileImage || "https://via.placeholder.com/150x150/e2e8f0/64748b?text=Student"}
                        alt={`${student.firstName} ${student.lastName}`}
                        className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    </div>
                  </div>
                </div>
                <div className="w-full text-center pt-3">
                  <h3 className="text-lg font-bold text-[#133783] mb-1">
                    {toTitleCase(student.firstName)} {toTitleCase(student.lastName)}
                  </h3>
                  <p className="text-xs text-black">{student.village || "Location"}</p>
                  <p className="text-sm font-semibold text-black">{student.course || "Course"}</p>
                  <div className="mt-3 relative">
                    <div className="border-t border-black w-1/5 mx-auto mb-3"></div>
                    <p className="text-sm text-black">got placed as a <span className="font-semibold">
                      {student.placedInfo?.jobProfile || "Position"}
                    </span> in</p>
                    <p className="text-sm font-bold text-[#133783]">
                      {student.placedInfo?.companyName || "Company"}
                    </p>
                  </div>
                </div>
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
            ))}
          </div>
        </div>
      )} */}



    </div >
  );
};

export default PlacementPost;  