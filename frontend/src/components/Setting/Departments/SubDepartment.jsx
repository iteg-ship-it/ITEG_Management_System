import { useState, useMemo } from 'react';
import Header from '../../common-components/sidebar/Header';
import { useGetAllSubdepartmentsQuery, useGetAllDepartmentsQuery, useAddSubdepartmentMutation, useUpdateSubdepartmentMutation } from '../../../redux/api/authApi';
import Loader from '../../common-components/loader/Loader';
import { MdAccountTree } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import OrangeButton from '../../common-components/sidebar/OrangeButton';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import InputField from '../../common-components/common-feild/InputField';
import RadioGroup from '../../common-components/common-feild/RadioGroup';
import CommonCard from '../CommonCard';

// Reusable course checkbox list — shows courses from the selected department
const CourseCheckboxes = ({ departmentId, departments, values, setFieldValue }) => {
    const dept = departments.find(d => d._id === departmentId);
    const courses = (dept?.allowedCourses || []).map(c => c.courseName).filter(Boolean);

    if (!departmentId) return <p className="text-xs text-gray-400">Select a department first.</p>;
    if (courses.length === 0) return <p className="text-xs text-gray-400">No courses defined in this department.</p>;

    return (
        <div className="space-y-2">
            {courses.map((course) => (
                <label key={course} className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={values.allowedCourses.includes(course)}
                        onChange={(e) => {
                            const updated = e.target.checked
                                ? [...values.allowedCourses, course]
                                : values.allowedCourses.filter(c => c !== course);
                            setFieldValue('allowedCourses', updated);
                        }}
                        className="w-4 h-4 accent-orange-500"
                    />
                    <span className="text-sm text-gray-700">{course}</span>
                </label>
            ))}
        </div>
    );
};

const SubDepartment = () => {
    const { data: subdepartmentsData, isLoading, refetch } = useGetAllSubdepartmentsQuery();
    const { data: departmentsData } = useGetAllDepartmentsQuery();
    const [addSubdepartment] = useAddSubdepartmentMutation();
    const [updateSubdepartment] = useUpdateSubdepartmentMutation();
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const subdepartments = subdepartmentsData?.data || [];
    const departments = departmentsData?.data || [];

    const filteredSubdepartments = useMemo(() => {
        const s = searchTerm.toLowerCase();
        return subdepartments.filter(sd =>
            sd.name?.toLowerCase().includes(s) ||
            sd.departmentId?.name?.toLowerCase().includes(s)
        );
    }, [subdepartments, searchTerm]);

    const validationSchema = Yup.object({
        name: Yup.string().required('Subdepartment name is required'),
        departmentId: Yup.string().required('Department is required'),
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
            toast.success('Subdepartment added successfully!');
            resetForm();
            refetch();
        } catch (error) {
            toast.error(error?.data?.message || 'Error saving subdepartment');
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) return <Loader />;

    return (
        <>
            <Header title="Sub Departments" showBack={false} />

            <div className="px-6">
                <div className="flex items-end justify-between py-5">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Sub Departments</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Manage academic structure</p>
                    </div>
                    <Formik
                        initialValues={{ name: '', departmentId: '', allowedCourses: [], isActive: true }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ values, setFieldValue, isSubmitting, submitForm, resetForm }) => (
                            <OrangeButton
                                buttonTitle="+ Create Sub-Department"
                                panelTitle="Add New Subdepartment"
                                drawerContent={
                                    <Form className="space-y-4">
                                        <InputField label="Subdepartment Name" name="name" placeholder="Enter subdepartment name" />

                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Department <span className="text-red-400">*</span></label>
                                            <select
                                                value={values.departmentId}
                                                onChange={(e) => {
                                                    setFieldValue('departmentId', e.target.value);
                                                    setFieldValue('allowedCourses', []);
                                                }}
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                                            >
                                                <option value="">Select department</option>
                                                {departments.map(d => (
                                                    <option key={d._id} value={d._id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Allowed Courses</label>
                                            <CourseCheckboxes
                                                departmentId={values.departmentId}
                                                departments={departments}
                                                values={values}
                                                setFieldValue={setFieldValue}
                                            />
                                        </div>

                                        <RadioGroup label="Status" name="isActive" required={false} />
                                    </Form>
                                }
                                leftBtnText="Cancel"
                                rightBtnText={isSubmitting ? 'Adding...' : 'Add Subdepartment'}
                                onLeftClick={resetForm}
                                onRightClick={submitForm}
                            />
                        )}
                    </Formik>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSubdepartments.length === 0 ? (
                        <div className="col-span-full text-center py-16">
                            <MdAccountTree size={48} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">No subdepartments found</p>
                        </div>
                    ) : (
                        filteredSubdepartments.map((subdept) => (
                            <Formik
                                key={subdept._id}
                                initialValues={{
                                    name: subdept.name,
                                    departmentId: subdept.departmentId?._id || subdept.departmentId || '',
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
                                        toast.success('Subdepartment updated successfully!');
                                        resetForm();
                                        refetch();
                                    } catch (error) {
                                        toast.error(error?.data?.message || 'Error updating subdepartment');
                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}
                                enableReinitialize
                            >
                                {({ values, setFieldValue, isSubmitting, submitForm, resetForm }) => (
                                    <CommonCard
                                        key={subdept._id}
                                        variant="card1"
                                        icon={MdAccountTree}
                                        title={subdept.name}
                                        status={subdept.isActive}
                                        infoItems={[
                                            { icon: '', value: subdept.totalStudents || 0, label: 'Students' },
                                            { icon: '', value: subdept.allowedCourses?.length || 0, label: 'Courses' },
                                        ]}
                                        onView={() => navigate('/subdepartment-details', {
                                            state: { departmentId: subdept.departmentId?._id, subdepartment: subdept, departmentName: subdept.departmentId?.name }
                                        })}
                                        onEdit={
                                            <OrangeButton
                                                buttonTitle="Edit"
                                                panelTitle="Edit Subdepartment"
                                                customButtonClass="w-full py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition bg-white"
                                                drawerContent={
                                                    <Form className="space-y-4">
                                                        <InputField label="Subdepartment Name" name="name" placeholder="Enter subdepartment name" />

                                                        <div>
                                                            <label className="block text-sm font-medium mb-1.5">Department</label>
                                                            <select
                                                                value={values.departmentId}
                                                                onChange={(e) => {
                                                                    setFieldValue('departmentId', e.target.value);
                                                                    setFieldValue('allowedCourses', []);
                                                                }}
                                                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                                                            >
                                                                <option value="">Select department</option>
                                                                {departments.map(d => (
                                                                    <option key={d._id} value={d._id}>{d.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium mb-2">Allowed Courses</label>
                                                            <CourseCheckboxes
                                                                departmentId={values.departmentId}
                                                                departments={departments}
                                                                values={values}
                                                                setFieldValue={setFieldValue}
                                                            />
                                                        </div>

                                                        <RadioGroup label="Status" name="isActive" required={false} />
                                                    </Form>
                                                }
                                                leftBtnText="Cancel"
                                                rightBtnText={isSubmitting ? 'Updating...' : 'Update'}
                                                onLeftClick={resetForm}
                                                onRightClick={submitForm}
                                            />
                                        }
                                    />
                                )}
                            </Formik>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default SubDepartment;
