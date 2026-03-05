import { useState } from "react";
import { MdBusiness, MdAdd } from "react-icons/md";
import PageNavbar from "../../common-components/navbar/PageNavbar";
import { useGetAllDepartmentsQuery, useDeleteDepartmentMutation, useAddDepartmentMutation, useUpdateDepartmentMutation } from "../../../redux/api/authApi";
import Loader from "../../common-components/loader/Loader";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import OrangeButton from "./../../common-components/sidebar/OrangeButton";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import InputField from "../../common-components/common-feild/InputField";
import RadioGroup from "../../common-components/common-feild/RadioGroup";
import Header from "./../../common-components/sidebar/Header";

const DepartmentManagement = () => {
  const navigate = useNavigate();
  const { data: departmentsData, isLoading, refetch } = useGetAllDepartmentsQuery();
  const [deleteDepartment] = useDeleteDepartmentMutation();
  const [addDepartment] = useAddDepartmentMutation();
  const [updateDepartment] = useUpdateDepartmentMutation();
  const [editingDepartment, setEditingDepartment] = useState(null);

  const departments = departmentsData?.data || [];

  const validationSchema = Yup.object({
    name: Yup.string().required("Department name is required"),
    code: Yup.string().required("Department code is required"),
    description: Yup.string(),
    universityName: Yup.string().required("University name is required"),
    headOfDepartment: Yup.string(),
    allowedCourses: Yup.array().of(
      Yup.object({
        courseName: Yup.string().required("Course name is required"),
        durationInYears: Yup.number().required("Duration is required").positive("Must be positive")
      })
    ),
    reportConfig: Yup.object({
      templateType: Yup.string().required("Template type is required"),
      sections: Yup.object()
    }).required("Report config is required"),
    isActive: Yup.boolean()
  });

  const handleDepartmentSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = {
        name: values.name,
        code: values.code,
        universityName: values.universityName,
        description: values.description,
        headOfDepartment: values.headOfDepartment,
        allowedCourses: values.allowedCourses.filter(c => c.courseName && c.durationInYears),
        reportConfig: values.reportConfig,
        isActive: values.isActive
      };

      if (editingDepartment) {
        const result = await updateDepartment({ id: editingDepartment._id, ...payload }).unwrap();
        toast.success(result.message || "Department updated successfully!");
      } else {
        const result = await addDepartment(payload).unwrap();
        toast.success(result.message || "Department added successfully!");
      }
      resetForm();
      setEditingDepartment(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Error saving department");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await deleteDepartment(id).unwrap();
        toast.success("Department deleted successfully!");
        refetch();
      } catch (error) {
        toast.error(error?.data?.message || "Error deleting department");
      }
    }
  };

  const handleRowClick = (department) => {
    navigate(`/department-details/${department._id}`, { state: { department } });
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Header sidebarOpen={true} title="Department Management" />
      <div className="px-5">

        <div className="flex justify-between items-center py-4">
          <PageNavbar
            title="Department Management"
            subtitle="Manage your organization departments and their details"
            showBackButton={false}
          />
          <div className="flex-shrink-0">
            <Formik
              key={editingDepartment?._id || 'new'}
              initialValues={{
                name: editingDepartment?.name || "",
                code: editingDepartment?.code || "",
                description: editingDepartment?.description || "",
                universityName: editingDepartment?.universityName || "",
                headOfDepartment: editingDepartment?.headOfDepartment || "",
                allowedCourses: editingDepartment?.allowedCourses || [{ courseName: "", durationInYears: "" }],
                reportConfig: editingDepartment?.reportConfig || {
                  templateType: "ITEG_STANDARD",
                  sections: {
                    showTechnicalSkills: true,
                    showSoftSkills: true,
                    showDiscipline: true,
                    showProjects: true,
                    showCareerReadiness: true,
                    showUniversityAcademicHistory: true,
                    showTaskCompletionPercentage: true,
                    showEvaluationBreakdown: true
                  }
                },
                isActive: editingDepartment?.isActive !== undefined ? editingDepartment.isActive : true
              }}
              validationSchema={validationSchema}
              onSubmit={handleDepartmentSubmit}
              enableReinitialize
            >
              {({ values, setFieldValue, isSubmitting, submitForm, resetForm }) => (
                <OrangeButton
                  buttonTitle="Add Department"
                  panelTitle={editingDepartment ? "Edit Department" : "Add New Department"}
                  drawerContent={
                    <Form className="space-y-4">
                      <InputField
                        label="Department Name"
                        name="name"
                        placeholder="Enter department name"
                      />

                      <InputField
                        label="Department Code"
                        name="code"
                        placeholder="Enter department code"
                      />

                      <InputField
                        label="Description"
                        name="description"
                        type="textarea"
                        placeholder="Enter description"
                      />

                      <InputField
                        label="University Name"
                        name="universityName"
                        placeholder="Enter university name"
                      />

                      <InputField
                        label="Head of Department"
                        name="headOfDepartment"
                        placeholder="Enter HOD name"
                      />

                      <div>
                        <label className="block text-sm font-medium mb-2">Allowed Courses</label>
                        {values.allowedCourses.map((course, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <Field
                              name={`allowedCourses.${index}.courseName`}
                              placeholder="Course name"
                              className="flex-1 border rounded px-3 py-2"
                            />
                            <Field
                              name={`allowedCourses.${index}.durationInYears`}
                              type="number"
                              placeholder="Years"
                              className="w-24 border rounded px-3 py-2"
                            />
                            {values.allowedCourses.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newCourses = values.allowedCourses.filter((_, i) => i !== index);
                                  setFieldValue('allowedCourses', newCourses);
                                }}
                                className="px-3 py-2 bg-red-500 text-white rounded"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setFieldValue('allowedCourses', [...values.allowedCourses, { courseName: '', durationInYears: '' }])}
                          className="text-sm text-orange-500 hover:text-orange-600"
                        >
                          + Add Course
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Template Type</label>
                        <Field as="select" name="reportConfig.templateType" className="w-full border rounded px-3 py-2">
                          <option value="ITEG_STANDARD">ITEG Standard</option>
                          <option value="MEG_WEIGHTED">MEG Weighted</option>
                          <option value="BEG_CUTOFF">BEG Cutoff</option>
                          <option value="BTECH_STAGE">BTech Stage</option>
                        </Field>
                      </div>

                      <RadioGroup label="Status" name="isActive" required={false} />
                    </Form>
                  }
                  leftBtnText="Cancel"
                  rightBtnText={isSubmitting ? "Saving..." : (editingDepartment ? "Update Department" : "Add Department")}
                  onLeftClick={() => {
                    resetForm();
                    setEditingDepartment(null);
                  }}
                  onRightClick={submitForm}
                />
              )}
            </Formik>
          </div>
        </div>
        <div className="mt-1 ">

          {/* Departments Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-3">
            {departments.map((dept) => (
              <div
                key={dept._id}
                className="bg-[#f9fafb] border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden min-h-[380px] flex flex-col"
              >
                <div className="p-6 flex-1">

                  {/* top row */}
                  <div className="flex items-start justify-between mb-4">

                    {/* icon circle */}
                    <div className="w-14 h-14 rounded-full border border-orange-200 bg-orange-50 flex items-center justify-center">
                      <MdBusiness className="text-orange-500" size={26} />
                    </div>

                    {/* status pill */}
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full tracking-wide
              ${dept.status
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"}
            `}
                    >
                      {dept.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  {/* title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {dept.name}
                  </h3>

                  {/* description */}
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {dept.description || dept.universityName || "No description"}
                  </p>

                  {/* divider */}
                  <div className="border-t border-gray-200 my-4"></div>

                  {/* info */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      📋 <span>Code: {dept.code}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      👤 <span>HOD: {dept.headOfDepartment || "Not assigned"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      📚 <span>Courses: {dept.allowedCourses?.length || 0}</span>
                    </div>
                  </div>
                </div>

                {/* bottom actions */}
                <div className="flex gap-3 p-4 bg-gray-50">
                  <button
                    onClick={() => handleRowClick(dept)}
                    className="w-1/2 border border-gray-300 rounded-lg py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
                  >
                    VIEW
                  </button>

                  <Formik
                    key={dept._id}
                    initialValues={{
                      name: dept.name,
                      code: dept.code,
                      description: dept.description || "",
                      universityName: dept.universityName,
                      headOfDepartment: dept.headOfDepartment || "",
                      allowedCourses: dept.allowedCourses || [{ courseName: "", durationInYears: "" }],
                      reportConfig: dept.reportConfig,
                      isActive: dept.isActive
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                      try {
                        const payload = {
                          name: values.name,
                          code: values.code,
                          universityName: values.universityName,
                          description: values.description,
                          headOfDepartment: values.headOfDepartment,
                          allowedCourses: values.allowedCourses.filter(c => c.courseName && c.durationInYears),
                          reportConfig: values.reportConfig,
                          isActive: values.isActive
                        };
                        const result = await updateDepartment({ id: dept._id, ...payload }).unwrap();
                        toast.success(result.message || "Department updated successfully!");
                        resetForm();
                        refetch();
                      } catch (error) {
                        toast.error(error?.data?.message || "Error updating department");
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                    enableReinitialize
                  >
                    {({ isSubmitting, submitForm, resetForm, values, setFieldValue }) => (
                      <div className="w-1/2">
                        <OrangeButton
                          buttonTitle="EDIT"
                          panelTitle="Edit Department"
                          customButtonClass="w-full bg-orange-500 text-white rounded-lg py-2 text-sm font-semibold hover:bg-orange-600 transition"
                          drawerContent={
                            <Form className="space-y-4">
                              <InputField
                                label="Department Name"
                                name="name"
                                placeholder="Enter department name"
                              />

                              <InputField
                                label="Department Code"
                                name="code"
                                placeholder="Enter department code"
                              />

                              <InputField
                                label="Description"
                                name="description"
                                type="textarea"
                                placeholder="Enter description"
                              />

                              <InputField
                                label="University Name"
                                name="universityName"
                                placeholder="Enter university name"
                              />

                              <InputField
                                label="Head of Department"
                                name="headOfDepartment"
                                placeholder="Enter HOD name"
                              />

                              <div>
                                <label className="block text-sm font-medium mb-2">Allowed Courses</label>
                                {values.allowedCourses.map((course, index) => (
                                  <div key={index} className="flex gap-2 mb-2">
                                    <Field
                                      name={`allowedCourses.${index}.courseName`}
                                      placeholder="Course name"
                                      className="flex-1 border rounded px-3 py-2"
                                    />
                                    <Field
                                      name={`allowedCourses.${index}.durationInYears`}
                                      type="number"
                                      placeholder="Years"
                                      className="w-24 border rounded px-3 py-2"
                                    />
                                    {values.allowedCourses.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newCourses = values.allowedCourses.filter((_, i) => i !== index);
                                          setFieldValue('allowedCourses', newCourses);
                                        }}
                                        className="px-3 py-2 bg-red-500 text-white rounded"
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => setFieldValue('allowedCourses', [...values.allowedCourses, { courseName: '', durationInYears: '' }])}
                                  className="text-sm text-orange-500 hover:text-orange-600"
                                >
                                  + Add Course
                                </button>
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">Template Type</label>
                                <Field as="select" name="reportConfig.templateType" className="w-full border rounded px-3 py-2">
                                  <option value="ITEG_STANDARD">ITEG Standard</option>
                                  <option value="MEG_WEIGHTED">MEG Weighted</option>
                                  <option value="BEG_CUTOFF">BEG Cutoff</option>
                                  <option value="BTECH_STAGE">BTech Stage</option>
                                </Field>
                              </div>

                              <RadioGroup label="Status" name="isActive" required={false} />
                            </Form>
                          }
                          leftBtnText="Cancel"
                          rightBtnText={isSubmitting ? "Updating..." : "Update Department"}
                          onLeftClick={resetForm}
                          onRightClick={submitForm}
                        />
                      </div>
                    )}
                  </Formik>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default DepartmentManagement;