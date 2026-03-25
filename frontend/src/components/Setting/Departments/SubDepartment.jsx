import { useState, useMemo } from 'react';
import Header from '../../common-components/sidebar/Header';
import { useGetAllSubdepartmentsQuery, useDeleteSubdepartmentMutation, useAddSubdepartmentMutation, useUpdateSubdepartmentMutation } from '../../../redux/api/authApi';
import Loader from '../../common-components/loader/Loader';
import { MdAccountTree } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import SearchBox from '../../common-components/seach-export/SearchBox';
import OrangeButton from '../../common-components/sidebar/OrangeButton';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import InputField from '../../common-components/common-feild/InputField';
import RadioGroup from '../../common-components/common-feild/RadioGroup';
import CommonCard from '../CommonCard';

const SubDepartment = () => {
    const { data: subdepartmentsData, isLoading, refetch } = useGetAllSubdepartmentsQuery();
    const [deleteSubdepartment] = useDeleteSubdepartmentMutation();
    const [addSubdepartment] = useAddSubdepartmentMutation();
    const [updateSubdepartment] = useUpdateSubdepartmentMutation();
    const [editingSubdept, setEditingSubdept] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const subdepartments = subdepartmentsData?.data || [];

    const filteredSubdepartments = useMemo(() => {
        return subdepartments.filter(subdept => {
            const searchLower = searchTerm.toLowerCase();
            return (
                subdept.name?.toLowerCase().includes(searchLower) ||
                subdept.departmentId?.name?.toLowerCase().includes(searchLower) ||
                subdept.allowedCourses?.some(course => course.toLowerCase().includes(searchLower))
            );
        });
    }, [subdepartments, searchTerm]);

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

            await addSubdepartment(payload).unwrap();
            toast.success("Subdepartment added successfully!");
            resetForm();
            refetch();
        } catch (error) {
            toast.error(error?.data?.message || "Error saving subdepartment");
        } finally {
            setSubmitting(false);
        }
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
            <Header title="Subdepartments" showBack={false} />
            <div className="px-5">
                <div className="flex justify-end items-center gap-4 py-4">
                    <div className="w-80">
                        <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                    </div>
                    <Formik
                        initialValues={{
                            name: "",
                            departmentId: "",
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-3 px-5">
                {filteredSubdepartments.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <MdAccountTree size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No subdepartments found</p>
                    </div>
                ) : (
                    filteredSubdepartments.map((subdept) => (
                        <CommonCard
                            key={subdept._id}
                            icon={MdAccountTree}
                            title={subdept.name}
                            description={subdept.departmentId?.name || "No department"}
                            status={subdept.isActive}
                            infoItems={[
                                { icon: "📚", label: "Courses", value: subdept.allowedCourses?.length || 0 },
                                { icon: "🏢", label: "Department", value: subdept.departmentId?.name || "N/A" }
                            ]}
                            onView={() => navigate(`/subdepartment/${subdept._id}/levels`, {
                                state: { departmentId: subdept.departmentId?._id, subdepartment: subdept, departmentName: subdept.departmentId?.name }
                            })}
                            onEdit={
                                <Formik
                                    key={subdept._id}
                                    initialValues={{
                                        name: subdept.name,
                                        departmentId: subdept.departmentId?._id || subdept.departmentId,
                                        allowedCourses: subdept.allowedCourses || [],
                                        isActive: subdept.isActive
                                    }}
                                    validationSchema={validationSchema}
                                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                                        try {
                                            const payload = {
                                                name: values.name,
                                                departmentId: values.departmentId,
                                                allowedCourses: values.allowedCourses.filter(c => c),
                                                isActive: values.isActive
                                            };
                                            await updateSubdepartment({ subdepartmentId: subdept._id, ...payload }).unwrap();
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
                                            buttonTitle="EDIT"
                                            panelTitle="Edit Subdepartment"
                                            customButtonClass="w-full bg-orange-500 text-white rounded-lg py-2 text-sm font-semibold hover:bg-orange-600 transition"
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
                                                        disabled={true}
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
            </div>
        </>
    );
};

export default SubDepartment;