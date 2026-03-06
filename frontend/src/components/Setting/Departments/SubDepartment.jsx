import { useState, useRef, useEffect } from 'react';
import PageNavbar from '../../common-components/navbar/PageNavbar';
import { useGetAllSubdepartmentsQuery, useDeleteSubdepartmentMutation, useAddSubdepartmentMutation, useUpdateSubdepartmentMutation } from '../../../redux/api/authApi';
import Loader from '../../common-components/loader/Loader';
import { MdEdit, MdDelete } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import CommonTable from '../../common-components/table/CommonTable';
import Pagination from '../../common-components/pagination/Pagination';
import OrangeButton from '../../common-components/sidebar/OrangeButton';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import InputField from '../../common-components/common-feild/InputField';
import RadioGroup from '../../common-components/common-feild/RadioGroup';

const SubDepartment = () => {
    const { data: subdepartmentsData, isLoading, refetch } = useGetAllSubdepartmentsQuery();
    const [deleteSubdepartment] = useDeleteSubdepartmentMutation();
    const [addSubdepartment] = useAddSubdepartmentMutation();
    const [updateSubdepartment] = useUpdateSubdepartmentMutation();
    const [editingSubdept, setEditingSubdept] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [rowsPerPage] = useState(10);
    const [selectedRows, setSelectedRows] = useState([]);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const navigate = useNavigate();

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

    const handleEdit = (row) => {
        setEditingSubdept(row);
        setIsEditDrawerOpen(true);
    };

    const handleDelete = async (subdept) => {
        if (window.confirm("Are you sure you want to delete this subdepartment?")) {
            try {
                await deleteSubdepartment(subdept._id).unwrap();
                toast.success("Subdepartment deleted successfully!");
                refetch();
            } catch (error) {
                toast.error(error?.data?.message || "Error deleting subdepartment");
            }
        }
    };

    if (isLoading) {
        return <Loader />;
    }

    return (
        <>
            <PageNavbar
                title="All Subdepartments"
                subtitle="View and manage all subdepartments across departments"
                showBackButton={false}
            />
            <div className="mt-1 border bg-[var(--backgroundColor)] shadow-sm rounded-lg">
                <div className="px-6">
                    <div className="flex justify-between items-center flex-wrap gap-4 py-4">
                        <Pagination
                            rowsPerPage={rowsPerPage}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            filtersConfig={[]}
                            filteredData={subdepartments}
                            selectedRows={selectedRows}
                            allData={subdepartments}
                            sectionName="subdepartments"
                        />
                        <div className="flex-shrink-0">
                            <Formik
                                key={editingSubdept?._id || 'new'}
                                initialValues={{
                                    name: editingSubdept?.name || "",
                                    departmentId: editingSubdept?.departmentId?._id || editingSubdept?.departmentId || "",
                                    allowedCourses: editingSubdept?.allowedCourses || [],
                                    isActive: editingSubdept?.isActive !== undefined ? editingSubdept.isActive : true
                                }}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                                enableReinitialize
                            >
                                {({ values, setFieldValue, isSubmitting, submitForm, resetForm }) => (
                                    <OrangeButton
                                        buttonTitle="Add Subdepartment"
                                        panelTitle={editingSubdept ? "Edit Subdepartment" : "Add New Subdepartment"}
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
                                        rightBtnText={isSubmitting ? "Saving..." : (editingSubdept ? "Update Subdepartment" : "Add Subdepartment")}
                                        onLeftClick={() => {
                                            resetForm();
                                            setEditingSubdept(null);
                                        }}
                                        onRightClick={submitForm}
                                    />
                                )}
                            </Formik>
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
                                        departmentId: editingSubdept?.departmentId?._id || editingSubdept?.departmentId || "",
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

                <CommonTable
                    columns={[
                        { key: 'name', label: 'Subdepartment Name' },
                        { key: 'departmentId.name', label: 'Department', render: (row) => row.departmentId?.name || 'N/A' },
                        { 
                            key: 'isActive', 
                            label: 'Status',
                            render: (row) => (
                                <span className={`inline-block px-3 py-1 text-xs rounded-full ${
                                    row.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}>
                                    {row.isActive ? "Active" : "Inactive"}
                                </span>
                            )
                        },
                        { key: 'allowedCourses', label: 'Courses', render: (row) => row.allowedCourses?.length || 0 },
                    ]}
                    data={subdepartments}
                    editable={true}
                    pagination={true}
                    rowsPerPage={rowsPerPage}
                    searchTerm={searchTerm}
                    actionButton={(row) => (
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(row);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                                <MdEdit size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(row)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                <MdDelete size={18} />
                            </button>
                        </div>
                    )}
                    onRowClick={(row) => navigate('/subdepartment-details', { 
                        state: { departmentId: row.departmentId?._id, subdepartment: row, departmentName: row.departmentId?.name } 
                    })}
                    onSelectionChange={setSelectedRows}
                />
            </div>
        </>
    );
};

export default SubDepartment;