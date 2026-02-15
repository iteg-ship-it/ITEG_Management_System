import { useState } from "react";
import { MdBusiness, MdAdd, MdEdit, MdDelete } from "react-icons/md";
import AddDepartmentModal from "./AddDepartmentModal";
import PageNavbar from "../../common-components/navbar/PageNavbar";
import CommonTable from "../../common-components/table/CommonTable";
import Pagination from "../../common-components/pagination/Pagination";
import { buttonStyles } from "../../../styles/buttonStyles";
import { useGetAllDepartmentsQuery, useDeleteDepartmentMutation } from "../../../redux/api/authApi";
import Loader from "../../common-components/loader/Loader";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const DepartmentManagement = () => {
  const navigate = useNavigate();
  const { data: departmentsData, isLoading, refetch } = useGetAllDepartmentsQuery();
  const [deleteDepartment] = useDeleteDepartmentMutation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);

  const departments = departmentsData?.data || [];

  const handleAddDepartment = () => {
    refetch();
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingDepartment(null);
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

  const getFilteredData = () => {
    return departments.filter((dept) => {
      const searchMatch =
        searchTerm.trim() === "" ||
        dept.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.departmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.headOfDepartment?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return searchMatch;
    });
  };

  const columns = [
    {
      key: "department",
      label: "Department",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FDA92D20] rounded-lg flex items-center justify-center">
            <MdBusiness className="text-[#FDA92D]" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">{row.departmentName}</span>
            <span className="text-xs text-gray-500">{row.departmentCode}</span>
          </div>
        </div>
      ),
    },
    {
      key: "headOfDepartment",
      label: "Head of Department",
      render: (row) => row.headOfDepartment || "Not assigned",
    },
    {
      key: "description",
      label: "Description",
      render: (row) => (
        <div className="max-w-xs">
          <span className="text-sm text-gray-600 truncate block">
            {row.description || "No description"}
          </span>
        </div>
      ),
    },
    {
      key: "studentCount",
      label: "Students",
      align: "center",
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {row.studentCount}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created Date",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Department"
          >
            <MdEdit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row._id);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Department"
          >
            <MdDelete size={16} />
          </button>
        </div>
      ),
    },
  ];

  const handleRowClick = (department) => {
    navigate(`/department-details/${department._id}`, { state: { department } });
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <PageNavbar
        title="Department Management"
        subtitle="Manage your organization departments and their details"
        showBackButton={false}
      />
      <div className="mt-1 border bg-[var(--backgroundColor)] shadow-sm rounded-lg">
        {/* Header Section */}
        <div className="border-b border-gray-200 px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FDA92D] to-[#FDB84D] rounded-xl flex items-center justify-center shadow-md">
                <MdBusiness className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">All Departments</h2>
                <p className="text-sm text-gray-500 mt-0.5">{departments.length} departments registered</p>
              </div>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#FDA92D] to-[#FDB84D] text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
            >
              <MdAdd size={20} />
              Add Department
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="px-6 py-4">
          <Pagination
            rowsPerPage={rowsPerPage}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filtersConfig={[]}
            filteredData={getFilteredData()}
            selectedRows={selectedRows}
            allData={departments}
            sectionName="departments"
          />
        </div>

        {/* Table */}
        <CommonTable
          columns={columns}
          data={getFilteredData()}
          editable={true}
          pagination={true}
          rowsPerPage={rowsPerPage}
          searchTerm={searchTerm}
          onSelectionChange={setSelectedRows}
          onRowClick={handleRowClick}
        />

        {/* Add/Edit Department Modal */}
        <AddDepartmentModal
          isOpen={isAddModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleAddDepartment}
          editData={editingDepartment}
        />
      </div>
    </>
  );
};

export default DepartmentManagement;