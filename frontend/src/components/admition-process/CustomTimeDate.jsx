/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { useState } from "react";
import {
  useInterviewCreateMutation,
  useGetInterviewDetailByIdQuery,
} from "../../redux/api/authApi";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

import TextInput from "../common-components/common-feild/TextInput";
import SelectInput from "../common-components/common-feild/SelectInput";
import DatePickerInput from "../datepickerInput/DatePickerInput";

const CustomTimeDate = ({ isOpen, onClose, studentId, refetch, activeTab }) => {
  console.log("activeTab", activeTab);
  const userInfo = JSON.parse(localStorage.getItem("user")) || {};
  const [lastAttempt, setLastAttempt] = useState(0);
  const [studentName, setStudentName] = useState("");
  
  // Get student name directly from localStorage
  useEffect(() => {
    const storedStudent = JSON.parse(localStorage.getItem("currentInterviewStudent") || "{}");
    if (storedStudent && storedStudent.name) {
      setStudentName(storedStudent.name);
    }
  }, []);
  
  console.log("lastAttempt", lastAttempt);

  // const { id } = useParams();
  const { data: attemptData } = useGetInterviewDetailByIdQuery(studentId);
  console.log("Attempt Data:", attemptData);

  const [createInterview, { isLoading }] = useInterviewCreateMutation();

  // Return nothing if modal is closed or attempt is still loading

  const initialValues = {
    created_by: userInfo.name || "",
    date: new Date().toISOString().split('T')[0],
    // maths: activeTab === "Technical Round" ? lastAttempt?.maths : 0,
    maths:
      activeTab === "Technical Round" && lastAttempt?.maths !== undefined
        ? lastAttempt.maths
        : "",
    subjectKnowlage:
      activeTab === "Technical Round" &&
      lastAttempt?.subjectKnowlage !== undefined
        ? lastAttempt.subjectKnowlage
        : "",
    reasoning:
      activeTab === "Technical Round" && lastAttempt?.reasoning !== undefined
        ? lastAttempt.reasoning
        : "",
    goal:
      activeTab === "Technical Round" && lastAttempt?.goal !== undefined
        ? lastAttempt.goal
        : "",
    sincerity:
      activeTab === "Technical Round" && lastAttempt?.sincerity !== undefined
        ? lastAttempt.sincerity
        : "",
    communication:
      activeTab === "Technical Round" &&
      lastAttempt?.communication !== undefined
        ? lastAttempt.communication
        : "",
    confidence:
      activeTab === "Technical Round" && lastAttempt?.confidence !== undefined
        ? lastAttempt.confidence
        : "",
    attemptNo: lastAttempt?.attemptNo > 0 ? lastAttempt?.attemptNo + 1 : 1,
    assignmentMarks: "",
    marks: activeTab === "Technical Round" ? lastAttempt?.marks : 0,
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
    assignmentMarks: Yup.string(),
    marks: Yup.number().required(),
    result: Yup.string().required(),
    remark: Yup.string(),
  });

  const handleSubmit = async (values, { resetForm }) => {
    const payload = {
      ...values,
      round: "First",
      studentId,
    };

    try {
      await createInterview(payload).unwrap();

      // 🔥 Custom messages based on result
      if (values.result === "Pass") {
        toast.success("🎉 Interview marked as *Pass*! Student moved to Final Round.");
      } else if (values.result === "Fail") {
        toast.warning("⚠️ Interview marked as *Fail*!");
      } else {
        toast.info("✅ Interview submitted with status: Pending.");
      }

      refetch?.();
      resetForm();
      onClose();
    } catch (err) {
      toast.error("❌ Failed to schedule interview.");
      console.error("Interview error:", err);
    }
  };

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

  const assignmentStatusOptions = [
    { value: "Pass", label: "Pass" },
    { value: "Fail", label: "Fail" },
    { value: "Pending", label: "Pending" },
  ];

  useEffect(() => {
    if (attemptData) {
      let lastAttempt1 = 0;
      attemptData?.interviews?.forEach((interview) => {
        if (interview.attemptNo > lastAttempt1) {
          lastAttempt1 = interview.attemptNo;
          setLastAttempt(interview);
        }
      });
    }
  }, [attemptData]);
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl py-6 px-8 w-full max-w-3xl h-[95vh] overflow-y-auto no-scrollbar relative">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-center text-orange-500">
            Technical Interview Form
          </h2>
          <p className="text-center mt-2 text-lg font-medium text-gray-800">
            Student Name - {studentName}
          </p>
        </div>

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AutoMarksCalculator />

              <div className="col-span-2 text-sm font-semibold text-gray-600">
                Interview Metadata
              </div>
              <TextInput name="created_by" label="Created By" disabled />
              <DatePickerInput name="date" label="Select Date" />

              <div className="col-span-2 text-sm font-semibold text-gray-600">
                Technical Knowledge & Aptitude
              </div>
              <SelectInput
                name="maths"
                label="Mathematics Marks"
                options={fivePointOptions}
              />
              <SelectInput
                name="subjectKnowlage"
                label="Subjective Knowledge"
                options={fivePointOptions}
              />
              <SelectInput
                name="reasoning"
                label="Reasoning Marks"
                options={fivePointOptions}
              />

              <div className="col-span-2 text-sm font-semibold text-gray-600">
                Candidate Behaviour & Soft Skill
              </div>
              <SelectInput
                name="goal"
                label="Goal Clarity"
                options={behaviorOptions}
              />
              <SelectInput
                name="sincerity"
                label="Sincerity"
                options={behaviorOptions}
              />
              <SelectInput
                name="communication"
                label="Communication Level"
                options={behaviorOptions}
              />
              <SelectInput
                name="confidence"
                label="Confidence Level"
                options={behaviorOptions}
              />

              <div className="col-span-2 text-sm font-semibold text-gray-600">
                Assignment Evaluation
              </div>

              <TextInput name="attemptNo" label="Attempt No" disabled />

              {/* Assignment Marks Field + Conditional Message */}
              <div>
                <SelectInput
                  name="assignmentMarks"
                  label="Assignment Marks"
                  options={
                    activeTab === "Technical Round"
                      ? assignmentStatusOptions
                      : behaviorOptions // ← existing behaviorOptions for normal case
                  }
                  disabled={activeTab !== "Technical Round"} // Disable only outside Technical
                />

                {activeTab !== "Technical Round" && (
                  <p className="text-xs text-gray-500 ml-1 italic">
                    ⚠️ This field is only applicable for the Technical Round.
                  </p>
                )}
              </div>

              <div className="col-span-2 text-sm font-semibold text-gray-600">
                Summary & Decision
              </div>
              <TextInput
                name="marks"
                label="Total Mark"
                type="number"
                disabled
              />
              <SelectInput
                name="result"
                label="Result"
                options={[
                  { value: "Pass", label: "Pass" },
                  { value: "Fail", label: "Fail" },
                  { value: "Pending", label: "Pending" },
                ]}
              />
              <TextInput
                name="remark"
                label="Remark / Feedback..."
                className="col-span-2"
              />

              <div className="col-span-2 flex justify-center mt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-brandYellow text-white px-6 py-2 rounded-md hover:bg-orange-600"
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl text-gray-400 hover:text-gray-700"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default CustomTimeDate;

const AutoMarksCalculator = () => {
  const { values, setFieldValue } = useFormikContext();

  const {
    maths,
    reasoning,
    subjectKnowlage,
    goal,
    sincerity,
    communication,
    confidence,
    assignmentMarks,
  } = values;

  useEffect(() => {
    const inputs = [
      maths,
      reasoning,
      subjectKnowlage,
      goal,
      sincerity,
      communication,
      confidence,
      assignmentMarks,
    ];
    const inputsToCheck = inputs.slice(0, 7);

    const allFilled = inputsToCheck.every((val) => val !== "" && !isNaN(val));

    if (allFilled) {
      const total = inputsToCheck.reduce((sum, val) => sum + Number(val), 0);
      setFieldValue("marks", total);
    }
  }, [
    maths,
    reasoning,
    subjectKnowlage,
    goal,
    sincerity,
    communication,
    confidence,
    assignmentMarks,
    setFieldValue,
  ]);

  return null;
};