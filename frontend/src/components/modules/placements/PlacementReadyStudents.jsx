import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetNewReadyStudentsQuery,
  useGetNewSelectedStudentsQuery,
  useGetNewPlacedStudentsQuery,
} from "../../../redux/api/authApi";
import Loader from "../../shared/loader/Loader";
import CommonTable from "../../shared/table/CommonTable";
import Header from "../../shared/sidebar/Header";
import TabsCommon from "../../shared/table/TabsCommon";
import Avatar from "../../shared/Avatar";
import ScheduleInterviewModal from "./ScheduleInterviewModal";
import ConfirmPlacementModal from "./ConfirmPlacementModal";
import CreatePostModal from "./CreatePostModal";
import { buttonStyles } from "../../../styles/buttonStyles";

const toTitle = (str) =>
  str?.toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "";

const TABS = ["Qualified Students", "Ongoing Interviews", "Selected Student", "Placed Student"];

const PlacementReadyStudents = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]   = useState("Qualified Students");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent]                   = useState(null);
  const [isInterviewModalOpen, setIsInterviewModalOpen]         = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen]             = useState(false);
  const [isPostModalOpen, setIsPostModalOpen]                   = useState(false);
  const [selectedForPlacement, setSelectedForPlacement]         = useState(null);
  const [selectedForPost, setSelectedForPost]                   = useState(null);

  const { data: readyRes  = {}, isLoading: loadingReady,    refetch: refetchReady    } = useGetNewReadyStudentsQuery();
  const { data: selectedRes = {}, isLoading: loadingSelected, refetch: refetchSelected } = useGetNewSelectedStudentsQuery();
  const { data: placedRes = {}, isLoading: loadingPlaced,   refetch: refetchPlaced   } = useGetNewPlacedStudentsQuery();

  const readyStudents    = readyRes.data    || [];
  const selectedStudents = selectedRes.data || [];
  const placedStudents   = placedRes.data   || [];

  const isLoading = loadingReady || loadingSelected || loadingPlaced;

  // For "Ongoing Interviews" — ready students who have at least one active interview (Scheduled/Ongoing/Rescheduled)
  const ongoingStudents = useMemo(() =>
    readyStudents.filter((s) =>
      s.PlacementinterviewRecord?.some((r) =>
        ["Scheduled", "Ongoing", "Rescheduled"].includes(r.status)
      )
    ), [readyStudents]);

  // For "Qualified Students" — ready students with no active interview
  const qualifiedStudents = useMemo(() =>
    readyStudents.filter((s) =>
      !s.PlacementinterviewRecord?.some((r) =>
        ["Scheduled", "Ongoing", "Rescheduled"].includes(r.status)
      )
    ), [readyStudents]);

  const getActiveData = () => {
    const map = {
      "Qualified Students":  qualifiedStudents,
      "Ongoing Interviews":  ongoingStudents,
      "Selected Student":    selectedStudents,
      "Placed Student":      placedStudents,
    };
    const data = map[activeTab] || [];
    if (!searchTerm) return data;
    return data.filter((s) => {
      const name = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
      return name.includes(searchTerm.toLowerCase()) ||
        s.prkey?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const baseColumns = [
    {
      key: "name",
      label: "Student",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar firstName={row.firstName} lastName={row.lastName} imageUrl={row.image} />
          <div>
            <p className="font-medium text-gray-800">{toTitle(`${row.firstName} ${row.lastName}`)}</p>
            <p className="text-xs text-gray-400">{row.prkey}</p>
          </div>
        </div>
      ),
    },
    { key: "studentMobile", label: "Mobile", align: "center",
      render: (row) => row.studentMobile ? `+91 ${row.studentMobile}` : "—" },
    {
      key: "readinessStatus",
      label: "Readiness",
      render: (row) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          row.readinessStatus === "Ready for Interview"
            ? "bg-indigo-100 text-indigo-600"
            : "bg-green-100 text-green-600"
        }`}>
          {row.readinessStatus || "Ready"}
        </span>
      ),
    },
  ];

  const placedColumns = [
    ...baseColumns,
    { key: "company",    label: "Company",  render: (row) => toTitle(row.placedInfo?.companyName || "—") },
    { key: "jobProfile", label: "Role",     render: (row) => toTitle(row.placedInfo?.jobProfile   || "—") },
    { key: "salary",     label: "Salary",   render: (row) => row.placedInfo?.salary ? `₹${(row.placedInfo.salary / 100000).toFixed(1)} LPA` : "—" },
    {
      key: "action", label: "",
      render: (row) => (
        <button onClick={(e) => { e.stopPropagation(); setSelectedForPost(row); setIsPostModalOpen(true); }}
          className={buttonStyles.primary}>
          Create Post
        </button>
      ),
    },
  ];

  const selectedColumns = [
    ...baseColumns,
    { key: "company", label: "Company",
      render: (row) => {
        const sel = row.selectedInterviews?.[0];
        return toTitle(sel?.companyRef?.companyName || "—");
      }
    },
    {
      key: "actions", label: "",
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); setSelectedStudent(row); setIsInterviewModalOpen(true); }}
            className={buttonStyles.primary}>
            + Interview
          </button>
          <button onClick={(e) => { e.stopPropagation(); setSelectedForPlacement(row); setIsConfirmModalOpen(true); }}
            className={buttonStyles.secondary || buttonStyles.primary}>
            Confirm
          </button>
        </div>
      ),
    },
  ];

  const ongoingColumns = [
    ...baseColumns,
    {
      key: "interviews", label: "Active Interview",
      render: (row) => {
        const active = row.PlacementinterviewRecord?.find((r) =>
          ["Scheduled", "Ongoing", "Rescheduled"].includes(r.status)
        );
        return (
          <div>
            <p className="text-sm font-medium text-gray-800">{active?.jobProfile || "—"}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              active?.status === "Ongoing" ? "bg-orange-100 text-orange-600" :
              active?.status === "Rescheduled" ? "bg-yellow-100 text-yellow-600" :
              "bg-blue-100 text-blue-600"
            }`}>{active?.status || "—"}</span>
          </div>
        );
      },
    },
    {
      key: "action", label: "",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/interview-history/${row._id}`); }}
            className={buttonStyles.primary}>
            View History
          </button>
        </div>
      ),
    },
  ];

  const qualifiedColumns = [
    ...baseColumns,
    {
      key: "action",
      label: "",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedStudent(row);
            setIsInterviewModalOpen(true);
          }}
          className={buttonStyles.primary}
        >
          Schedule Interview
        </button>
      ),
    },
  ];

  const getColumns = () => {
    if (activeTab === "Placed Student")   return placedColumns;
    if (activeTab === "Selected Student") return selectedColumns;
    if (activeTab === "Ongoing Interviews") return ongoingColumns;
    return qualifiedColumns;
  };

  const handleRowClick = (row) => {
    if (activeTab === "Placed Student" || activeTab === "Qualified Students") {
      navigate(`/student-profile/${row.studentId?._id || row._id}`);
    } else {
      // Ongoing Interviews & Selected Student → interview history
      navigate(`/interview-history/${row._id}`);
    }
  };

  const refetchAll = () => { refetchReady(); refetchSelected(); refetchPlaced(); };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;

  return (
    <>
      <Header
        title="Placement Candidates"
        breadcrumbs={[{ label: "Placements" }, { label: "Placement Candidates" }]}
      />
      <TabsCommon tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="p-5">
        <CommonTable
          columns={getColumns()}
          data={getActiveData()}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          pagination
          rowsPerPage={10}
          onRowClick={handleRowClick}
        />
      </div>

      <ScheduleInterviewModal
        isOpen={isInterviewModalOpen}
        onClose={() => { setIsInterviewModalOpen(false); setSelectedStudent(null); }}
        studentId={selectedStudent?.studentId?._id || selectedStudent?._id}
        onSuccess={refetchAll}
      />
      <ConfirmPlacementModal
        isOpen={isConfirmModalOpen}
        onClose={() => { setIsConfirmModalOpen(false); setSelectedForPlacement(null); }}
        student={selectedForPlacement}
        onSuccess={refetchAll}
      />
      <CreatePostModal
        isOpen={isPostModalOpen}
        onClose={() => { setIsPostModalOpen(false); setSelectedForPost(null); }}
        student={selectedForPost}
        onSuccess={refetchAll}
      />
    </>
  );
};

export default PlacementReadyStudents;
