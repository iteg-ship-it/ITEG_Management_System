import { useState } from 'react';
import PageNavbar from '../../common-components/navbar/PageNavbar';
import { useGetAllSubdepartmentsQuery, useDeleteSubdepartmentMutation } from '../../../redux/api/authApi';
import Loader from '../../common-components/loader/Loader';
import { MdEdit, MdDelete } from 'react-icons/md';
import { toast } from 'react-toastify';
import AddSubdepartmentModal from './AddSubdepartmentModal';
import { useNavigate } from 'react-router-dom';
import CommonTable from '../../common-components/table/CommonTable';
import Pagination from '../../common-components/pagination/Pagination';

const SubDepartment = () => {
    const { data: subdepartmentsData, isLoading, refetch } = useGetAllSubdepartmentsQuery();
    const [deleteSubdepartment] = useDeleteSubdepartmentMutation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubdept, setEditingSubdept] = useState(null);
    const [selectedDeptId, setSelectedDeptId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [rowsPerPage] = useState(10);
    const [selectedRows, setSelectedRows] = useState([]);
    const navigate = useNavigate();

    const subdepartments = subdepartmentsData?.data || [];

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

    const handleEdit = (subdept) => {
        setSelectedDeptId(subdept.departmentId?._id || subdept.departmentId);
        setEditingSubdept(subdept);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSubdept(null);
        setSelectedDeptId(null);
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
                    </div>
                </div>
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
                                onClick={() => handleEdit(row)}
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

            <AddSubdepartmentModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={refetch}
                departmentId={selectedDeptId}
                editData={editingSubdept}
            />
        </>
    );
};

export default SubDepartment;