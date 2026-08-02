import React, { useState, useMemo } from "react";
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
import StatsCard from "./dashboard/StatsCard";
import ScheduleInterviewModal from "./ScheduleInterviewModal";
import ConfirmPlacementModal from "./ConfirmPlacementModal";
import CreatePostModal from "./CreatePostModal";
import { MdCheckCircle, MdWork, MdVerifiedUser, MdTrendingUp, MdSearch, MdCalendarToday, MdAdd } from "react-icons/md";

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

  const tabCounts = {
    "Qualified Students": qualifiedStudents.length,
    "Ongoing Interviews": ongoingStudents.length,
    "Selected Student": selectedStudents.length,
    "Placed Student": placedStudents.length,
  };

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
      label: "Student Profile",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar firstName={row.firstName} lastName={row.lastName} imageUrl={row.image} />
          <div>
            <p className="font-semibold text-gray-800 hover:text-orange-600 transition">
              {toTitle(`${row.firstName} ${row.lastName}`)}
            </p>
            <p className="text-[11px] text-gray-400 font-medium">{row.prkey || "PR-KEY"}</p>
          </div>
        </div>
      ),
    },
    { 
      key: "studentMobile", 
      label: "Contact", 
      align: "center",
      render: (row) => (
        <span className="text-xs font-semibold text-gray-600 bg-gray-100/80 px-2.5 py-1 rounded-lg">
          {row.studentMobile ? `+91 ${row.studentMobile}` : "—"}
        </span>
      )
    },
    {
      key: "readinessStatus",
      label: "Readiness State",
      render: (row) => (
        <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
          row.readinessStatus === "Ready for Interview"
            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
            : "bg-emerald-50 text-emerald-700 border-emerald-200"
        }`}>
          {row.readinessStatus || "Ready"}
        </span>
      ),
    },
  ];

  const qualifiedColumns = [
    ...baseColumns,
    {
      key: "action",
      label: "Actions",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedStudent(row);
            setIsInterviewModalOpen(true);
          }}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1"
        >
          <MdCalendarToday className="text-sm" /> Schedule Drive
        </button>
      ),
    },
  ];

  const ongoingColumns = [
    ...baseColumns,
    {
      key: "interviews", 
      label: "Active Drive Status",
      render: (row) => {
        const active = row.PlacementinterviewRecord?.find((r) =>
          ["Scheduled", "Ongoing", "Rescheduled"].includes(r.status)
        );
        return (
          <div>
            <p className="text-xs font-bold text-gray-800">{active?.jobProfile || "Drive In Progress"}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold mt-0.5 inline-block ${
              active?.status === "Ongoing" ? "bg-amber-100 text-amber-800 border border-amber-200" :
              active?.status === "Rescheduled" ? "bg-purple-100 text-purple-800 border border-purple-200" :
              "bg-blue-100 text-blue-800 border border-blue-200"
            }`}>{active?.status || "Scheduled"}</span>
          </div>
        );
      },
    },
    {
      key: "action", 
      label: "Actions",
      render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/interview-history/${row._id}`); }}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 transition"
        >
          View History
        </button>
      ),
    },
  ];

  const selectedColumns = [
    ...baseColumns,
    { 
      key: "company", 
      label: "Recruiting Company",
      render: (row) => {
        const sel = row.selectedInterviews?.[0];
        return (
          <span className="font-bold text-gray-800 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-100 text-xs">
            {toTitle(sel?.companyRef?.companyName || "Selected Company")}
          </span>
        );
      }
    },
    {
      key: "actions", 
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedStudent(row); setIsInterviewModalOpen(true); }}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-1.5 rounded-xl transition flex items-center gap-1"
          >
            <MdAdd /> Next Round
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedForPlacement(row); setIsConfirmModalOpen(true); }}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-xs"
          >
            Confirm Placement
          </button>
        </div>
      ),
    },
  ];

  const placedColumns = [
    ...baseColumns,
    { key: "company",    label: "Company",  render: (row) => <span className="font-bold text-gray-800">{toTitle(row.placedInfo?.companyName || "—")}</span> },
    { key: "jobProfile", label: "Job Role",     render: (row) => <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md">{toTitle(row.placedInfo?.jobProfile || "—")}</span> },
    { key: "salary",     label: "CTC Offered",   render: (row) => <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md text-xs">{row.placedInfo?.salary ? `₹${(row.placedInfo.salary / 100000).toFixed(1)} LPA` : "—"}</span> },
    {
      key: "action", 
      label: "Actions",
      render: (row) => (
        <button 
          onClick={(e) => { e.stopPropagation(); setSelectedForPost(row); setIsPostModalOpen(true); }}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-xs"
        >
          Create Post
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
      navigate(`/interview-history/${row._id}`);
    }
  };

  const refetchAll = () => { refetchReady(); refetchSelected(); refetchPlaced(); };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <Header
        title="Placement Candidates"
        breadcrumbs={[{ label: "Placements", path: "/placements/dashboard" }, { label: "Candidates" }]}
      />

      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">

        {/* ── Summary Stats Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Qualified Candidates"
            value={qualifiedStudents.length}
            icon={<MdCheckCircle />}
            color="green"
            trend="Ready Pool"
            sub="eligible for drive"
            onClick={() => setActiveTab("Qualified Students")}
          />
          <StatsCard
            title="Ongoing Interviews"
            value={ongoingStudents.length}
            icon={<MdWork />}
            color="orange"
            trend="Active Drives"
            sub="drives in evaluation"
            onClick={() => setActiveTab("Ongoing Interviews")}
          />
          <StatsCard
            title="Selected Candidates"
            value={selectedStudents.length}
            icon={<MdVerifiedUser />}
            color="purple"
            trend="Offer Received"
            sub="awaiting final confirm"
            onClick={() => setActiveTab("Selected Student")}
          />
          <StatsCard
            title="Confirmed Placed"
            value={placedStudents.length}
            icon={<MdTrendingUp />}
            color="teal"
            trend="Job Offers"
            sub="hired students"
            onClick={() => setActiveTab("Placed Student")}
          />
        </div>

        {/* ── Tabs & Search Toolbar Container ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <TabsCommon 
                tabs={TABS.map(t => `${t} (${tabCounts[t] || 0})`)} 
                activeTab={`${activeTab} (${tabCounts[activeTab] || 0})`} 
                onTabChange={(tabWithCount) => {
                  const rawTab = TABS.find(t => tabWithCount.startsWith(t)) || TABS[0];
                  setActiveTab(rawTab);
                }} 
              />
            </div>

            {/* Search Input */}
            <div className="relative shrink-0">
              <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search candidate name or PR-Key..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-64 transition"
              />
            </div>
          </div>
        </div>

        {/* ── Main Data Table ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
    </div>
  );
};

export default PlacementReadyStudents;
