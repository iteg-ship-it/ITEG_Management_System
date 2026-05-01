import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetPermissionStudentQuery } from "../../redux/api/authApi";
import Loader from "../common-components/loader/Loader";
import CommonTable from "../common-components/table/CommonTable";
import Header from "../common-components/sidebar/Header";
import Avatar from "../common-components/Avatar";

const StudentPermission = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useGetPermissionStudentQuery();

  const students = data?.data || [];
  const [rowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [previewImage, setPreviewImage] = useState(null); // for permission image modal

  const toTitleCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const filtersConfig = [
    {
      title: "Track",
      options: [...new Set(students.map((s) => toTitleCase(s.track || "")))].filter(Boolean),
      selected: selectedTracks,
      setter: setSelectedTracks,
    },
  ];

  const filteredData = students.filter((student) => {
    const searchableValues = [
      student.firstName,
      student.lastName,
      student.fatherName,
      student.studentMobile,
      student.course,
      student.track,
      student.permissionDetails?.remark,
      student.permissionDetails?.approved_by,
    ]
      .join(" ")
      .toLowerCase();

    if (!searchableValues.includes(searchTerm.toLowerCase())) return false;

    const track = toTitleCase(student.track || "");
    return selectedTracks.length === 0 || selectedTracks.includes(track);
  });

  const columns = [
    {
      key: "fullName",
      label: "Student",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar firstName={row.firstName} lastName={row.lastName} imageUrl={row.image} />
          <div>
            <p className="font-semibold text-gray-900">{toTitleCase(`${row.firstName} ${row.lastName}`)}</p>
            <p className="text-xs text-gray-500">{row.studentMobile || "N/A"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "fatherName",
      label: "Father Name",
      render: (row) => toTitleCase(row.fatherName || "N/A"),
    },
    {
      key: "course",
      label: "Course / Track",
      render: (row) => (
        <div>
          <p className="text-sm text-gray-800">{toTitleCase(row.course || "N/A")}</p>
          <p className="text-xs text-gray-500">{toTitleCase(row.track || "N/A")}</p>
        </div>
      ),
    },
    {
      key: "remark",
      label: "Remark",
      render: (row) => (
        <span className="text-sm text-gray-700">{row.permissionDetails?.remark || "N/A"}</span>
      ),
    },
    {
      key: "approved_by",
      label: "Approved By",
      render: (row) => {
        const approvedBy = row.permissionDetails?.approved_by;
        if (!approvedBy) return "N/A";
        const label = typeof approvedBy === "object" ? approvedBy.name : approvedBy;
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium capitalize">
            {label || "N/A"}
          </span>
        );
      },
    },
    {
      key: "uploadDate",
      label: "Upload Date",
      render: (row) =>
        row.permissionDetails?.uploadDate
          ? new Date(row.permissionDetails.uploadDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "N/A",
    },
    {
      key: "permissionImage",
      label: "Permission Doc",
      render: (row) =>
        row.permissionDetails?.imageURL ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPreviewImage(row.permissionDetails.imageURL);
            }}
            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-200 transition"
          >
            View Doc
          </button>
        ) : (
          <span className="text-xs text-gray-400">No Doc</span>
        ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center text-red-600 font-medium">
          Error: {error?.data?.message || "Something went wrong."}
        </div>
      </div>
    );
  }

  return (
    <>
      <Header title="Dummy Students" showBack={false} />
      <div className="min-h-screen px-5">
        {/* Stats bar */}
        <div className="flex items-center gap-4 py-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2 text-center">
            <p className="text-xl font-bold text-indigo-700">{students.length}</p>
            <p className="text-xs text-gray-500">Total Dummy Students</p>
          </div>
        </div>

        <CommonTable
          data={filteredData}
          columns={columns}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filtersConfig={filtersConfig}
          onRowClick={(row) => navigate(`/student-profile/${row._id}`)}
          rowsPerPage={rowsPerPage}
        />
      </div>

      {/* Permission Image Preview Modal */}
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
              <button
                onClick={() => setPreviewImage(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <img
              src={previewImage}
              alt="Permission Document"
              className="w-full rounded-lg object-contain max-h-[70vh]"
            />
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
