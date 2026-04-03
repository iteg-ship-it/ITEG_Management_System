import { useEffect, useState } from "react";
import { buttonStyles } from "../../../styles/buttonStyles";
import CommonTable from "../../common-components/table/CommonTable";
import Avatar from "../../common-components/Avatar";
import OrangeButton from "../../common-components/sidebar/OrangeButton";
import InputField from "../../common-components/common-feild/InputField";
import CustomDropdown from "../../common-components/common-feild/CustomDropdown";
import CustomDatePicker from "../../student-records/CustomDatePicker";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import { useInterviewCreateMutation, useGetInterviewDetailByIdQuery } from "../../../redux/api/authApi";
import { toast } from "react-toastify";
import PageNavbar from "../../common-components/navbar/PageNavbar";

const fivePointOptions = [
  { value: 1, label: "1. Very Weak" },
  { value: 2, label: "2. Weak" },
  { value: 3, label: "3. Average" },
  { value: 4, label: "4. Good" },
  { value: 5, label: "5. Very Good" },
];

const behaviorOptions = [
  { value: 1, label: "1. Poor" },
  { value: 2, label: "2. Below Average" },
  { value: 3, label: "3. Average" },
  { value: 4, label: "4. Good" },
  { value: 5, label: "5. Excellent" },
];

const AutoMarksCalculator = () => {
  const { values, setFieldValue } = useFormikContext();
  const { maths, reasoning, subjectKnowlage, goal, sincerity, communication, confidence } = values;
  useEffect(() => {
    const inputs = [maths, reasoning, subjectKnowlage, goal, sincerity, communication, confidence];
    if (inputs.every((v) => v !== "" && !isNaN(v))) {
      setFieldValue("marks", inputs.reduce((s, v) => s + Number(v), 0));
    }
  }, [maths, reasoning, subjectKnowlage, goal, sincerity, communication, confidence, setFieldValue]);
  return null;
};

