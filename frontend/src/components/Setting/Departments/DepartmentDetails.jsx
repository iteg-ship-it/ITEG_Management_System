import { useState } from "react";
import Header from "../../common-components/sidebar/Header";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetSubdepartmentsByDepartmentQuery, useAddSubdepartmentMutation, useUpdateSubdepartmentMutation } from "../../../redux/api/authApi";
import { toast } from "react-toastify";
import OrangeButton from "../../common-components/sidebar/OrangeButton";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "../../common-components/common-feild/InputField";
import RadioGroup from "../../common-components/common-feild/RadioGroup";
import CommonCard from "../CommonCard";
import { MdAccountTree } from "react-icons/md";
import { HiOutlineUserGroup } from "react-icons/hi";
import { MdOutlineMenuBook } from "react-icons/md";
import Loader from "../../common-components/loader/Loader";

const DepartmentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const department = location.state?.department;
  // Extract course names from department's allowedCourses for subdept dropdown
  const departmentCourses = (department?.allowedCourses || []).map(c => c.courseName).filter(Boolean);

  const { data: subdepartmentsData, isLoading, refetch } = useGetSubdepartmentsByDepartmentQuery(department?._id, {
    skip: !department?._id
  });
  const [addSubdepartment] = useAddSubdepartmentMutation();
  const [updateSubdepartment] = useUpdateSubdepartmentMutation();

  const subdepartments = [...(subdepartmentsData?.data || [])].sort((a, b) => b.isActive - a.isActive);

  const validationSchema = Yup.object({
    name: Yup.string().required("Subdepartment name is required"),
    departmentId: Yup.string().required("Department is required"),
    allowedCourses: Yup.array().of(Yup.string()),
    isActive: Yup.boolean()
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await addSubdepartment({
        name: values.name,
        departmentId: values.departmentId,
        allowedCourses: values.allowedCourses.filter(c => c),
        isActive: values.isActive
      }).unwrap();
      toast.success("Subdepartment added successfully!");
      resetForm();
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Error saving subdepartment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!department) return <div className="p-6">No department data found</div>;
  if (isLoading) return <Loader />;

  return (
    <>
      <Formik
            initialValues={{ name: "", departmentId: department?._id || "", allowedCourses: [], isActive: true }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue, isSubmitting, submitForm, resetForm }) => (
              <Header
                title={department.name}
                breadcrumbs={[
                  { label: "Departments", path: "/department-management" },
                  { label: department.name }
                ]}
              >
                <OrangeButton
                  buttonTitle="+ Create Sub-Department"
                  panelTitle="Add New Subdepartment"
                drawerContent={
                  <Form className="space-y-4">
                    <InputField label="Subdepartment Name" name="name" placeholder="Enter subdepartment name" />
                    {/* departmentId is hidden — auto-filled from department context */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Allowed Courses</label>
                      {departmentCourses.length > 0 ? (
                        <div className="space-y-2">
                          {departmentCourses.map((course) => (
                            <label key={course} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={values.allowedCourses.includes(course)}
                                onChange={(e) => {
                                  const updated = e.target.checked
                                    ? [...values.allowedCourses, course]
                                    : values.allowedCourses.filter(c => c !== course);
                                  setFieldValue("allowedCourses", updated);
                                }}
                                className="w-4 h-4 accent-orange-500"
                              />
                              <span className="text-sm text-gray-700">{course}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">No courses defined in this department. Add courses while creating/editing the department.</p>
                      )}
                    </div>
                    <RadioGroup label="Status" name="isActive" required={false} />
                  </Form>
                }
                leftBtnText="Cancel"
                rightBtnText={isSubmitting ? "Adding..." : "Add Subdepartment"}
                onLeftClick={resetForm}
                onRightClick={submitForm}
              />
              </Header>
            )}
          </Formik>

        {/* Cards Grid */}
        <div className="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {subdepartments.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <MdAccountTree size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No subdepartments found</p>
            </div>
          ) : (
            subdepartments.map((subdept) => (
              <CommonCard
                key={subdept._id}
                variant="card1"
                icon={MdAccountTree}
                title={subdept.name}
                status={subdept.isActive}
                infoItems={[
                  { icon: <HiOutlineUserGroup size={14} className="text-orange-400" />, label: "Students", value: subdept.totalStudents || 0 },
                  { icon: <MdOutlineMenuBook size={14} className="text-orange-400" />, label: "Courses", value: subdept.allowedCourses?.length || 0 },
                ]}
                onView={() => navigate("/subdepartment-details", {
                  state: { departmentId: department._id, subdepartment: subdept, departmentName: department.name }
                })}
                onEdit={
                  <Formik
                    key={subdept._id}
                    initialValues={{
                      name: subdept.name,
                      departmentId: subdept.departmentId?._id || subdept.departmentId || department._id,
                      allowedCourses: subdept.allowedCourses || [],
                      isActive: subdept.isActive
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                      try {
                        await updateSubdepartment({
                          subdepartmentId: subdept._id,
                          name: values.name,
                          departmentId: values.departmentId,
                          allowedCourses: values.allowedCourses.filter(c => c),
                          isActive: values.isActive
                        }).unwrap();
                        toast.success("Subdepartment updated successfully!");
                        resetForm();
                        refetch();
                      } catch (error) {
                        toast.error(error?.data?.message || "Error updating subdepartment");
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                  >
                    {({ values, setFieldValue, isSubmitting, submitForm, resetForm }) => (
                      <OrangeButton
                        buttonTitle="Edit"
                        panelTitle="Edit Subdepartment"
                        customButtonClass="w-full bg-orange-500 text-white rounded-lg py-2 text-sm font-semibold hover:bg-orange-600 transition"
                        drawerContent={
                          <Form className="space-y-4">
                            <InputField label="Subdepartment Name" name="name" placeholder="Enter subdepartment name" />
                            {/* departmentId hidden — auto-filled */}
                            <div>
                              <label className="block text-sm font-medium mb-2">Allowed Courses</label>
                              {departmentCourses.length > 0 ? (
                                <div className="space-y-2">
                                  {departmentCourses.map((course) => (
                                    <label key={course} className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={values.allowedCourses.includes(course)}
                                        onChange={(e) => {
                                          const updated = e.target.checked
                                            ? [...values.allowedCourses, course]
                                            : values.allowedCourses.filter(c => c !== course);
                                          setFieldValue("allowedCourses", updated);
                                        }}
                                        className="w-4 h-4 accent-orange-500"
                                      />
                                      <span className="text-sm text-gray-700">{course}</span>
                                    </label>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400">No courses defined in this department.</p>
                              )}
                            </div>
                            <RadioGroup label="Status" name="isActive" required={false} />
                          </Form>
                        }
                        leftBtnText="Cancel"
                        rightBtnText={isSubmitting ? "Updating..." : "Update"}
                        onLeftClick={resetForm}
                        onRightClick={submitForm}
                      />
                    )}
                  </Formik>
                }
              />
            ))
          )}
        </div>
    </>
  );
};

export default DepartmentDetails;
