import { useState } from "react";
import { MdBusiness, MdPerson, MdDescription, MdCode, MdCalendarToday, MdAdd, MdEdit, MdDelete, MdAccountTree } from "react-icons/md";
import PageNavbar from "../../common-components/navbar/PageNavbar";
import { useNavigate, useLocation } from "react-router-dom";
import { useDeleteSubdepartmentMutation, useGetAllDepartmentsQuery } from "../../../redux/api/authApi";
import { toast } from "react-toastify";
import AddSubdepartmentModal from "./AddSubdepartmentModal";

import CommonTable from "../../common-components/table/CommonTable";

const DepartmentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const departmentIdFromState = location.state?.department?._id;
  const { data: departmentsData, refetch } = useGetAllDepartmentsQuery();
  const [deleteSubdepartment] = useDeleteSubdepartmentMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubdept, setEditingSubdept] = useState(null);

  // Get fresh department data from query
  const department = departmentsData?.data?.find(d => d._id === departmentIdFromState) || location.state?.department;
  const subdepartments = department?.subdepartments || [];

  const handleDelete = async (subdeptId) => {
    if (window.confirm("Are you sure you want to delete this subdepartment?")) {
      try {
        await deleteSubdepartment({ departmentId: department._id, subdepartmentId: subdeptId }).unwrap();
        toast.success("Subdepartment deleted successfully!");
        refetch();
      } catch (error) {
        toast.error(error?.data?.message || "Error deleting subdepartment");
      }
    }
  };

  const handleEdit = (subdept) => {
    setEditingSubdept(subdept);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubdept(null);
  };

  const handleSuccess = () => {
    refetch();
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
                <h1 className="text-2xl font-bold text-gray-900">{department.departmentName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">{department.departmentCode}</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className={`inline-block px-3 py-1 text-xs rounded-full ${
                    department.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {department.status ? "Active" : "Inactive"}
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
                  <p className="text-sm font-bold text-purple-900">{department.departmentCode}</p>
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
                    {new Date(department.createdAt).toLocaleDateString()}
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
                  <p className="text-xs text-orange-600 font-medium mb-1">Total Students</p>
                  <p className="text-sm font-bold text-orange-900">{department.studentCount || 0}</p>
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
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium text-sm"
              >
                <MdAdd size={18} />
                Add Subdepartment
              </button>
            </div>
          </div>

          <CommonTable
            columns={[
              { key: 'subdepartmentName', label: 'Subdepartment Name' },
              { 
                key: 'status', 
                label: 'Status',
                render: (row) => (
                  <span className={`inline-block px-3 py-1 text-xs rounded-full ${
                    row.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {row.status}
                  </span>
                )
              },
              { key: 'description', label: 'Description' },
            ]}
            data={subdepartments}
            editable={true}
            pagination={true}
            actionButton={(row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(row)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <MdEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(row._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <MdDelete size={18} />
                </button>
              </div>
            )}
            onRowClick={(row) => navigate('/subdepartment-details', { 
              state: { departmentId: department._id, subdepartment: row, departmentName: department.departmentName } 
            })}
          />
        </div>
      
      <AddSubdepartmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        departmentId={department?._id}
        editData={editingSubdept}
      />
    </>
  );
};

export default DepartmentDetails;
