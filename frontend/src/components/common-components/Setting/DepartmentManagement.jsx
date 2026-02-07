import { useState } from "react";
import { MdBusiness, MdAdd, MdEdit, MdDelete } from "react-icons/md";
import AddDepartmentModal from "/AddDepartmentModal";
import PageNavbar from "../navbar/PageNavbar";
import CommonTable from "../table/CommonTable";
import Pagination from "../pagination/Pagination";
import { buttonStyles } from "../../../styles/buttonStyles";

const DepartmentManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);
  const [departments, setDepartments] = useState([
    // {
    //   id: 1,
    //   departmentName: "Computer Science",
    //   departmentCode: "CS",
    //   headOfDepartment: "Dr. John Smith",
    //   description: "Software Development & Programming",
    //   studentCount: 45,
    //   createdAt: "2024-01-15"
    // },
    // {
    //   id: 2,
    //   departmentName: "Information Technology",
    //   departmentCode: "IT",
    //   headOfDepartment: "Dr. Sarah Johnson",
    //   description: "IT Infrastructure & Systems",
    //   studentCount: 38,
    //   createdAt: "2024-01-20"
    // },
    // {
    //   id: 3,
    //   departmentName: "Mechanical Engineering",
    //   departmentCode: "ME",
    //   headOfDepartment: "Dr. Mike Wilson",
    //   description: "Mechanical Systems & Design",
    //   studentCount: 32,
    //   createdAt: "2024-02-01"
    // }
  ]);

  const handleAddDepartment = (newDepartment) => {
    const department = {
      id: departments.length + 1,
      ...newDepartment,
      studentCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setDepartments(prev => [...prev, department]);
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
              // Handle edit
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Department"
          >
            <MdEdit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle delete
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
    console.log("Department clicked:", department);
    // Navigate to department details or handle row click
  };

  return (
    <>
      <PageNavbar
        title="Department Management"
        subtitle="Manage your organization departments and their details"
        showBackButton={false}
      />
      <div className="mt-1 border bg-[var(--backgroundColor)] shadow-sm rounded-lg">
        <div className="px-6">
          {/* Header with Add Button */}
          <div className="flex justify-between items-center py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">All Departments</h2>
              <p className="text-sm text-gray-600">Manage and organize your departments</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className={`flex items-center gap-2 ${buttonStyles.primary}`}
            >
              <MdAdd size={20} />
              Add Department
            </button>
          </div>

          {/* Filters + Search */}
          <div className="flex justify-between items-center flex-wrap gap-4 pb-4">
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

        {/* Add Department Modal */}
        <AddDepartmentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleAddDepartment}
        />
      </div>
    </>
  );
};

export default DepartmentManagement;