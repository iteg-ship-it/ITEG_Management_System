import { useState } from "react";
import { MdBusiness, MdOutlinePersonOutline } from "react-icons/md";
import { HiOutlineUserGroup } from "react-icons/hi";
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
import CommonCard from "../CommonCard";

const DepartmentManagement = () => {
  const navigate = useNavigate();
  const { data: departmentsData, isLoading, refetch } = useGetAllDepartmentsQuery();
  const [deleteDepartment] = useDeleteDepartmentMutation();
  const [addDepartment] = useAddDepartmentMutation();
  const [updateDepartment] = useUpdateDepartmentMutation();
  const [editingDepartment, setEditingDepartment] = useState(null);

  const departments = [...(departmentsData?.data || [])].sort((a, b) => b.isActive - a.isActive);

  const validationSchema = Yup.object({
    name: Yup.string().required("Department name is required"),
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
        description: values.description,
        universityName: values.universityName,
        headOfDepartment: values.headOfDepartment,
        allowedCourses: values.allowedCourses
          .filter(c => c.courseName && c.durationInYears)
          .map(c => ({ ...c, durationInYears: Number(c.durationInYears) })),
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
      <Formik
              key={editingDepartment?._id || 'new'}
              initialValues={{
                name: editingDepartment?.name || "",
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
                <Header
                  title="Department Management"
                  breadcrumbs={[{ label: "Departments" }]}
                >
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
                </Header>
              )}
            </Formik>

      <div className="px-6 mt-6">
        {/* Departments Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {departments.map((dept) => (
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
                    const updatePayload = {
                      name: values.name,
                      code: values.code,
                      description: values.description,
                      universityName: values.universityName,
                      headOfDepartment: values.headOfDepartment,
                      allowedCourses: values.allowedCourses
                        .filter(c => c.courseName && c.durationInYears)
                        .map(c => ({ ...c, durationInYears: Number(c.durationInYears) })),
                      reportConfig: values.reportConfig,
                      isActive: values.isActive
                    };
                    const result = await updateDepartment({ id: dept._id, ...updatePayload }).unwrap();
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
                  <CommonCard
                    icon={MdBusiness}
                    title={dept.name}
                    description={dept.description || dept.universityName || "No description"}
                    status={dept.isActive}
                    infoItems={[
                      { icon: <MdOutlinePersonOutline size={18}  />, label: "HOD", value: dept.headOfDepartment || "Not assigned" },
                      { icon: <HiOutlineUserGroup size={18}  />, label: "Students", value: dept.totalStudents ?? 0 },
                    ]}
                    onView={() => handleRowClick(dept)}
                    onEdit={
                      <OrangeButton
                        buttonTitle="EDIT"
                        panelTitle="Edit Department"
                        customButtonClass="w-full bg-orange-500 text-white rounded-lg py-2 text-sm font-semibold hover:bg-orange-600 transition"
                        drawerContent={
                          <Form className="space-y-4">
                            <InputField label="Department Name" name="name" placeholder="Enter department name" />
                            <InputField label="Department Code" name="code" placeholder="Enter department code" disabled={true} />
                            <InputField label="Description" name="description" type="textarea" placeholder="Enter description" />
                            <InputField label="University Name" name="universityName" placeholder="Enter university name" />
                            <InputField label="Head of Department" name="headOfDepartment" placeholder="Enter HOD name" />
                            <div>
                              <label className="block text-sm font-medium mb-2">Allowed Courses</label>
                              {values.allowedCourses.map((course, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                  <Field name={`allowedCourses.${index}.courseName`} placeholder="Course name" className="flex-1 border rounded px-3 py-2" />
                                  <Field name={`allowedCourses.${index}.durationInYears`} type="number" placeholder="Years" className="w-24 border rounded px-3 py-2" />
                                  {values.allowedCourses.length > 1 && (
                                    <button type="button" onClick={() => setFieldValue('allowedCourses', values.allowedCourses.filter((_, i) => i !== index))} className="px-3 py-2 bg-red-500 text-white rounded">✕</button>
                                  )}
                                </div>
                              ))}
                              <button type="button" onClick={() => setFieldValue('allowedCourses', [...values.allowedCourses, { courseName: '', durationInYears: '' }])} className="text-sm text-orange-500 hover:text-orange-600">+ Add Course</button>
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
                    }
                  />
                )}
              </Formik>
            ))}
        </div>
      </div>
    </>
  );
};

export default DepartmentManagement;