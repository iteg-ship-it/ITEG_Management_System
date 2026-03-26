import { useState, useMemo } from 'react';
import Header from '../../common-components/sidebar/Header';
import { useGetAllSubdepartmentsQuery, useAddSubdepartmentMutation, useUpdateSubdepartmentMutation } from '../../../redux/api/authApi';
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

const SubDepartment = () => {
    const { data: subdepartmentsData, isLoading, refetch } = useGetAllSubdepartmentsQuery();
    const [addSubdepartment] = useAddSubdepartmentMutation();
    const [updateSubdepartment] = useUpdateSubdepartmentMutation();
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const subdepartments = subdepartmentsData?.data || [];

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
                {/* Top bar - ITEG title + Create button */}
                <div className="flex items-end justify-between py-5">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">ITEG</h1>
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
                                        <InputField label="Department ID" name="departmentId" placeholder="Enter department ID" />
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Allowed Courses</label>
                                            {values.allowedCourses.map((course, index) => (
                                                <div key={index} className="flex gap-2 mb-2">
                                                    <input
                                                        value={course}
                                                        onChange={(e) => {
                                                            const c = [...values.allowedCourses];
                                                            c[index] = e.target.value;
                                                            setFieldValue('allowedCourses', c);
                                                        }}
                                                        placeholder="Course name"
                                                        className="flex-1 border rounded px-3 py-2"
                                                    />
                                                    <button type="button" onClick={() => setFieldValue('allowedCourses', values.allowedCourses.filter((_, i) => i !== index))} className="px-3 py-2 bg-red-500 text-white rounded">✕</button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => setFieldValue('allowedCourses', [...values.allowedCourses, ''])} className="text-sm text-orange-500 hover:text-orange-600">+ Add Course</button>
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

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSubdepartments.length === 0 ? (
                        <div className="col-span-full text-center py-16">
                            <MdAccountTree size={48} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">No subdepartments found</p>
                        </div>
                    ) : (
                        filteredSubdepartments.map((subdept) => (
                            <CommonCard
                                key={subdept._id}
                                variant="card1"
                                icon={MdAccountTree}
                                title={subdept.name}
                                status={subdept.isActive}
                                infoItems={[
                                    { icon: '👥', value: subdept.totalStudents || 0, label: 'Students' },
                                    { icon: '#', value: `Dept Code: ${subdept.code || subdept.departmentId?.code || 'N/A'}` },
                                    { icon: '🎓', value: subdept.allowedCourses?.length || 0, label: 'Levels' },
                                ]}
                                onView={() => navigate('/subdepartment-details', {
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
                                    >
                                        {({ values, setFieldValue, isSubmitting, submitForm, resetForm }) => (
                                            <OrangeButton
                                                buttonTitle="Edit"
                                                panelTitle="Edit Subdepartment"
                                                customButtonClass="w-full py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition bg-white"
                                                drawerContent={
                                                    <Form className="space-y-4">
                                                        <InputField label="Subdepartment Name" name="name" placeholder="Enter subdepartment name" />
                                                        <InputField label="Department ID" name="departmentId" placeholder="Enter department ID" disabled={true} />
                                                        <div>
                                                            <label className="block text-sm font-medium mb-2">Allowed Courses</label>
                                                            {values.allowedCourses.map((course, index) => (
                                                                <div key={index} className="flex gap-2 mb-2">
                                                                    <input
                                                                        value={course}
                                                                        onChange={(e) => {
                                                                            const c = [...values.allowedCourses];
                                                                            c[index] = e.target.value;
                                                                            setFieldValue('allowedCourses', c);
                                                                        }}
                                                                        placeholder="Course name"
                                                                        className="flex-1 border rounded px-3 py-2"
                                                                    />
                                                                    <button type="button" onClick={() => setFieldValue('allowedCourses', values.allowedCourses.filter((_, i) => i !== index))} className="px-3 py-2 bg-red-500 text-white rounded">✕</button>
                                                                </div>
                                                            ))}
                                                            <button type="button" onClick={() => setFieldValue('allowedCourses', [...values.allowedCourses, ''])} className="text-sm text-orange-500 hover:text-orange-600">+ Add Course</button>
                                                        </div>
                                                        <RadioGroup label="Status" name="isActive" required={false} />
                                                    </Form>
                                                }
                                                leftBtnText="Cancel"
                                                rightBtnText={isSubmitting ? 'Updating...' : 'Update'}
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
