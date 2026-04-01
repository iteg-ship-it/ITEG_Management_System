import { buttonStyles } from "../../../styles/buttonStyles";
import CommonTable from "../../common-components/table/CommonTable";
import Avatar from "../../common-components/Avatar";
import OrangeButton from "../../common-components/sidebar/OrangeButton";
import InputField from "../../common-components/common-feild/InputField";
import CustomDropdown from "../../common-components/common-feild/CustomDropdown";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useInterviewCreateMutation } from "../../../redux/api/authApi";
import { toast } from "react-toastify";

const FinalInterviewDrawer = ({ row, refetch }) => {
  const [createInterview, { isLoading }] = useInterviewCreateMutation();

  const validationSchema = Yup.object().shape({
    round: Yup.string().required("Required"),
    remark: Yup.string().required("Remark is required"),
    result: Yup.string().required("Result is required"),
  });

  return (
    <Formik
      initialValues={{ round: "Second", remark: "", result: "Pending" }}
      validationSchema={validationSchema}
      onSubmit={async (values, { resetForm }) => {
        try {
          const response = await createInterview({ ...values, studentId: row._id }).unwrap();
          toast.success(response.message || "Interview submitted successfully!");
          await refetch?.();
          resetForm();
        } catch (err) {
          toast.error(err?.data?.message || "Failed to create interview");
        }
      }}
    >
      {({ isSubmitting, submitForm, resetForm }) => (
        <OrangeButton
          buttonTitle="Schedule"
          panelTitle={`Final Round`}
          panelSubtitle="Fill in the final round interview details."
          drawerContent={
            <Form className="space-y-4">
              <CustomDropdown
                variant="card"
                label="Round"
                name="round"
                disabled
                options={[{ value: "Second", label: "Final Round" }]}
              />
              <InputField label="Remark" name="remark" />
              <CustomDropdown
                variant="card"
                label="Result"
                name="result"
                options={[
                  { value: "Pass", label: "Pass" },
                  { value: "Fail", label: "Fail" },
                  { value: "Pending", label: "Pending" },
                ]}
              />
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

const FinalRound = ({ data, toTitleCase, setAddInterviwModalOpen, setId, handleGetStatus, handleGetMarks, searchTerm, rowsPerPage, onRowClick, refetch }) => {
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
    { key: "course", label: "Course", render: (row) => toTitleCase(row.course) },
    {
      key: "onlineTestStatus",
      label: (<div className="flex flex-col"><span>Result</span><span className="text-xs text-gray-500">(1st Round)</span></div>),
      render: (row) => handleGetStatus(row.interviews),
    },
    {
      key: "techMarks",
      label: (<div className="flex flex-col"><span>Marks</span><span className="text-xs text-gray-500">(Tech Round)</span></div>),
      align: "center",
      render: (row) => handleGetMarks(row.interviews),
    },
    {
      key: "attempts",
      label: (<div className="flex flex-col"><span>Attempts</span><span className="text-xs text-gray-500">(1st Round)</span></div>),
      align: "center",
      render: (row) => (row.interviews?.filter((i) => i.round === "First") || []).length,
    },
  ];

  const actionButton = (row) => {
    const isSuperAdmin = localStorage.getItem("role") === "superadmin";
    return (
      <div className="flex items-center gap-2">
        <FinalInterviewDrawer row={row} refetch={refetch} />
      </div>
    );
  };

  return (
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
  );
};

export default FinalRound;
