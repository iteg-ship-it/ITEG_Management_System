import { useState } from "react";
import { MdBusiness, MdAdd, MdDelete } from "react-icons/md";
import AddDepartmentModal from "./AddDepartmentModal";
import PageNavbar from "../../common-components/navbar/PageNavbar";
import CommonTable from "../../common-components/table/CommonTable";
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
  const [searchTerm] = useState("");
  const [rowsPerPage] = useState(10);
  const [selectedStatus] = useState([]);
  const [selectedDepartments] = useState([]);

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
      
      const statusMatch = selectedStatus.length === 0 || selectedStatus.includes(dept.status ? "Active" : "Inactive");
      const departmentMatch = selectedDepartments.length === 0 || selectedDepartments.includes(dept.departmentName);
      
      return searchMatch && statusMatch && departmentMatch;
    });
  };

  const columns = [
  {
    key: "department",
    label: "Department",
    render: (row) => (
      <div className="flex items-center gap-3">
        
        {/* icon card */}
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
          <MdBusiness className="text-orange-500" size={18} />
        </div>

        {/* name + code */}
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-gray-800">
            {row.departmentName}
          </span>
          <span className="text-xs text-gray-400">
            {row.departmentCode}
          </span>
        </div>
      </div>
    ),
  },

  {
    key: "headOfDepartment",
    label: "Head of Department",
    render: (row) => (
      <span className="text-gray-700 font-medium">
        {row.headOfDepartment || "—"}
      </span>
    ),
  },

 

  {
    key: "description",
    label: "Description",
    render: (row) => (
      <div className="max-w-xs text-gray-600 text-sm">
        {row.description || "No description"}
      </div>
    ),
  },

  {
    key: "studentCount",
    label: "Students",
    align: "center",
    render: (row) => (
      <span className="px-3 py-1 rounded-md bg-blue-50 text-blue-600 text-sm font-medium">
        {row.studentCount}
      </span>
    ),
  },

   {
    key: "status",
    label: "Status",
    align: "center",
    render: (row) => {
      const active = row.status;

      return (
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
          ${active
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-600"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              active ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {active ? "Active" : "Inactive"}
        </span>
      );
    },
  },

  {
    key: "actions",
    label: "Action",
    render: (row) => (
      <div className="flex items-center gap-2">
        
        {/* EDIT */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(row);
          }}
          className="text-orange-600 font-medium hover:underline"
        >
          Edit
        </button>

        {/* optional delete icon minimal */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(row._id);
          }}
          className="text-red-500 hover:text-red-600"
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

      <div className="mt-1">
        <div className="border-b border-gray-200">
          <div className="flex justify-between items-center bg-white py-5 px-3 border rounded">
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

        <CommonTable
          columns={columns}
          data={getFilteredData()}
          editable={true}
          pagination={true}
          rowsPerPage={rowsPerPage}
          searchTerm={searchTerm}
          onRowClick={handleRowClick}
        />

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