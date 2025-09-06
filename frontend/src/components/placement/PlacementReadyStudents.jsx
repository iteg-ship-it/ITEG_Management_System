/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../common-components/pagination/Pagination";
import { useGetReadyStudentsForPlacementQuery, useAdmitedStudentsQuery } from "../../redux/api/authApi";
import Loader from "../common-components/loader/Loader";
import CommonTable from "../common-components/table/CommonTable";
import ScheduleInterviewModal from "./ScheduleInterviewModal";
import ConfirmPlacementModal from "./ConfirmPlacementModal";
import CreatePostModal from "./CreatePostModal";
import profile from "../../assets/images/profileImgDummy.jpeg";
import PageNavbar from "../common-components/navbar/PageNavbar";
import { buttonStyles } from "../../styles/buttonStyles";

// Capitalize function
const toTitleCase = (str) =>
  str
    ?.toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const PlacementReadyStudents = () => {
  const navigate = useNavigate();
  const { data = {}, isLoading, refetch } = useGetReadyStudentsForPlacementQuery(undefined, {
    refetchOnMountOrArgChange: true, // Always refetch on mount
    refetchOnFocus: false,
  });
  const students = data?.data || [];

  // Get admitted students data for Placed Student tab
  const { data: admittedStudents } = useAdmitedStudentsQuery();

  const [rowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [selectedResults, setSelectedResults] = useState([]);
  const [selectedPercentages] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('placementActiveTab') || 'Qualified Students';
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isConfirmPlacementModalOpen, setIsConfirmPlacementModalOpen] = useState(false);
  const [selectedStudentForPlacement, setSelectedStudentForPlacement] = useState(null);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [selectedStudentForPost, setSelectedStudentForPost] = useState(null);

  const tabs = ["Qualified Students", "Ongoing Interviews", "Selected Student", "Placed Student"];

  const dynamicTrackOptions = useMemo(() => {
    return [...new Set(students.map((s) => toTitleCase(s.track || "")))].filter(Boolean);
  }, [students]);

  const dynamicResultOptions = useMemo(() => {
    return [
      ...new Set(
        students.flatMap((s) =>
          s.interviews?.map((i) => toTitleCase(i.result || "")) || []
        )
      ),
    ].filter(Boolean);
  }, [students]);

  const filtersConfig = [
    {
      title: "Track",
      options: dynamicTrackOptions,
      selected: selectedTracks,
      setter: setSelectedTracks,
    },
    {
      title: "Result",
      options: dynamicResultOptions,
      selected: selectedResults,
      setter: setSelectedResults,
    },
  ];

  const getLatestInterviewResult = (interviews = []) => {
    if (!interviews.length) return null;
    return [...interviews]
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.result;
  };

  const getFilteredData = () => {
    let filtered = [...students];

    // 🌐 Tab-specific filtering
    if (activeTab === "Ongoing Interviews") {
      filtered = filtered.filter(
        (s) => Array.isArray(s.PlacementinterviewRecord) &&
          s.PlacementinterviewRecord.length > 0 &&
          !s.PlacementinterviewRecord.some((rec) => rec.status?.toLowerCase() === "selected")
      );
    } else if (activeTab === "Qualified Students") {
      filtered = filtered.filter(
        (s) => !s.PlacementinterviewRecord || s.PlacementinterviewRecord.length === 0
      );
    } else if (activeTab === "Selected Student") {
      filtered = filtered.filter(
        (s) =>
          Array.isArray(s.PlacementinterviewRecord) &&
          s.PlacementinterviewRecord.some(
            (rec) => rec.status?.toLowerCase() === "selected"
          )
      );
    } else if (activeTab === "Placed Student") {
      // Use admitted students data for placed students
      const placedStudents = admittedStudents?.filter(student => student.placedInfo !== null) || [];
      filtered = placedStudents;
    }

    // 🧠 Apply filter + search
    return filtered.filter((student) => {
      const track = toTitleCase(student.track || "");
      const latestResult = toTitleCase(
        getLatestInterviewResult(student.interviews || []) || ""
      );
      const percentage = student.interviewPercentage || 0;

      const trackMatch =
        selectedTracks.length === 0 || selectedTracks.includes(track);
      const resultMatch =
        selectedResults.length === 0 ||
        selectedResults.includes(latestResult);
      const percentageMatch =
        selectedPercentages.length === 0 ||
        selectedPercentages.some((range) => {
          const [min, max] = range.replace("%", "").split("-").map(Number);
          return percentage >= min && percentage <= max;
        });

      const searchMatch =
        searchTerm.trim() === "" ||
        `${student.firstName} ${student.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentMobile?.includes(searchTerm);

      return (
        trackMatch && resultMatch && percentageMatch && searchMatch
      );
    });
  };

  // Helper function to get latest company info
  const getLatestCompanyInfo = (student) => {
    // Check placedInfo first (most recent confirmed placement)
    if (student.placedInfo?.companyName) {
      return {
        companyName: student.placedInfo.companyName,
        jobProfile: student.placedInfo.jobProfile,
        isPlaced: true
      };
    }

    // Fallback to latest selected interview
    const selectedInterviews = student.PlacementinterviewRecord?.filter(
      (interview) => interview.status?.toLowerCase() === "selected"
    ) || [];

    if (selectedInterviews.length === 0) return {};

    const latestInterview = selectedInterviews.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0))[0];

    return {
      companyName: latestInterview.companyName || latestInterview.company?.companyName || latestInterview.companyRef?.companyName,
      jobProfile: latestInterview.jobProfile,
      isPlaced: false
    };
  };

  const columns = activeTab === "Selected Student" ? [
    {
      key: "profile",
      label: "Full Name",
      render: (row) => (
        <div className="flex items-center gap-2">
          <img
            src={row.image || profile}
            alt="avatar"
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">{`${row.firstName} ${row.lastName}`}</span>
            <span className="text-xs text-gray-500">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "fatherName",
      label: "Father Name",
      render: (row) => toTitleCase(row.fatherName),
    },
    {
      key: "studentMobile",
      label: "Mobile no.",
      align: "center",
      render: (row) => `+91 ${row.studentMobile}`,
    },

    {
      key: "companyName",
      label: "Company",
      render: (row) => {
        const latestInfo = getLatestCompanyInfo(row);
        return toTitleCase(latestInfo.companyName || "N/A");
      },
    },
    {
      key: "jobProfile",
      label: "Role",
      render: (row) => {
        const latestInfo = getLatestCompanyInfo(row);
        return toTitleCase(latestInfo.jobProfile || "N/A");
      },
    },
    {
      key: "addInterview",
      label: "Add Interview",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedStudent(row);
            setIsModalOpen(true);
          }}
          className={buttonStyles.primary}
        >
          + Add Interview
        </button>
      ),
    },
    {
      key: "confirmPlacement",
      label: "Confirm Placement",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedStudentForPlacement(row);
            setIsConfirmPlacementModalOpen(true);
          }}
          className={buttonStyles.primary}
        >
          Confirm Placement
        </button>
      ),
    },

  ] : activeTab === "Placed Student" ? [
    {
      key: "profile",
      label: "Full Name",
      render: (row) => (
        <div className="flex items-center gap-2">
          <img
            src={row.image || profile}
            alt="avatar"
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">{`${row.firstName} ${row.lastName}`}</span>
            <span className="text-xs text-gray-500">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "fatherName",
      label: "Father Name",
      render: (row) => toTitleCase(row.fatherName),
    },
    {
      key: "studentMobile",
      label: "Mobile no.",
      align: "center",
      render: (row) => `+91 ${row.studentMobile}`,
    },
    {
      key: "companyName",
      label: "Company",
      render: (row) => toTitleCase(row.placedInfo?.companyName || "N/A"),
    },
    {
      key: "jobProfile",
      label: "Role",
      render: (row) => toTitleCase(row.placedInfo?.jobProfile || "N/A"),
    },
    {
      key: "salary",
      label: "Salary",
      render: (row) => row.placedInfo?.salary ? `₹${(row.placedInfo.salary / 100000).toFixed(1)} LPA` : "N/A",
    },
    {
      key: "location",
      label: "Location",
      render: (row) => toTitleCase(row.placedInfo?.location || "N/A"),
    },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedStudentForPost(row);
            setIsCreatePostModalOpen(true);
          }}
          className={buttonStyles.primary}
        >
          Create Post
        </button>
      ),
    },
  ] : [
    {
      key: "profile",
      label: "Full Name",
      render: (row) => (
        <div className="flex items-center gap-2">
          <img
            src={row.image || profile}
            alt="avatar"
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">{`${row.firstName} ${row.lastName}`}</span>
            <span className="text-xs text-gray-500">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "fatherName",
      label: "Father Name",
      render: (row) => toTitleCase(row.fatherName),
    },
    {
      key: "studentMobile",
      label: "Mobile no.",
      align: "center",
      render: (row) => `+91 ${row.studentMobile}`,
    },
    {
      key: "track",
      label: "Track",
      render: (row) => toTitleCase(row.track || "N/A"),
    },
    {
      key: "techno",
      label: "Technology",
      render: (row) => toTitleCase(row.techno),
    },

  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('placementActiveTab', tab);
  };

  // Load active tab from localStorage on component mount
  useEffect(() => {
    const savedTab = localStorage.getItem('placementActiveTab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleRowClick = (student) => {
    if (activeTab === "Qualified Students") {
      navigate(`/student-profile/${student._id}`);
    } else if (activeTab === "Ongoing Interviews" || activeTab === "Selected Student") {
      navigate(`/interview-history/${student._id}`);
    } else if (activeTab === "Placed Student") {
      navigate(`/student-profile/${student._id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <PageNavbar
        title="Placement Process"
        subtitle="Manage student placement workflow and interviews"
        showBackButton={false}
      />
      <div className="mt-1 border bg-[var(--backgroundColor)] shadow-sm rounded-lg">
        <div className="px-6">
          {/* Tabs */}
          <div className="flex gap-6 mt-4">
            {tabs.map((tab) => (
              <p
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`cursor-pointer text-md text-[var(--text-color)] pb-2 border-b-2 ${activeTab === tab
                  ? "border-[var(--text-color)] font-semibold"
                  : "border-gray-200"
                  }`}
              >
                {tab}
              </p>
            ))}
          </div>

          {/* Filters + Search */}
          <div className="flex justify-between items-center flex-wrap gap-4">
            <Pagination
              rowsPerPage={rowsPerPage}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filtersConfig={filtersConfig}
              filteredData={getFilteredData()}
              selectedRows={selectedRows}
              allData={students}
              sectionName={activeTab.replace(/\s+/g, '').toLowerCase()}
            />
          </div>
        </div>

        {/* Table */}
        <CommonTable
          columns={columns}
          data={getFilteredData()}
          editable={true}
          pagination={true}
          rowsPerPage={rowsPerPage}
          searchTerm={searchTerm}
          actionButton={activeTab === "Qualified Students" || activeTab === "Ongoing Interviews" ? (student) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedStudent(student);
                setIsModalOpen(true);
              }}
              className={buttonStyles.primary}
            >
              + Add Interview
            </button>
          ) : null}
          onSelectionChange={setSelectedRows}
          onRowClick={handleRowClick}
        />

        {/* Modal */}
        <ScheduleInterviewModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedStudent(null);
          }}
          studentId={selectedStudent?._id}
          onSuccess={async () => {
            // Force refetch with cache invalidation
            await refetch();
            // Small delay to ensure backend has processed the data
            setTimeout(() => refetch(), 500);
          }}
        />

        {/* Confirm Placement Modal */}
        <ConfirmPlacementModal
          isOpen={isConfirmPlacementModalOpen}
          onClose={() => {
            setIsConfirmPlacementModalOpen(false);
            setSelectedStudentForPlacement(null);
          }}
          student={selectedStudentForPlacement}
          onSuccess={async () => {
            // Force refetch with cache invalidation
            await refetch();
            // Small delay to ensure backend has processed the data
            setTimeout(() => refetch(), 500);
          }}
        />

        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={isCreatePostModalOpen}
          onClose={() => {
            setIsCreatePostModalOpen(false);
            setSelectedStudentForPost(null);
          }}
          student={selectedStudentForPost}
          onSuccess={() => {
            console.log('Post created successfully');
          }}
        />
      </div>
    </>
  );
};

export default PlacementReadyStudents;