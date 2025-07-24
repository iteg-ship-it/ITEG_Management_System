import { useGetAllStudentsQuery } from "../../redux/api/authApi";
import CommonTable from "../common-components/table/CommonTable";
import { useEffect, useState, useMemo } from "react";
import CustomTimeDate from "./CustomTimeDate";
import { useLocation, useNavigate } from "react-router-dom";
import Pagination from "../common-components/pagination/Pagination";
import { AiFillStop } from "react-icons/ai";
import { FaCheckCircle } from "react-icons/fa";
import Loader from "../common-components/loader/Loader";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import InputField from "../common-components/common-feild/InputField";
import SelectInput from "../common-components/common-feild/SelectInput";
import {
  useInterviewCreateMutation,
} from "../../redux/api/authApi";
import { toast } from "react-toastify";


const toTitleCase = (str) =>
  str
    ?.toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const StudentList = () => {
  const { data = [], isLoading, error, refetch } = useGetAllStudentsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    pollingInterval: 30000, // Poll every 30 seconds
  });
  const [rowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Total Registration");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [atemendNumber, setAtemendNumber] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [AddInterviwModalOpen, setAddInterviwModalOpen] = useState(false);
  const [id, setId] = useState(null);
  const navigate = useNavigate();
  
  const location = useLocation();
  const [createInterview, { isLoading: isSubmitting }] =
      useInterviewCreateMutation();

   const validationSchema = Yup.object().shape({
      round: Yup.string().required("Required"),
      remark: Yup.string().required("Remark is required"),
      result: Yup.string().required("Result is required"),
    });

  // Filter states per tab
  const [trackFilterTab1, setTrackFilterTab1] = useState([]);
  const [resultFilterTab2, setResultFilterTab2] = useState([]);
  const [statusFilterTab3, setStatusFilterTab3] = useState([]);

  // dynamically extract unique options
  // const dynamicTrackOptions = useMemo(() => {
  //   return [...new Set(data.map((s) => toTitleCase(s.track || "")))].filter(Boolean);
  // }, [data]);

  // dynamic unique options across data
  const dynamicTrackOptions = useMemo(() => {
    return [...new Set(data.map((s) => toTitleCase(s.track || "")))].filter(
      Boolean
    );
  }, [data]);

  const dynamicResultOptions = useMemo(() => {
    return [
      ...new Set(
        data.flatMap(
          (s) => s.interviews?.map((i) => toTitleCase(i.result || "")) || []
        )
      ),
    ].filter(Boolean);
  }, [data]);

  const tabFilterConfig = {
    "Total Registration": [
      {
        title: "Track",
        options: dynamicTrackOptions,
        selected: trackFilterTab1,
        setter: setTrackFilterTab1,
      },
    ],
    "Online Assessment": [
      {
        title: "Track",
        options: dynamicTrackOptions,
        selected: trackFilterTab1,
        setter: setTrackFilterTab1,
      },
      {
        title: "Result",
        options: dynamicResultOptions,
        selected: resultFilterTab2,
        setter: setResultFilterTab2,
      },
    ],
    "Technical Round": [
      {
        title: "Track",
        options: dynamicTrackOptions,
        selected: trackFilterTab1,
        setter: setTrackFilterTab1,
      },
      {
        title: "Tech Status",
        options: dynamicResultOptions,
        selected: statusFilterTab3,
        setter: setStatusFilterTab3,
      },
    ],
    "Final Round": [
      {
        title: "Track",
        options: dynamicTrackOptions,
        selected: trackFilterTab1,
        setter: setTrackFilterTab1,
      },
      {
        title: "Result",
        options: dynamicResultOptions,
        selected: resultFilterTab2,
        setter: setResultFilterTab2,
      },
    ],
    Results: [
      {
        title: "Track",
        options: dynamicTrackOptions,
        selected: trackFilterTab1,
        setter: setTrackFilterTab1,
      },
      {
        title: "Result",
        options: dynamicResultOptions,
        selected: resultFilterTab2,
        setter: setResultFilterTab2,
      },
    ],
  };

  const filtersConfig = tabFilterConfig[activeTab] || [];

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabFromURL = searchParams.get("tab");
    const savedTab = localStorage.getItem("admissionActiveTab");

    if (tabFromURL) {
      setActiveTab(tabFromURL);
      localStorage.setItem("admissionActiveTab", tabFromURL);
    } else if (savedTab) {
      setActiveTab(savedTab);
    }
    // Refresh data when component mounts or URL changes
    refetch();
  }, [location.search, refetch]);

  // Auto-refresh data when window gains focus
  useEffect(() => {
    const handleFocus = () => refetch();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  // ✅ Loader: Show full screen while data is loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return <p className="text-center text-red-500">Error fetching students.</p>;
  }

  const getLatestInterviewResult = (interviews = []) => {
    if (!interviews.length) return null;
    return [...interviews].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )[0]?.result;
  };
  const handleInterviewSubmit = async (values, { resetForm }) => {
      try {
      const response =  await createInterview({ ...values, studentId: id }).unwrap();
        setAddInterviwModalOpen(false);
        toast.success(response.message);
        setIsModalOpen(false);
        resetForm();
        await refetch();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to create interview");
      }
    };
  


  const matchTabCondition = (student) => {
    const latestResult = getLatestInterviewResult(student.interviews);
    const hasInterviews = student.interviews?.length > 0;
    const firstRound = student.interviews?.filter((i) => i.round === "First");
    const secondRound = student.interviews?.filter((i) => i.round === "Second");

    switch (activeTab) {
      case "Online Assessment":
        return (
          student.onlineTest?.result === "Pending" &&
          (!hasInterviews || firstRound.length === 0)
        );
      case "Technical Round":
        // Only show students who have failed the technical round
        // Don't show students who have passed
        return (
          firstRound.length > 0 &&
          !firstRound.some((i) => i.result === "Pass") &&
          firstRound.some((i) => i.result === "Fail")
        );
      case "Final Round":
        return (
          firstRound.some((i) => i.result === "Pass") &&
          !secondRound.some((i) => i.result === "Pass")
        );
      case "Results":
        return (
          secondRound.some((i) => i.result === "Pass") ||
          latestResult === "Fail" ||
          secondRound.some((i) => i.result === "Fail")
        );
      default:
        return true;
    }
  };

  const filteredData = data.filter((student) => {
    const searchableValues = Object.values(student)
      .map((val) => String(val ?? "").toLowerCase())
      .join(" ");
    if (!searchableValues.includes(searchTerm.toLowerCase())) return false;

    const track = toTitleCase(student.track || "");
    const latestResult = toTitleCase(
      getLatestInterviewResult(student.interviews || []) || ""
    );
    const percentage = parseFloat(student.percentage);

    const matches = filtersConfig.every(({ title, selected }) => {
      if (selected.length === 0) return true;
      if (title === "Track") return selected.includes(track);
      if (title === "Result" || title === "Tech Status")
        return selected.includes(latestResult);
      if (title === "Interview") {
        return selected.some((range) => {
          const [min, max] = range.replace("%", "").split("-").map(Number);
          return percentage >= min && percentage <= max;
        });
      }
      return true;
    });

    return matches && matchTabCondition(student);
  });

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("admissionActiveTab", tab);
    // Refresh data when switching tabs
    refetch();
  };

  const scheduleButton = (student) => {
    const numberOfAttempted =
      student?.interviews?.filter((item) => item.round === "First") || [];
    setSelectedStudentId(student._id);
    setAtemendNumber(numberOfAttempted.length);
    // Store student name in localStorage for the interview form
    localStorage.setItem("currentInterviewStudent", JSON.stringify({
      name: `${student.firstName} ${student.lastName}`,
      id: student._id
    }));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedStudentId(null);
    setAtemendNumber(null);
    setIsModalOpen(false);
    // Refresh data when modal closes
    refetch();
  };

  const handleGetOnlineMarks = (onlineTest = {}) => {
    const result = onlineTest?.result;
    const classes = "px-3 py-1 rounded-xl text-sm font-medium";
    switch (result) {
      case "Pass":
        return (
          <span className="inline-block px-2 py-1 rounded-md text-[#118D57] bg-[#22C55E]/20 text-sm font-medium">
  Pass
</span>
        );
      case "Fail":
        return (
         <span className="inline-block px-2 py-1 rounded-md bg-[#FFCEC3] text-[#D32F2F] text-sm font-medium">
  Fail
</span>
        );
      default:
        return (
          <span className={`bg-gray-100 text-gray-700 ${classes}`}>
            {toTitleCase(result) || "Not Attempted"}
          </span>
        );
    }
  };

  const handleGetMarks = (interviews = []) => {
    const roundData = interviews?.filter((i) => i?.round === "First");
    return roundData?.[roundData.length - 1]?.marks || 0;
  };

  const handleGetStatus = (interviews = []) => {
    const roundData = interviews?.filter((i) => i?.round === "First");
    const result = roundData?.[roundData.length - 1]?.result;
    const classes = "px-3 py-1 rounded-xl text-sm font-medium";
    switch (result) {
      case "Pass":
        return (
          <span className="inline-block px-2 py-1 rounded-md text-[#118D57] bg-[#22C55E]/20 text-sm font-medium">
  Pass
</span>
        );
      case "Fail":
        return (
          <span className="inline-block px-2 py-1 rounded-md bg-[#FFCEC3] text-[#D32F2F] text-sm font-medium">
  Fail
</span>
        );
      default:
        return (
          <span className={`bg-gray-100 text-gray-700 ${classes}`}>
            {toTitleCase(result) || "Not Attempted"}
          </span>
        );
    }
  };

  const tabs = [
    "Total Registration",
    "Online Assessment",
    "Technical Round",
    "Final Round",
    "Results",
  ];

  let columns = [];
  let actionButton;

  switch (activeTab) {
    case "Online Assessment":
      columns = [
        {
          key: "firstName",
          label: "Full Name",
          render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`),
        },
        {
          key: "fatherName",
          label: "Father's Name",
          render: (row) => toTitleCase(row.fatherName),
        },
        { key: "studentMobile", label: "Mobile" },
        {
          key: "subject12",
          label: "12th Subject",
          render: (row) => toTitleCase(row.stream),
        },
        {
          key: "course",
          label: "Course",
          render: (row) => toTitleCase(row.course),
        },
        {
          key: "marks",
          label: "Marks",
          render: (row) => row.onlineTest?.marks || "0",
        },
        {
          key: "stream",
          label: "Status",
          render: (row) => handleGetOnlineMarks(row.onlineTest),
        },
      ];
      actionButton = (row) => (
        <button
          onClick={() => scheduleButton(row)}
          className="bg-orange-500 text-md text-white px-3 py-1 rounded"
        >
          Take interview
        </button>
      );
      break;

    case "Technical Round":
      columns = [
        {
          key: "firstName",
          label: "Full Name",
          render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`),
        },
        {
          key: "fatherName",
          label: "Father's Name",
          render: (row) => toTitleCase(row.fatherName),
        },
        { key: "studentMobile", label: "Mobile" },
        {
          key: "course",
          label: "Course",
          render: (row) => toTitleCase(row.course),
        },
        {
          key: "onlineTestResult",
          label: "Result (1st Round)",
          render: (row) => handleGetStatus(row.interviews),
        },
        {
          key: "techMarks",
          label: "Marks (1st Round)",
          render: (row) => handleGetMarks(row.interviews),
        },
        // {
        //   key: "techStatus",
        //   label: "Status of Tech",
        //   render: (row) => handleGetStatus(row.interviews),
        // },
      ];
      actionButton = (row) => (
        <button
          onClick={() => scheduleButton(row)}
          className="bg-orange-500 text-md text-white px-3 py-1 rounded"
        >
          Take interview
        </button>
      );
      break;

    case "Final Round":
      columns = [
        {
          key: "firstName",
          label: "Full Name",
          render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`),
        },
        {
          key: "fatherName",
          label: "Father's Name",
          render: (row) => toTitleCase(row.fatherName),
        },
        { key: "studentMobile", label: "Mobile" },
        {
          key: "course",
          label: "Course",
          render: (row) => toTitleCase(row.course),
        },
        {
          key: "onlineTestStatus",
          label: "Result (1st Round)",
          render: (row) => handleGetStatus(row.interviews),
        },
        {
          key: "techMarks",
          label: "Marks(Tech Round)",
          render: (row) => handleGetMarks(row.interviews),
        },
        {
          key: "attempts",
          label: "Attempts(1st Round)",
          render: (row) => {
            const firstRoundAttempts = row.interviews?.filter((i) => i.round === "First") || [];
            return firstRoundAttempts.length;
          },
        },
      ];
      actionButton = (row) => (
        // <button
        //   onClick={() => {
        //     localStorage.setItem("studdedntDetails", JSON.stringify(row));
        //     // navigate(`/interview-detail/${row._id}?tab=${activeTab}`);
        //   }}
        //   className="bg-orange-500 text-md text-white px-3 py-1 rounded"
        // >
        //   Interviews Detail
        // </button>' {/* <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
                <button
                  onClick={() => {setAddInterviwModalOpen(true) 
                  setId(row._id)
                  } }
                  className="bg-orange-500 text-md text-white px-3 py-1 rounded"
                >
                  Add Interview
                </button>
              </div> 
      );
      break;

    case "Results":
      columns = [
        {
          key: "firstName",
          label: "Full Name",
          render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`),
        },
        {
          key: "fatherName",
          label: "Father's Name",
          render: (row) => toTitleCase(row.fatherName),
        },
        { key: "studentMobile", label: "Mobile" },
        {
          key: "stream",
          label: "Subject",
          render: (row) => toTitleCase(row.stream),
        },
        {
          key: "village",
          label: "Village",
          render: (row) => toTitleCase(row.village),
        },
        {
          key: "track",
          label: "Track",
          render: (row) => toTitleCase(row.track),
        },
      ];
      actionButton = (row) => {
        const secondRound =
          row.interviews?.filter((i) => i.round === "Second") || [];
        const latestResult = getLatestInterviewResult(row.interviews);
        const isSelected = secondRound.some((i) => i.result === "Pass");
        const isRejected =
          latestResult === "Fail" ||
          secondRound.some((i) => i.result === "Fail");

        if (isSelected) {
          //   return (
          //     <button
          //       className="bg-[var(--success-light)] flex items-center gap-2 text-md text-[var(--success-dark)] px-3 py-1 rounded"
          //       onClick={() => alert(`Selected: ${row.firstName}`)}
          //     >
          //       <FaCheckCircle className="text-lg" />
          //       <span>Selected</span>
          //     </button>
          //   );
          // } else if (isRejected) {
          //   return (
          //     <button
          //       className="bg-[var(--error-light)] flex items-center gap-2 text-md text-[var(--error-dark)] px-3 py-1 rounded"
          //       onClick={() => alert(`Rejected: ${row.firstName}`)}
          //     >
          //       <AiFillStop className="text-lg" />
          //       <span>Rejected</span>
          //     </button>
          //   );
          return (
            <button
  className="bg-[#22C55E]/20 flex items-center gap-2 text-md text-[#118D57] px-3 py-1 rounded-md cursor-not-allowed"
  disabled
>
  <FaCheckCircle className="text-lg" />
  <span>Selected</span>
</button>
          );
        } else if (isRejected) {
          return (
           <button
  className="bg-[#FFCEC3] flex items-center gap-2 text-md text-[#D32F2F] px-3 py-1 rounded-md cursor-not-allowed"
  disabled
>
  <AiFillStop className="text-lg" />
  <span>Rejected</span>
</button>
          );
        } else {
          return null;
        }
      };
      break;

    default:
      columns = [
        {
          key: "firstName",
          label: "Full Name",
          render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`),
        },
        {
          key: "fatherName",
          label: "Father's Name",
          render: (row) => toTitleCase(row.fatherName),
        },
        { key: "studentMobile", label: "Mobile" },
        {
          key: "subject12",
          label: "12th Subject",
          render: (row) => toTitleCase(row.stream),
        },
        {
          key: "course",
          label: "Course",
          render: (row) => toTitleCase(row.course),
        },
        {
          key: "village",
          label: "Village",
          render: (row) => toTitleCase(row.village),
        },
        {
          key: "track",
          label: "Bus Route",
          render: (row) => toTitleCase(row.track),
        },
      ];
      break;
  }

  {
    isLoading && (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }
  if (error) return <p>Error fetching students.</p>;

  return (
    <>
      <h1 className="text-2xl py-4 font-bold">Admission Process</h1>
      <div className="mt-1 border bg-[var(--backgroundColor)] shadow-sm rounded-lg">
        <div className="px-6">
          <div className="flex gap-6 mt-4">
            {tabs.map((tab) => (
              <p
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`cursor-pointer text-md text-[var(--text-color)] pb-2 border-b-2 ${
                  activeTab === tab
                    ? "border-[var(--text-color)] font-semibold"
                    : "border-gray-200"
                }`}
              >
                {tab}
              </p>
            ))}
          </div>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <Pagination
              rowsPerPage={rowsPerPage}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filtersConfig={filtersConfig}
              filteredData={filteredData}
            />
          </div>
        </div>
        <CommonTable
          data={filteredData}
          columns={columns}
          editable={!!actionButton}
          pagination={true}
          rowsPerPage={rowsPerPage}
          searchTerm={searchTerm}
          actionButton={actionButton}
          onRowClick={(row) => {
            // Set the source section to 'admission' before navigating
            localStorage.setItem("lastSection", "admission");
            navigate(`/admission/edit/${row._id}`, { state: { student: row } });
          }}
        />
      </div>
      {isModalOpen && selectedStudentId && (
        <CustomTimeDate
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          studentId={selectedStudentId}
          attempted={atemendNumber}
          refetch={refetch}
          activeTab={activeTab}
        />
      )}
       {AddInterviwModalOpen && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-white rounded-xl p-6 w-[95%] max-w-xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
                  <h2 className="text-xl font-bold text-center text-orange-500 mb-6">
                    Add Interview
                  </h2>
                  <Formik
                    initialValues={{
                      round: "Second",
                      remark: "",
                      result: "Pending",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleInterviewSubmit}
                  >
                    {() => (
                      <Form className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <SelectInput
                          label="Round"
                          name="round"
                          disabled
                          options={[{ value: "Second", label: "Final Round" }]}
                        />
                        <InputField label="Remark" name="remark" />
                        <SelectInput
                          label="Result"
                          name="result"
                          options={[
                            { value: "Pass", label: "Pass" },
                            { value: "Fail", label: "Fail" },
                            { value: "Pending", label: "Pending" },
                          ]}
                        />
                        <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
                          <button
                            type="button"
                            onClick={() => setAddInterviwModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 bg-brandYellow text-white rounded-md hover:bg-orange-600 transition disabled:opacity-50"
                          >
                            {isSubmitting ? "Submitting..." : "Submit"}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                  <button
                    onClick={() => setAddInterviwModalOpen(false)}
                    className="absolute top-3 right-4 text-xl text-gray-400 hover:text-gray-700"
                  >
                    &times;
                  </button>
                </div>
              </div>
            )}
    </>
  );
};

export default StudentList;