const InterviewDrawer = ({ row, refetch, activeTab }) => {
  const userInfo = JSON.parse(localStorage.getItem("user")) || {};
  const [lastAttempt, setLastAttempt] = useState(null);
  const [createInterview, { isLoading }] = useInterviewCreateMutation();
  const { data: attemptData, refetch: refetchInterviewData } = useGetInterviewDetailByIdQuery(row._id);

  useEffect(() => {
    if (attemptData?.interviews?.length) {
      const latest = attemptData.interviews.reduce((max, i) =>
        i.attemptNo > (max?.attemptNo || 0) ? i : max, null
      );
      setLastAttempt(latest);
    }
  }, [attemptData]);

  const isTech = activeTab === "Technical Round";

  const initialValues = {
    created_by: userInfo.name || "",
    date: new Date().toISOString().split("T")[0],
    maths: isTech && lastAttempt?.maths !== undefined ? lastAttempt.maths : "",
    subjectKnowlage: isTech && lastAttempt?.subjectKnowlage !== undefined ? lastAttempt.subjectKnowlage : "",
    reasoning: isTech && lastAttempt?.reasoning !== undefined ? lastAttempt.reasoning : "",
    goal: isTech && lastAttempt?.goal !== undefined ? lastAttempt.goal : "",
    sincerity: isTech && lastAttempt?.sincerity !== undefined ? lastAttempt.sincerity : "",
    communication: isTech && lastAttempt?.communication !== undefined ? lastAttempt.communication : "",
    confidence: isTech && lastAttempt?.confidence !== undefined ? lastAttempt.confidence : "",
    attemptNo: lastAttempt?.attemptNo > 0 ? lastAttempt.attemptNo + 1 : 1,
    assignmentMarks: "",
    marks: isTech ? lastAttempt?.marks || 0 : 0,
    result: "Pending",
    remark: "",
  };

  const validationSchema = Yup.object().shape({
    created_by: Yup.string().required(),
    date: Yup.string().required(),
    maths: Yup.number().required(),
    subjectKnowlage: Yup.number().required(),
    reasoning: Yup.number().required(),
    goal: Yup.number().required(),
    sincerity: Yup.number().required(),
    communication: Yup.number().required(),
    confidence: Yup.number().required(),
    attemptNo: Yup.number().required(),
    marks: Yup.number().required(),
    result: Yup.string().required(),
    remark: Yup.string(),
  });

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values, { resetForm }) => {
        try {
          await createInterview({ ...values, round: "First", studentId: row._id }).unwrap();
          if (values.result === "Pass") toast.success("Interview marked as Pass! Student moved to Final Round.");
          else if (values.result === "Fail") toast.warning("Interview marked as Fail!");
          else toast.info("Interview submitted with status: Pending.");
          await refetch?.();
          await refetchInterviewData?.();
          resetForm();
        } catch {
          toast.error("Failed to submit interview.");
        }
      }}
    >
      {({ isSubmitting, submitForm, resetForm }) => (
        <OrangeButton
          buttonTitle="Schedule"
          panelTitle={`Interview`}
          panelSubtitle="Fill in the interview details below."
          drawerContent={
            <Form className="space-y-4">
              <AutoMarksCalculator />
              <p className="text-base font-semibold text-gray-800">{row.firstName} {row.lastName}</p>

              <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Interview Metadata</p>
              <InputField name="created_by" label="Created By" disabled />
              <CustomDatePicker name="date" label="Select Date" />

              <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Technical Knowledge & Aptitude</p>
              <CustomDropdown variant="card" name="maths" label="Mathematics Marks" options={fivePointOptions} />
              <CustomDropdown variant="card" name="subjectKnowlage" label="Subjective Knowledge" options={fivePointOptions} />
              <CustomDropdown variant="card" name="reasoning" label="Reasoning Marks" options={fivePointOptions} />

              <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Candidate Behaviour & Soft Skill</p>
              <CustomDropdown variant="card" name="goal" label="Goal Clarity" options={behaviorOptions} />
              <CustomDropdown variant="card" name="sincerity" label="Sincerity" options={behaviorOptions} />
              <CustomDropdown variant="card" name="communication" label="Communication Level" options={behaviorOptions} />
              <CustomDropdown variant="card" name="confidence" label="Confidence Level" options={behaviorOptions} />

              <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Summary & Decision</p>
              <InputField name="attemptNo" label="Attempt No" disabled />
              <InputField name="marks" label="Total Marks" type="number" disabled />
              <CustomDropdown variant="card" name="result" label="Result" options={[
                { value: "Pass", label: "Pass" },
                { value: "Fail", label: "Fail" },
                { value: "Pending", label: "Pending" },
              ]} />
              <InputField name="remark" label="Remark / Feedback" />
            </Form>
          }
          leftBtnText="Cancel"
          rightBtnText={isLoading ? "Submitting..." : "Submit"}
          onLeftClick={resetForm}
          onRightClick={submitForm}
        />
      )}
    </Formik>
  );
};

const OnlineAssessment = ({ data, toTitleCase, scheduleButton, searchTerm, rowsPerPage, onRowClick, refetch, activeTab }) => {
  const columns = [
    {
      key: "firstName", label: "Full Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar firstName={row.firstName} lastName={row.lastName} imageUrl={row.profileImage} />
          <span>{toTitleCase(`${row.firstName} ${row.lastName}`)}</span>
        </div>
      ),
    },
    { key: "fatherName", label: "Father's Name", render: (row) => toTitleCase(row.fatherName) },
    { key: "studentMobile", label: "Mobile No.", align: "center" },
    { key: "subject12", label: "12th Subject", render: (row) => toTitleCase(row.stream) },
    { key: "course", label: "Course", render: (row) => toTitleCase(row.course) },
  ];

  const actionButton = (row) => (
    <div className="flex items-center gap-2">
      <InterviewDrawer row={row} refetch={refetch} activeTab={activeTab} />
    </div>
  );

  return (
    <>
     <div className="flex items-center justify-between mb-4">
        <PageNavbar
          title="Online Assessment"
          showBackButton={false}
        />
      </div>
        <CommonTable
      data={data}
      columns={columns}
      editable={true}
      pagination={true}
      rowsPerPage={rowsPerPage}
      searchTerm={searchTerm}
      actionButton={actionButton}
      onRowClick={onRowClick}
    />
    </>
  
  );
};

export default OnlineAssessment;
