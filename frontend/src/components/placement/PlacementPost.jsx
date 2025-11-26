import { useState, useRef } from "react";
import { useAdmitedStudentsQuery, useUpdateStudentImageMutation } from "../../redux/api/authApi";
import { pdf } from "@react-pdf/renderer";
import PageNavbar from "../common-components/navbar/PageNavbar";
import CreatePostModal from "./CreatePostModal";
import CommonTable from "../common-components/table/CommonTable";
import Loader from "../common-components/loader/Loader";
import profile from "../../assets/images/profileImgDummy.jpeg";
import iteg from "../../assets/images/logo.png";
import ssism from "../../assets/images/iteg-logo.png";
import Pagination from "../common-components/pagination/Pagination";
import PlacementPostPDF from "./PlacementPostPDF";

const PlacementPost = () => {
  console.log("PlacementPost component loaded");
  const [isCreatePostModalOpen, setCreatePostModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [uploadingStudents, setUploadingStudents] = useState({});
  const [updateStudentImage] = useUpdateStudentImageMutation();
  const fileInputRef = useRef(null);
  
  // Get admitted students data from API with refetch function
  const { data: admittedStudents, isLoading, error, refetch } = useAdmitedStudentsQuery();

  // Helper function to capitalize first letter
  const toTitleCase = (str) => {
    return str?.toLowerCase().split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };



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

  // Image upload function
  const handleImageUpload = async (event, student) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingStudents(prev => ({ ...prev, [student._id]: true }));

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64Image = e.target.result;
        await updateStudentImage({
          id: student._id,
          image: base64Image
        }).unwrap();
        
        // Refetch data to update UI immediately
        refetch();
      } catch (error) {
        const errorMessage = error?.data?.message || error?.message || 'Unknown error';
        alert(`Failed to upload image: ${errorMessage}`);
      } finally {
        setUploadingStudents(prev => ({ ...prev, [student._id]: false }));
      }
    };

    reader.onerror = () => {
      alert('Error reading file');
      setUploadingStudents(prev => ({ ...prev, [student._id]: false }));
    };

    reader.readAsDataURL(file);
  };

  const triggerImageUpload = (student) => {
    fileInputRef.current?.click();
    fileInputRef.current.onchange = (e) => handleImageUpload(e, student);
  };

  // Download post function using react-pdf-renderer
  const downloadPost = async (student) => {
    try {
      console.log('Starting download for student:', student.firstName, student.lastName);
      
      // Generate PDF blob
      const blob = await pdf(<PlacementPostPDF student={student} />).toBlob();
      console.log('PDF blob generated successfully');
      
      // Create download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${student.firstName}_${student.lastName}_placement_post.pdf`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(link.href);
      console.log('Download completed successfully');
    } catch (error) {
      console.error('Error downloading post:', error);
      alert('Failed to download post. Please try again.');
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
                render: (row) => toTitleCase(row.placedInfo?.companyName) || 'N/A',
              },
              {
                key: "position",
                label: "Position",
                render: (row) => toTitleCase(row.placedInfo?.jobProfile) || 'N/A',
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
                    <div className="relative">
                      <div className="rounded-full p-1 bg-white">
                        <div className="rounded-full p-1 bg-orange-500">
                          <img
                            src={student.image || student.profileImage || "https://via.placeholder.com/150x150/e2e8f0/64748b?text=Student"}
                            alt={`${student.firstName} ${student.lastName}`}
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-white shadow-md"
                          />
                        </div>
                      </div>
                      <div
                        className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => triggerImageUpload(student)}
                      >
                        {uploadingStudents[student._id] ? (
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
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
                        {toTitleCase(student.placedInfo?.jobProfile) || "Position"}
                      </span> in</p>
                      <p className="text-sm font-bold text-[#133783]">
                        {toTitleCase(student.placedInfo?.companyName) || "Company"}
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

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
      />

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

    </div >
  );
};

export default PlacementPost;  