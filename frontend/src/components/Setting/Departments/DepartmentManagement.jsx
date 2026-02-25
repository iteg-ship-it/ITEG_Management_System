import { useState } from "react";
import { MdBusiness, MdAdd, MdEdit, MdDelete } from "react-icons/md";
import AddDepartmentModal from "./AddDepartmentModal";
import PageNavbar from "../../common-components/navbar/PageNavbar";
import { useGetAllDepartmentsQuery, useDeleteDepartmentMutation, useAddDepartmentMutation, useUpdateDepartmentMutation } from "../../../redux/api/authApi";
import Loader from "../../common-components/loader/Loader";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import OrangeButton from "./../../common-components/sidebar/OrangeButton";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "../../common-components/common-feild/InputField";
import RadioGroup from "../../common-components/common-feild/RadioGroup";

const DepartmentManagement = () => {
  const navigate = useNavigate();
  const { data: departmentsData, isLoading, refetch } = useGetAllDepartmentsQuery();
  const [deleteDepartment] = useDeleteDepartmentMutation();
  const [addDepartment] = useAddDepartmentMutation();
  const [updateDepartment] = useUpdateDepartmentMutation();
  const [editingDepartment, setEditingDepartment] = useState(null);

  const departments = departmentsData?.data || [];

  const validationSchema = Yup.object({
    departmentName: Yup.string().required("Department name is required"),
    departmentCode: Yup.string().required("Department code is required"),
    headOfDepartment: Yup.string(),
    description: Yup.string(),
    status: Yup.boolean()
  });

  const handleDepartmentSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (editingDepartment) {
        const result = await updateDepartment({ id: editingDepartment._id, ...values }).unwrap();
        toast.success(result.message || "Department updated successfully!");
      } else {
        const result = await addDepartment(values).unwrap();
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
                departmentName: editingDepartment?.departmentName || "",
                departmentCode: editingDepartment?.departmentCode || "",
                headOfDepartment: editingDepartment?.headOfDepartment || "",
                description: editingDepartment?.description || "",
                status: editingDepartment?.status !== undefined ? editingDepartment.status : true
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
                        name="departmentName"
                        placeholder="Enter department name"
                      />

                      <InputField
                        label="Department Code"
                        name="departmentCode"
                        placeholder="Enter department code"
                      />

                      <InputField
                        label="Head of Department"
                        name="headOfDepartment"
                        placeholder="Enter HOD name"
                      />

                      <InputField
                        label="Description"
                        name="description"
                        type="textarea"
                        placeholder="Enter description"
                      />

                      <RadioGroup label="Status" name="status" required={false} />
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
                      {dept.status ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  {/* title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {dept.departmentName}
                  </h3>

                  {/* description */}
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {dept.description || "No description available"}
                  </p>

                  {/* divider */}
                  <div className="border-t border-gray-200 my-4"></div>

                  {/* info */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      👤 <span>HOD: {dept.headOfDepartment || "Not assigned"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      👥 <span>Students: {dept.studentCount || 0}</span>
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
                      departmentName: dept.departmentName,
                      departmentCode: dept.departmentCode,
                      headOfDepartment: dept.headOfDepartment || "",
                      description: dept.description || "",
                      status: dept.status
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                      try {
                        const result = await updateDepartment({ id: dept._id, ...values }).unwrap();
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
                    {({ isSubmitting, submitForm, resetForm }) => (
                      <div className="w-1/2">
                        <OrangeButton
                          buttonTitle="EDIT"
                          panelTitle="Edit Department"
                          customButtonClass="w-full bg-orange-500 text-white rounded-lg py-2 text-sm font-semibold hover:bg-orange-600 transition"
                          drawerContent={
                            <Form className="space-y-4">
                              <InputField
                                label="Department Name"
                                name="departmentName"
                                placeholder="Enter department name"
                              />

                              <InputField
                                label="Department Code"
                                name="departmentCode"
                                placeholder="Enter department code"
                              />

                              <InputField
                                label="Head of Department"
                                name="headOfDepartment"
                                placeholder="Enter HOD name"
                              />

                              <InputField
                                label="Description"
                                name="description"
                                type="textarea"
                                placeholder="Enter description"
                              />

                              <RadioGroup label="Status" name="status" required={false} />
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