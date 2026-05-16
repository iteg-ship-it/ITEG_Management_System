import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { CheckCircle, Eye, Search, XCircle } from "lucide-react";
import {
  useGetLeaveRequestsQuery,
  useResolvePermissionMutation,
} from "../../../redux/api/authApi";
import Avatar from "../../shared/Avatar";
import Header from "../../shared/sidebar/Header";
import Loader from "../../shared/loader/Loader";
import CommonTable from "../../shared/table/CommonTable";

const FILTERS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "All", value: "all" },
];

const statusStyles = {
  pending: "bg-orange-50 text-orange-600 border-orange-200",
  approved: "bg-green-50 text-green-600 border-green-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
};

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

const toTitleCase = (str = "") =>
  str
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const ResolveModal = ({ request, decision, onClose }) => {
  const [remark, setRemark] = useState("");
  const [resolvePermission, { isLoading }] = useResolvePermissionMutation();
  const isApprove = decision === "approved";

  const handleSubmit = async () => {
    try {
      await resolvePermission({
        id: request.student._id,
        permissionId: request._id,
        status: decision,
        remark: remark.trim(),
      }).unwrap();
      toast.success(`Leave request ${isApprove ? "approved" : "rejected"} successfully`);
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update leave request");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-bold text-gray-900">
            {isApprove ? "Approve Leave Request" : "Reject Leave Request"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {toTitleCase(`${request.student.firstName || ""} ${request.student.lastName || ""}`)}
          </p>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
            <p className="font-semibold text-gray-900">{request.reason || "Leave request"}</p>
            <p className="mt-1 text-xs text-gray-500">
              {formatDate(request.fromDate)} to {formatDate(request.toDate)}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              Remark <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={remark}
              onChange={(event) => setRemark(event.target.value)}
              rows={4}
              placeholder="Add a note for the student..."
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
            />
          </div>
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-gray-100 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${
              isApprove ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isApprove ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {isLoading ? "Updating..." : isApprove ? "Approve" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
};

const LeaveRequests = () => {
  const [status, setStatus] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [resolveState, setResolveState] = useState(null);
  const { data, isLoading, isError, error } = useGetLeaveRequestsQuery(status);

  const requests = data?.data || [];

  const filteredRequests = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return requests;

    return requests.filter((item) => {
      const student = item.student || {};
      return [
        student.firstName,
        student.lastName,
        student.prkey,
        student.studentMobile,
        student.subDepartmentId?.name,
        student.currentLevelId?.name,
        student.currentSubLevelId?.name,
        item.reason,
        item.remark,
        item.status,
      ].join(" ").toLowerCase().includes(query);
    });
  }, [requests, searchTerm]);

  const counts = {
    total: requests.length,
    pending: requests.filter((item) => item.status === "pending").length,
    approved: requests.filter((item) => item.status === "approved").length,
    rejected: requests.filter((item) => item.status === "rejected").length,
  };

  const columns = [
    {
      key: "student",
      label: "Student",
      render: (row) => {
        const student = row.student || {};
        return (
          <div className="flex items-center gap-3">
            <Avatar firstName={student.firstName} lastName={student.lastName} imageUrl={student.image} />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {toTitleCase(`${student.firstName || ""} ${student.lastName || ""}`)}
              </p>
              <p className="text-xs text-gray-500">{student.prkey || student.studentMobile || "N/A"}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "department",
      label: "Department",
      render: (row) => (
        <div className="text-sm text-gray-700">
          <p>{row.student?.subDepartmentId?.name || "-"}</p>
          <p className="text-xs text-gray-400">
            {row.student?.currentLevelId?.name || "-"} / {row.student?.currentSubLevelId?.name || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "dateRange",
      label: "Leave Dates",
      render: (row) => (
        <div className="text-sm text-gray-700">
          <p>{formatDate(row.fromDate)}</p>
          <p className="text-xs text-gray-400">to {formatDate(row.toDate)}</p>
        </div>
      ),
    },
    {
      key: "reason",
      label: "Reason / Remark",
      render: (row) => (
        <div className="max-w-xs whitespace-normal text-sm text-gray-700">
          <p className="font-medium">{row.reason || "No reason provided"}</p>
          {row.remark && <p className="mt-1 text-xs text-gray-500">Remark: {row.remark}</p>}
          {row.approvedBy && <p className="mt-1 text-xs text-green-600">By: {row.approvedBy}</p>}
        </div>
      ),
    },
    {
      key: "applied",
      label: "Applied On",
      render: (row) => formatDate(row.uploadDate),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[row.status] || statusStyles.pending}`}>
          {row.status || "pending"}
        </span>
      ),
    },
  ];

  const actionButton = (row) => (
    <div className="flex items-center gap-2">
      {row.imageURL && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setPreviewUrl(row.imageURL);
          }}
          className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          title="View document"
        >
          <Eye size={16} />
        </button>
      )}
      {row.status === "pending" && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setResolveState({ request: row, decision: "approved" });
            }}
            className="rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setResolveState({ request: row, decision: "rejected" });
            }}
            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
          >
            Reject
          </button>
        </>
      )}
    </div>
  );

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader /></div>;
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-medium text-red-600">{error?.data?.message || "Failed to load leave requests."}</p>
      </div>
    );
  }

  return (
    <>
      <Header
        title="Leave Requests"
        subtitle="Review student leave requests for your department"
        badge={`${counts.total} shown`}
      />

      <div className="min-h-screen px-5 py-4">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total", value: counts.total, color: "text-gray-900" },
              { label: "Pending", value: counts.pending, color: "text-orange-600" },
              { label: "Approved", value: counts.approved, color: "text-green-600" },
              { label: "Rejected", value: counts.rejected, color: "text-red-600" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex rounded-lg border border-gray-200 bg-white p-1">
              {FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setStatus(item.value)}
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                    status === item.value ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search requests"
                className="h-full min-h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-orange-400 sm:w-64"
              />
            </div>
          </div>
        </div>

        <CommonTable
          data={filteredRequests}
          columns={columns}
          editable
          actionButton={actionButton}
          pagination
          rowsPerPage={10}
        />
      </div>

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setPreviewUrl("")}
        >
          <div className="w-full max-w-2xl rounded-xl bg-white p-4 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Supporting Document</h3>
              <button onClick={() => setPreviewUrl("")} className="text-xl font-bold text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>
            {previewUrl.toLowerCase().includes(".pdf") ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                PDF document available.
              </div>
            ) : (
              <img src={previewUrl} alt="Leave request document" className="max-h-[70vh] w-full rounded-lg object-contain" />
            )}
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block text-center text-sm font-semibold text-orange-600 hover:underline">
              Open in new tab
            </a>
          </div>
        </div>
      )}

      {resolveState && (
        <ResolveModal
          request={resolveState.request}
          decision={resolveState.decision}
          onClose={() => setResolveState(null)}
        />
      )}
    </>
  );
};

export default LeaveRequests;
