import { useState } from "react";
import { MdBusiness, MdPerson, MdDescription, MdCode, MdCalendarToday, MdAdd, MdEdit, MdDelete, MdAccountTree } from "react-icons/md";
import PageNavbar from "../../common-components/navbar/PageNavbar";
import { useNavigate, useLocation } from "react-router-dom";
import { useDeleteSubdepartmentMutation, useGetSubdepartmentsByDepartmentQuery, useAddSubdepartmentMutation, useUpdateSubdepartmentMutation } from "../../../redux/api/authApi";
import { toast } from "react-toastify";
import OrangeButton from "../../common-components/sidebar/OrangeButton";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "../../common-components/common-feild/InputField";
import RadioGroup from "../../common-components/common-feild/RadioGroup";

const DepartmentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const department = location.state?.department;
  const { data: subdepartmentsData, refetch } = useGetSubdepartmentsByDepartmentQuery(department?._id, {
    skip: !department?._id
  });
  const [deleteSubdepartment] = useDeleteSubdepartmentMutation();
  const [addSubdepartment] = useAddSubdepartmentMutation();
  const [updateSubdepartment] = useUpdateSubdepartmentMutation();
  const [editingSubdept, setEditingSubdept] = useState(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const subdepartments = subdepartmentsData?.data || [];

  const validationSchema = Yup.object({
    name: Yup.string().required("Subdepartment name is required"),
    departmentId: Yup.string().required("Department is required"),
    allowedCourses: Yup.array().of(Yup.string()),
    isActive: Yup.boolean()
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = {
        name: values.name,
        departmentId: values.departmentId,
        allowedCourses: values.allowedCourses.filter(c => c),
        isActive: values.isActive
      };

      if (editingSubdept) {
        await updateSubdepartment({ subdepartmentId: editingSubdept._id, ...payload }).unwrap();
        toast.success("Subdepartment updated successfully!");
      } else {
        await addSubdepartment(payload).unwrap();
        toast.success("Subdepartment added successfully!");
      }
      resetForm();
      setEditingSubdept(null);
      setIsEditDrawerOpen(false);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Error saving subdepartment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (subdept) => {
    setEditingSubdept(subdept);
    setIsEditDrawerOpen(true);
  };

  const handleDelete = async (subdeptId) => {
    if (window.confirm("Are you sure you want to delete this subdepartment?")) {
      try {
        await deleteSubdepartment(subdeptId).unwrap();
        toast.success("Subdepartment deleted successfully!");
        refetch();
      } catch (error) {
        toast.error(error?.data?.message || "Error deleting subdepartment");
      }
    }
  };

  if (!department) {
    return (
      <div className="p-6">
        <p>No department data found</p>
      </div>
    );
  }

  return (
    <>
      <PageNavbar
        title="Department Details"
        subtitle="View department information and manage subdepartments"
        showBackButton={true}
      />
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Department Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#FDA92D] to-[#FDB84D] rounded-xl flex items-center justify-center shadow-md">
              <MdBusiness size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{department.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">{department.code}</span>
                <span className="text-xs text-gray-500">•</span>
                <span className={`inline-block px-3 py-1 text-xs rounded-full ${
                  department.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {department.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Department Info Cards */}
        <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                <MdPerson size={24} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium mb-1">Head of Department</p>
                <p className="text-sm font-bold text-blue-900">
                  {department.headOfDepartment || "Not assigned"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-md">
                <MdCode size={24} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-purple-600 font-medium mb-1">Department Code</p>
                <p className="text-sm font-bold text-purple-900">{department.code}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                <MdCalendarToday size={24} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium mb-1">Created Date</p>
                <p className="text-sm font-bold text-green-900">
                  {department.createdAt ? new Date(department.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-md">
                <MdBusiness size={24} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-orange-600 font-medium mb-1">Subdepartments</p>
                <p className="text-sm font-bold text-orange-900">{subdepartments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {department.description && (
          <div className="px-6 py-5 border-t border-gray-200 bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MdDescription size={20} className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium mb-1">Description</p>
                <p className="text-sm text-gray-700 leading-relaxed">{department.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Subdepartments Section */}
        <div className="border-t border-gray-200 px-6 py-5 bg-white">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <MdAccountTree size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Subdepartments</h2>
                <p className="text-xs text-gray-500">{subdepartments.length} subdepartments registered</p>
              </div>
            </div>
            <Formik
              initialValues={{
                name: "",
                departmentId: department?._id || "",
                allowedCourses: [],
                isActive: true
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue, isSubmitting, submitForm, resetForm }) => (
                <OrangeButton
                  buttonTitle="Add Subdepartment"
                  panelTitle="Add New Subdepartment"
                  drawerContent={
                    <Form className="space-y-4">
                      <InputField
                        label="Subdepartment Name"
                        name="name"
                        placeholder="Enter subdepartment name"
                      />
                      <InputField
                        label="Department ID"
                        name="departmentId"
                        placeholder="Enter department ID"
                      />
                      <div>
                        <label className="block text-sm font-medium mb-2">Allowed Courses</label>
                        {values.allowedCourses.map((course, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <input
                              value={course}
                              onChange={(e) => {
                                const newCourses = [...values.allowedCourses];
                                newCourses[index] = e.target.value;
                                setFieldValue('allowedCourses', newCourses);
                              }}
                              placeholder="Course name"
                              className="flex-1 border rounded px-3 py-2"
                            />
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
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setFieldValue('allowedCourses', [...values.allowedCourses, ''])}
                          className="text-sm text-orange-500 hover:text-orange-600"
                        >
                          + Add Course
                        </button>
                      </div>
                      <RadioGroup label="Status" name="isActive" required={false} />
                    </Form>
                  }
                  leftBtnText="Cancel"
                  rightBtnText={isSubmitting ? "Adding..." : "Add Subdepartment"}
                  onLeftClick={resetForm}
                  onRightClick={submitForm}
                />
              )}
            </Formik>
          </div>

          {/* Subdepartments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {console.log('All subdepartments:', subdepartments)}
            {subdepartments.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <MdAccountTree size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No subdepartments found</p>
              </div>
            ) : (
              subdepartments.map((subdept) => (
                <div
                  key={subdept._id}
                  className={`border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer ${
                    subdept.isActive ? "bg-gradient-to-br from-gray-50 to-white" : "bg-gray-200"
                  }`}
                  onClick={() => navigate('/subdepartment-details', { 
                    state: { departmentId: department._id, subdepartment: subdept, departmentName: department.name } 
                  })}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                      <MdAccountTree size={24} className="text-white" />
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      subdept.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {subdept.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{subdept.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">Courses: {subdept.allowedCourses?.length || 0}</p>
                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(subdept);
                      }}
                      className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <MdEdit size={16} /> Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(subdept._id);
                      }}
                      className="flex-1 py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <MdDelete size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Edit Drawer */}
      {isEditDrawerOpen && editingSubdept && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            onClick={() => {
              setIsEditDrawerOpen(false);
              setEditingSubdept(null);
            }}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative w-full max-w-md h-full bg-white shadow-xl flex flex-col">
            <div className="flex items-start justify-between px-6 py-5 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Edit Subdepartment</h2>
                <p className="text-sm text-gray-500 mt-1">Update subdepartment details</p>
              </div>
              <button
                onClick={() => {
                  setIsEditDrawerOpen(false);
                  setEditingSubdept(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <Formik
                initialValues={{
                  name: editingSubdept?.name || "",
                  departmentId: editingSubdept?.departmentId?._id || editingSubdept?.departmentId || department?._id || "",
                  allowedCourses: editingSubdept?.allowedCourses || [],
                  isActive: editingSubdept?.isActive !== undefined ? editingSubdept.isActive : true
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ values, setFieldValue, isSubmitting, submitForm }) => (
                  <Form className="space-y-4">
                    <InputField
                      label="Subdepartment Name"
                      name="name"
                      placeholder="Enter subdepartment name"
                    />
                    <InputField
                      label="Department ID"
                      name="departmentId"
                      placeholder="Enter department ID"
                    />
                    <div>
                      <label className="block text-sm font-medium mb-2">Allowed Courses</label>
                      {values.allowedCourses.map((course, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            value={course}
                            onChange={(e) => {
                              const newCourses = [...values.allowedCourses];
                              newCourses[index] = e.target.value;
                              setFieldValue('allowedCourses', newCourses);
                            }}
                            placeholder="Course name"
                            className="flex-1 border rounded px-3 py-2"
                          />
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
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setFieldValue('allowedCourses', [...values.allowedCourses, ''])}
                        className="text-sm text-orange-500 hover:text-orange-600"
                      >
                        + Add Course
                      </button>
                    </div>
                    <RadioGroup label="Status" name="isActive" required={false} />
                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditDrawerOpen(false);
                          setEditingSubdept(null);
                        }}
                        className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={submitForm}
                        disabled={isSubmitting}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FDA92D] to-[#FDB84D] text-white font-semibold"
                      >
                        {isSubmitting ? "Updating..." : "Update"}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DepartmentDetails;
