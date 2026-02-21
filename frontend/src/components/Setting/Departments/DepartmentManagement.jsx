<<<<<<< HEAD
import { useState, useEffect } from "react";
=======
import { useState } from "react";
>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7
import { MdBusiness, MdAdd, MdEdit, MdDelete } from "react-icons/md";
import AddDepartmentModal from "./AddDepartmentModal";
import PageNavbar from "../../common-components/navbar/PageNavbar";
import CommonTable from "../../common-components/table/CommonTable";
import Pagination from "../../common-components/pagination/Pagination";
<<<<<<< HEAD
import { buttonStyles } from "../../../styles/buttonStyles";
<<<<<<< HEAD:frontend/src/components/common-components/Setting/DepartmentManagement.jsx
import { useGetAllDepartmentsQuery } from "../../../redux/api/authApi";
import { toast } from "react-toastify";
=======
=======
>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7
import { useGetAllDepartmentsQuery, useDeleteDepartmentMutation } from "../../../redux/api/authApi";
import Loader from "../../common-components/loader/Loader";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
>>>>>>> b051ea7966eb15b2629550aa3f4c0f448678e164:frontend/src/components/Setting/Departments/DepartmentManagement.jsx
=======
>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7

const DepartmentManagement = () => {
  const navigate = useNavigate();
  const { data: departmentsData, isLoading, refetch } = useGetAllDepartmentsQuery();
  const [deleteDepartment] = useDeleteDepartmentMutation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);
<<<<<<< HEAD
<<<<<<< HEAD:frontend/src/components/common-components/Setting/DepartmentManagement.jsx
  
  const { data, isLoading, error, refetch } = useGetAllDepartmentsQuery();
  const departments = data?.data || [];

  useEffect(() => {
    if (error) {
      toast.error("Failed to load departments");
    }
  }, [error]);

  const handleAddDepartment = () => {
    refetch();
=======
=======
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7

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
<<<<<<< HEAD
>>>>>>> b051ea7966eb15b2629550aa3f4c0f448678e164:frontend/src/components/Setting/Departments/DepartmentManagement.jsx
=======
>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7
  };

  const getFilteredData = () => {
    return departments.filter((dept) => {
      const searchMatch =
        searchTerm.trim() === "" ||
        dept.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.departmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.headOfDepartment?.toLowerCase().includes(searchTerm.toLowerCase());
      
<<<<<<< HEAD
      return searchMatch;
=======
      const statusMatch = selectedStatus.length === 0 || selectedStatus.includes(dept.status ? "Active" : "Inactive");
      const departmentMatch = selectedDepartments.length === 0 || selectedDepartments.includes(dept.departmentName);
      
      return searchMatch && statusMatch && departmentMatch;
>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7
    });
  };

  const columns = [
<<<<<<< HEAD
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
=======
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


  // const columns = [
  //   {
  //     key: "department",
  //     label: "Department",
  //     render: (row) => (
  //       <div className="flex items-center gap-3">
  //         <div className="w-10 h-10 bg-[#FDA92D20] rounded-lg flex items-center justify-center">
  //           <MdBusiness className="text-[#FDA92D]" size={20} />
  //         </div>
  //         <div className="flex flex-col">
  //           <span className="font-medium text-gray-800">{row.departmentName}</span>
  //           <span className="text-xs text-gray-500">{row.departmentCode}</span>
  //         </div>
  //       </div>
  //     ),
  //   },
  //   {
  //     key: "headOfDepartment",
  //     label: "Head of Department",
  //     render: (row) => row.headOfDepartment || "Not assigned",
  //   },
  //   {
  //     key: "status",
  //     label: "Status",
  //     align: "center",
  //     render: (row) => (
  //       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
  //         row.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  //       }`}>
  //         {row.status ? "Active" : "Inactive"}
  //       </span>
  //     ),
  //   },
  //   {
  //     key: "description",
  //     label: "Description",
  //     render: (row) => (
  //       <div className="max-w-xs">
  //         <span className="text-sm text-gray-600 truncate block">
  //           {row.description || "No description"}
  //         </span>
  //       </div>
  //     ),
  //   },
  //   {
  //     key: "studentCount",
  //     label: "Students",
  //     align: "center",
  //     render: (row) => (
  //       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
  //         {row.studentCount}
  //       </span>
  //     ),
  //   },
  //   {
  //     key: "createdAt",
  //     label: "Created Date",
  //     render: (row) => new Date(row.createdAt).toLocaleDateString(),
  //   },
  //   {
  //     key: "actions",
  //     label: "Actions",
  //     render: (row) => (
  //       <div className="flex gap-2">
  //         <button
  //           onClick={(e) => {
  //             e.stopPropagation();
  //             handleEdit(row);
  //           }}
  //           className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
  //           title="Edit Department"
  //         >
  //           <MdEdit size={16} />
  //         </button>
  //         <button
  //           onClick={(e) => {
  //             e.stopPropagation();
  //             handleDelete(row._id);
  //           }}
  //           className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
  //           title="Delete Department"
  //         >
  //           <MdDelete size={16} />
  //         </button>
  //       </div>
  //     ),
  //   },
  // ];
>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7

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
<<<<<<< HEAD
      <div className="mt-1 border bg-[var(--backgroundColor)] shadow-sm rounded-lg">
<<<<<<< HEAD:frontend/src/components/common-components/Setting/DepartmentManagement.jsx
        <div className="px-6">
          {/* Header with Add Button */}
          <div className="flex justify-between items-center py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">All Departments</h2>
              <p className="text-sm text-gray-600">
                {isLoading ? "Loading..." : `${departments.length} departments found`}
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className={`flex items-center gap-2 ${buttonStyles.primary}`}
              disabled={isLoading}
=======
        {/* Header Section */}
        <div className="border-b border-gray-200 px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
=======
      <div className="mt-1 ">
        {/* Header Section */}
        <div className="border-b border-gray-200">
          <div className="flex justify-between items-center bg-white py-5 px-3 border rounded">
            <div className="flex items-center gap-4 ">
>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7
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
<<<<<<< HEAD
>>>>>>> b051ea7966eb15b2629550aa3f4c0f448678e164:frontend/src/components/Setting/Departments/DepartmentManagement.jsx
=======
>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7
            >
              <MdAdd size={20} />
              Add Department
            </button>
          </div>
        </div>

<<<<<<< HEAD
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
=======
>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7

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