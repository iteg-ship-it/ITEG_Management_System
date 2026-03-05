import { useState } from "react";
import { MdAccountTree, MdLayers, MdAdd, MdEdit, MdDelete, MdBusiness, MdExpandMore, MdExpandLess } from "react-icons/md";
import PageNavbar from "../../common-components/navbar/PageNavbar";
import { useLocation, useParams } from "react-router-dom";
import { useDeleteLevelMutation, useDeleteSubLevelMutation, useGetSubdepartmentByIdQuery, useGetLevelsBySubdepartmentQuery, useGetSubLevelsByLevelQuery } from "../../../redux/api/authApi";
import { toast } from "react-toastify";
import AddLevelModal from "../Levels/AddLevelModal";
import AddSubLevelModal from "../Levels/AddSubLevelModal";

const SubdepartmentDetails = () => {
  const location = useLocation();
  const subdepartmentId = location.state?.subdepartment?._id;
  const { data: subdepartmentData } = useGetSubdepartmentByIdQuery(subdepartmentId, {
    skip: !subdepartmentId
  });
  const { data: levelsData, refetch } = useGetLevelsBySubdepartmentQuery(subdepartmentId, {
    skip: !subdepartmentId
  });
  const [deleteLevel] = useDeleteLevelMutation();
  const [deleteSubLevel] = useDeleteSubLevelMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [isSubLevelModalOpen, setIsSubLevelModalOpen] = useState(false);
  const [editingSubLevel, setEditingSubLevel] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [expandedLevels, setExpandedLevels] = useState({});

  const subdepartment = subdepartmentData?.data || location.state?.subdepartment;
  const departmentId = location.state?.departmentId || subdepartment?.departmentId?._id;
  const departmentName = location.state?.departmentName || subdepartment?.departmentId?.name;
  const levels = levelsData?.data || [];

  const handleDelete = async (levelId) => {
    if (window.confirm("Are you sure you want to delete this level?")) {
      try {
        await deleteLevel(levelId).unwrap();
        toast.success("Level deleted successfully!");
        refetch();
      } catch (error) {
        toast.error(error?.data?.message || "Error deleting level");
      }
    }
  };

  const handleEdit = (level) => {
    setEditingLevel(level);
    setIsModalOpen(true);
  };

  const handleAddSubLevel = (level) => {
    setSelectedLevel(level);
    setIsSubLevelModalOpen(true);
  };

  const handleEditSubLevel = (level, sublevel) => {
    setSelectedLevel(level);
    setEditingSubLevel(sublevel);
    setIsSubLevelModalOpen(true);
  };

  const handleDeleteSubLevel = async (subLevelId) => {
    if (window.confirm("Are you sure you want to delete this sublevel?")) {
      try {
        await deleteSubLevel(subLevelId).unwrap();
        toast.success("SubLevel deleted successfully!");
        refetch();
      } catch (error) {
        toast.error(error?.data?.message || "Error deleting sublevel");
      }
    }
  };

  const toggleLevel = (levelId) => {
    setExpandedLevels(prev => ({ ...prev, [levelId]: !prev[levelId] }));
  };

  if (!subdepartment) {
    return <div className="p-6">No subdepartment data found</div>;
  }

  return (
    <>
      <PageNavbar
        title="Subdepartment Details"
        subtitle="View subdepartment information and manage levels"
        showBackButton={true}
      />
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Subdepartment Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <MdAccountTree size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{subdepartment.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-block px-3 py-1 text-xs rounded-full ${
                    subdepartment.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {subdepartment.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs text-gray-500">•</span>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <MdBusiness size={14} />
                    <span>{departmentName || "Unknown Department"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {subdepartment.description && (
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MdAccountTree size={20} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium mb-1">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{subdepartment.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Levels Section */}
          <div className="border-b border-gray-200 px-6 py-5 bg-white">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                  <MdLayers size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Levels</h2>
                  <p className="text-xs text-gray-500">{levels.length} levels registered</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium text-sm"
              >
                <MdAdd size={18} />
                Add Level
              </button>
            </div>
          </div>

          {levels.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <MdLayers size={48} className="mx-auto mb-4 opacity-30" />
              <p>No levels added yet</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {levels.map((level) => (
                <div key={level._id} className="border rounded-xl overflow-hidden bg-white shadow-sm">
                  {/* Level Header */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <MdLayers size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg text-gray-800">{level.levelName}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              level.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                              {level.status}
                            </span>
                            {level.duration && (
                              <span className="text-xs text-gray-600">• Duration: {level.duration}</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {level.subLevels?.length || 0} SubLevels
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddSubLevel(level)}
                          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs flex items-center gap-1"
                        >
                          <MdAdd size={16} /> SubLevel
                        </button>
                        <button
                          onClick={() => handleEdit(level)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(level._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <MdDelete size={18} />
                        </button>
                        <button
                          onClick={() => toggleLevel(level._id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          {expandedLevels[level._id] ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SubLevels */}
                  {expandedLevels[level._id] && (
                    <div className="p-4">
                      {!level.subLevels || level.subLevels.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <p className="text-sm">No sublevels added yet</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {level.subLevels.map((sublevel) => (
                            <div key={sublevel._id} className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800">{sublevel.subLevelName}</h4>
                                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${
                                    sublevel.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                  }`}>
                                    {sublevel.status}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleEditSubLevel(level, sublevel)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                  >
                                    <MdEdit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSubLevel(sublevel._id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <MdDelete size={16} />
                                  </button>
                                </div>
                              </div>
                              {sublevel.description && (
                                <p className="text-xs text-gray-600 mt-2">{sublevel.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      <AddLevelModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingLevel(null); }}
        onSuccess={refetch}
        subdepartmentId={subdepartment._id}
        editData={editingLevel}
      />

      <AddSubLevelModal
        isOpen={isSubLevelModalOpen}
        onClose={() => { setIsSubLevelModalOpen(false); setEditingSubLevel(null); setSelectedLevel(null); }}
        onSuccess={refetch}
        levelId={selectedLevel?._id}
        editData={editingSubLevel}
      />
    </>
  );
};

export default SubdepartmentDetails;
