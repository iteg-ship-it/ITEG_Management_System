import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetNewPermissionStudentsQuery,
  useUpdatePermissionStatusMutation,
} from "../../redux/api/authApi";
import Loader from "../common-components/loader/Loader";
import CommonTable from "../common-components/table/CommonTable";
import Header from "../common-components/sidebar/Header";
import Avatar from "../common-components/Avatar";

const STATUS_TABS = ["pending", "approved", "rejected"];

const STATUS_STYLES = {
  pending:  "bg-yellow-100 text-yellow-700 border-yellow-200",
  approved: "bg-green-100  text-green-700  border-green-200",
  rejected: "bg-red-100    text-red-700    border-red-200",
};

const StudentPermission = () => {
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState("pending");
  const [searchTerm, setSearchTerm]     = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const { data, isLoading, isError, error, refetch } =
    useGetNewPermissionStudentsQuery(activeStatus);

  const [updatePermissionStatus, { isLoading: isUpdating }] =
    useUpdatePermissionStatusMutation();

  const students = data?.data || [];

  const toTitleCase = (str) =>
    str?.toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const filteredData = students.filter((s) => {
    const q = searchTerm.toLowerCase();
    return [s.firstName, s.lastName, s.studentMobile, s.course, s.permissionDetails?.remark]
      .join(" ").toLowerCase().includes(q);
  });

  const handleAction = async (studentId, status) => {
    try {
      await updatePermissionStatus({ id: studentId, status }).unwrap();
      toast.success(`Permission ${status} successfully`);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Action failed");
    }
  };

  const columns = [
    {
      key: "student",
      label: "Student",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar firstName={row.firstName} lastName={row.lastName} imageUrl={row.image} />
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              {toTitleCase(`${row.firstName} ${row.lastName}`)}
            </p>
            <p className="text-xs text-gray-500">{row.studentMobile || "N/A"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "level",
      label: "Level",
      render: (row) => (
        <div className="text-sm text-gray-700">
          <p>{row.currentLevelId?.name || "—"}</p>
          <p className="text-xs text-gray-400">{row.currentSubLevelId?.name || "—"}</p>
        </div>
      ),
    },
    {
      key: "remark",
      label: "Reason",
      render: (row) => (
        <span className="text-sm text-gray-700">
          {row.permissionDetails?.remark || "No reason provided"}
        </span>
      ),
    },
    {
      key: "uploadDate",
      label: "Submitted",
      render: (row) =>
        row.permissionDetails?.uploadDate
          ? new Date(row.permissionDetails.uploadDate).toLocaleDateString("en-IN", {
              day: "2-digit", month: "short", year: "numeric",
            })
          : "N/A",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const s = row.permissionDetails?.status || "pending";
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${STATUS_STYLES[s] || STATUS_STYLES.pending}`}>
            {s}
          </span>
        );
      },
    },
    {
      key: "doc",
      label: "Document",
      render: (row) =>
        row.permissionDetails?.imageURL ? (
          <button
            onClick={(e) => { e.stopPropagation(); setPreviewImage(row.permissionDetails.imageURL); }}
            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-200 transition"
          >
            View Doc
          </button>
        ) : (
          <span className="text-xs text-gray-400">No Doc</span>
        ),
    },
    // Approve / Reject actions — only shown on pending tab
    ...(activeStatus === "pending"
      ? [
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  disabled={isUpdating}
                  onClick={() => handleAction(row._id, "approved")}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  disabled={isUpdating}
                  onClick={() => handleAction(row._id, "rejected")}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;

  if (isError) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-600 font-medium">{error?.data?.message || "Something went wrong."}</p>
    </div>
  );

  return (
    <>
      <Header title="Dummy Students" showBack={false} />

      <div className="min-h-screen px-5 py-4">
        {/* Status Tabs */}
        <div className="flex gap-2 mb-5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveStatus(tab); setSearchTerm(""); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition border ${
                activeStatus === tab
                  ? STATUS_STYLES[tab]
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
          <div className="ml-auto bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2 text-center">
            <p className="text-lg font-bold text-indigo-700">{students.length}</p>
            <p className="text-xs text-gray-500 capitalize">{activeStatus}</p>
          </div>
        </div>

        <CommonTable
          data={filteredData}
          columns={columns}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onRowClick={(row) => navigate(`/student-profile/${row._id}`)}
          rowsPerPage={10}
        />
      </div>

      {/* Document Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-4 max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Permission Document</h3>
              <button onClick={() => setPreviewImage(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
                &times;
              </button>
            </div>
            <img src={previewImage} alt="Permission Document" className="w-full rounded-lg object-contain max-h-[70vh]" />
            <a
              href={previewImage}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-center text-sm text-indigo-600 hover:underline"
            >
              Open in new tab
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentPermission;
