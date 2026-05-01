import { useGetAllStudentsQuery } from "../../redux/api/authApi";
import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../common-components/loader/Loader";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import InputField from "../common-components/common-feild/InputField";
import CustomDropdown from "../common-components/common-feild/CustomDropdown";
import { useInterviewCreateMutation } from "../../redux/api/authApi";
import { toast } from "react-toastify";
import { buttonStyles } from "../../styles/buttonStyles";
import BlurBackground from "../common-components/BlurBackground";
import TabsCommon from "../common-components/table/TabsCommon";
import SearchBox from "./../common-components/seach-export/SearchBox";
import Header from "./../common-components/sidebar/Header";
import TotalRegistration from "./tabs/TotalRegistration";
import OnlineAssessment from "./tabs/OnlineAssessment";
import TechnicalRound from "./tabs/TechnicalRound";
import FinalRound from "./tabs/FinalRound";
import Results from "./tabs/Results";

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

  // dynamic unique options across data
  const dynamicTrackOptions = useMemo(() => {
    return [...new Set(data.map((s) => toTitleCase(s.track || "")))].filter(
      Boolean
    );
  }, [data]);

  const dynamicResultOptions = useMemo(() => {
    const onlineResults = data.map((s) =>
      toTitleCase(s.onlineTest?.result || "Not Attempted")
    );

    const interviewResults = data.flatMap(
      (s) => s.interviews?.map((i) => toTitleCase(i.result || "")) || []
    );

    return [...new Set([...onlineResults, ...interviewResults])].filter(Boolean);
  }, [data]);


  const tabFilterConfig = useMemo(() => ({
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
        options: ["Selected", "Rejected"],
        selected: resultFilterTab2,
        setter: setResultFilterTab2,
      },
    ],
  }), [dynamicTrackOptions, dynamicResultOptions, trackFilterTab1, resultFilterTab2, statusFilterTab3]);

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

    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [location.search]);

  // Auto-refresh data when window gains focus
  useEffect(() => {
    const handleFocus = () => refetch();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  const getLatestInterviewResult = (interviews = []) => {
    if (!interviews.length) return null;
    return [...interviews].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )[0]?.result;
  };

  const handleInterviewSubmit = async (values, { resetForm }) => {
    try {
      const response = await createInterview({ ...values, studentId: id }).unwrap();
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
        return (
          (student.onlineTest?.result === "Fail" && firstRound.length === 0) ||
          (firstRound.length > 0 &&
            !firstRound.some((i) => i.result === "Pass") &&
            firstRound.some((i) => i.result === "Fail"))
        );
      case "Final Round":
        return (
          firstRound.some((i) => i.result === "Pass") &&
          secondRound.length === 0
        );
      case "Results":
        return (
          secondRound.some((i) => i.result === "Pass") ||
          secondRound.some((i) => i.result === "Fail")
        );
      default:
        return true;
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((student) => {
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

        if (title === "Track") {
          return selected.includes(track);
        }

        if (title === "Result") {
          if (activeTab === "Online Assessment") {
            const onlineResult = toTitleCase(student.onlineTest?.result || "Not Attempted");
            return selected.includes(onlineResult);
          } else if (activeTab === "Results") {
            const secondRound = student.interviews?.filter((i) => i.round === "Second") || [];
            const isSelected = secondRound.some((i) => i.result === "Pass");
            const isRejected = latestResult === "Fail" || secondRound.some((i) => i.result === "Fail");

            if (selected.includes("Selected") && isSelected) return true;
            if (selected.includes("Rejected") && isRejected) return true;
            return false;
          } else {
            return selected.includes(latestResult);
          }
        }

        if (title === "Tech Status") {
          return selected.includes(latestResult);
        }
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
  }, [data, searchTerm, activeTab, trackFilterTab1, resultFilterTab2, statusFilterTab3]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("admissionActiveTab", tab);
  };

  const scheduleButton = (student) => {
    const numberOfAttempted =
      student?.interviews?.filter((item) => item.round === "First") || [];
    setSelectedStudentId(student._id);
    setAtemendNumber(numberOfAttempted.length);
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
  };

  const handleGetOnlineMarks = (onlineTest = {}) => {
    const result = onlineTest?.result;
    const classes = "px-3 py-1 rounded-md text-sm font-medium";
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
    const classes = "px-3 py-1 rounded-md text-sm font-medium";
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

  const TabComponent = useMemo(() => {
    const tabComponents = {
      "Total Registration": TotalRegistration,
      "Online Assessment": OnlineAssessment,
      "Technical Round": TechnicalRound,
      "Final Round": FinalRound,
      "Results": Results,
    };
    return tabComponents[activeTab];
  }, [activeTab]);

  const renderTabContent = () => {

    if (!TabComponent) return null;

    const commonProps = {
      data: filteredData,
      toTitleCase,
      searchTerm,
      rowsPerPage,
      onRowClick: (row) => {
        localStorage.setItem("lastSection", "admission");
        navigate(`/admission/edit/${row._id}`, { state: { student: row } });
      },
    };

    switch (activeTab) {
      case "Total Registration":
        return <TabComponent {...commonProps} />;
      case "Online Assessment":
        return <TabComponent {...commonProps} scheduleButton={scheduleButton} refetch={refetch} activeTab={activeTab} />;
      case "Technical Round":
        return <TabComponent {...commonProps} scheduleButton={scheduleButton} handleGetStatus={handleGetStatus} handleGetMarks={handleGetMarks} refetch={refetch} activeTab={activeTab} />;
      case "Final Round":
        return <TabComponent {...commonProps} setAddInterviwModalOpen={setAddInterviwModalOpen} setId={setId} handleGetStatus={handleGetStatus} handleGetMarks={handleGetMarks} refetch={refetch} />;
      case "Results":
        return <TabComponent {...commonProps} getLatestInterviewResult={getLatestInterviewResult} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">Error fetching students.</p>;
  }

  return (
    <>
      <Header 
        title="Admission Process"
      >
        <div className="w-80 ml-auto">
          <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
      </Header>
      <TabsCommon tabs={tabs} activeTab={activeTab} onTabChange={handleTabClick} />
      <div className="px-5">
        {renderTabContent()}
    
        {
          AddInterviwModalOpen && (
            <BlurBackground isOpen={AddInterviwModalOpen} onClose={() => setAddInterviwModalOpen(false)}>
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
                      <CustomDropdown
                        label="Round"
                        name="round"
                        disabled
                        options={[{ value: "Second", label: "Final Round" }]}
                      />
                      <InputField label="Remark" name="remark" />
                      <CustomDropdown
                        label="Result"
                        name="result"
                        options={[
                          { value: "Pass", label: "Pass" },
                          { value: "Fail", label: "Fail" },
                          { value: "Pending", label: "Pending" },
                        ]}
                      />
                      <div className="col-span-2 mt-4">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className={`w-full py-3 rounded-lg disabled:opacity-50 ${buttonStyles.primary}`}
                        >
                          {isLoading ? "Submitting..." : "Submit"}
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
            </BlurBackground>
          )
        }
      </div>
    </>
  );
};

export default StudentList;
