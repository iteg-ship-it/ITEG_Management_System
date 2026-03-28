import { useState, useEffect } from "react";
import { MdAccountTree, MdLayers, MdAdd, MdEdit, MdDelete, MdBusiness, MdExpandMore, MdExpandLess } from "react-icons/md";
import PageNavbar from "../../common-components/navbar/PageNavbar";
import Header from "../../common-components/sidebar/Header";
import { useLocation, useNavigate } from "react-router-dom";
import { useDeleteLevelMutation, useDeleteSubLevelMutation, useGetSubdepartmentByIdQuery, useGetLevelsBySubdepartmentQuery, useAddLevelMutation, useUpdateLevelMutation, useAddSubLevelMutation, useUpdateSubLevelMutation, useGetSubLevelsByLevelQuery } from "../../../redux/api/authApi";
import { toast } from "react-toastify";
import OrangeButton from "../../common-components/sidebar/OrangeButton";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "../../common-components/common-feild/InputField";
import RadioGroup from "../../common-components/common-feild/RadioGroup";

const SubdepartmentDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const subdepartmentId = location.state?.subdepartment?._id;
  const { data: subdepartmentData } = useGetSubdepartmentByIdQuery(subdepartmentId, {
    skip: !subdepartmentId
  });
  const { data: levelsData, refetch } = useGetLevelsBySubdepartmentQuery(subdepartmentId, {
    skip: !subdepartmentId
  });
  const [deleteLevel] = useDeleteLevelMutation();
  const [deleteSubLevel] = useDeleteSubLevelMutation();
  const [addLevel] = useAddLevelMutation();
  const [updateLevel] = useUpdateLevelMutation();
  const [addSubLevel] = useAddSubLevelMutation();
  const [updateSubLevel] = useUpdateSubLevelMutation();
  const [editingLevel, setEditingLevel] = useState(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isSubLevelDrawerOpen, setIsSubLevelDrawerOpen] = useState(false);
  const [editingSubLevel, setEditingSubLevel] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [expandedLevels, setExpandedLevels] = useState({});
  const [levelSubLevels, setLevelSubLevels] = useState({});

  const subdepartment = subdepartmentData?.data || location.state?.subdepartment;
  const departmentId = location.state?.departmentId || subdepartment?.departmentId?._id;
  const departmentName = location.state?.departmentName || subdepartment?.departmentId?.name;
  const levels = levelsData?.data || [];

  // Fetch sublevels for each level
  const SubLevelFetcher = ({ levelId }) => {
    const { data: subLevelsData } = useGetSubLevelsByLevelQuery(levelId, {
      skip: !levelId
    });
    
    useEffect(() => {
      if (subLevelsData?.data) {
        setLevelSubLevels(prev => {
          if (prev[levelId]) return prev;
          return { ...prev, [levelId]: subLevelsData.data };
        });
      }
    }, [subLevelsData, levelId]);
    
    return null;
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Level name is required"),
    order: Yup.number().required("Order is required").positive("Must be positive"),
    isActive: Yup.boolean()
  });

  const handleLevelSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = {
        name: values.name,
        order: Number(values.order),
        subDepartmentId: subdepartmentId,
        isActive: values.isActive
      };

      if (editingLevel) {
        await updateLevel({ levelId: editingLevel._id, ...payload }).unwrap();
        toast.success("Level updated successfully!");
      } else {
        await addLevel(payload).unwrap();
        toast.success("Level added successfully!");
      }
      resetForm();
      setEditingLevel(null);
      setIsEditDrawerOpen(false);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Error saving level");
    } finally {
      setSubmitting(false);
    }
  };

  const subLevelValidationSchema = Yup.object({
    name: Yup.string().required("SubLevel name is required"),
    order: Yup.number().required("Order is required").positive("Must be positive"),
    isActive: Yup.boolean()
  });

  const handleSubLevelSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = {
        name: values.name,
        order: Number(values.order),
        levelId: selectedLevel?._id,
        isActive: values.isActive
      };

      if (editingSubLevel) {
        await updateSubLevel({ subLevelId: editingSubLevel._id, ...payload }).unwrap();
        toast.success("SubLevel updated successfully!");
      } else {
        await addSubLevel(payload).unwrap();
        toast.success("SubLevel added successfully!");
      }
      resetForm();
      setEditingSubLevel(null);
      setSelectedLevel(null);
      setIsSubLevelDrawerOpen(false);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Error saving sublevel");
    } finally {
      setSubmitting(false);
    }
  };

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
    setIsEditDrawerOpen(true);
  };

  const handleAddSubLevel = (level) => {
    setSelectedLevel(level);
    setEditingSubLevel(null);
    setIsSubLevelDrawerOpen(true);
  };

  const handleEditSubLevel = (level, sublevel) => {
    setSelectedLevel(level);
    setEditingSubLevel(sublevel);
    setIsSubLevelDrawerOpen(true);
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
      <Header title={subdepartment.name} showBack={true} breadcrumbs={[
        { label: 'Department', path: '/department-management' },
        { label: departmentName, path: -1 },
        { label: subdepartment.name }
      ]} />
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
              <Formik
                initialValues={{
                  name: "",
                  order: "",
                  isActive: true
                }}
                validationSchema={validationSchema}
                onSubmit={handleLevelSubmit}
              >
                {({ values, setFieldValue, isSubmitting, submitForm, resetForm }) => (
                  <OrangeButton
                    buttonTitle="Add Level"
                    panelTitle="Add New Level"
                    drawerContent={
                      <Form className="space-y-4">
                        <InputField label="Level Name" name="name" placeholder="Enter level name" />
                        <InputField label="Order" name="order" type="number" placeholder="Enter order number" />
                        <RadioGroup label="Status" name="isActive" required={false} />
                      </Form>
                    }
                    leftBtnText="Cancel"
                    rightBtnText={isSubmitting ? "Adding..." : "Add Level"}
                    onLeftClick={resetForm}
                    onRightClick={submitForm}
                  />
                )}
              </Formik>
            </div>
          </div>

          {levels.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <MdLayers size={48} className="mx-auto mb-4 opacity-30" />
              <p>No levels added yet</p>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {levels.map((level) => {
                const subLevels = levelSubLevels[level._id] || [];
                return (
                <div 
                  key={level._id} 
                  className={`border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer ${
                    level.isActive ? "bg-gradient-to-br from-green-50 to-white" : "bg-gray-200"
                  }`}
                  onClick={() => navigate("/show-sublevel-tables", { state: { level, subdepartment, departmentId, departmentName } })}
                >
                  <SubLevelFetcher levelId={level._id} />
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                      <MdLayers size={24} className="text-white" />
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      level.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {level.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{level.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">SubLevels: {subLevels.length}</p>
                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSubLevel(level);
                      }}
                      className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <MdAdd size={16} /> SubLevel
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(level);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <MdEdit size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(level._id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <MdDelete size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLevel(level._id);
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      {expandedLevels[level._id] ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
                    </button>
                  </div>

                  {/* SubLevels Dropdown */}
                  {expandedLevels[level._id] && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {subLevels.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 py-4">No sublevels added yet</p>
                      ) : (
                        <div className="space-y-2">
                          {subLevels.map((sublevel) => (
                            <div key={sublevel._id} className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                              <div>
                                <h4 className="font-semibold text-sm text-gray-800">{sublevel.name}</h4>
                                <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${
                                  sublevel.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}>
                                  {sublevel.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditSubLevel(level, sublevel);
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                  <MdEdit size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSubLevel(sublevel._id);
                                  }}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <MdDelete size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )})}
            </div>
          )}
        </div>

      {/* Edit Level Drawer */}
      {isEditDrawerOpen && editingLevel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div onClick={() => { setIsEditDrawerOpen(false); setEditingLevel(null); }} className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-md h-full bg-white shadow-xl flex flex-col">
            <div className="flex items-start justify-between px-6 py-5 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Edit Level</h2>
                <p className="text-sm text-gray-500 mt-1">Update level details</p>
              </div>
              <button onClick={() => { setIsEditDrawerOpen(false); setEditingLevel(null); }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <Formik
                initialValues={{
                  name: editingLevel?.name || "",
                  order: editingLevel?.order || "",
                  isActive: editingLevel?.isActive !== undefined ? editingLevel.isActive : true
                }}
                validationSchema={validationSchema}
                onSubmit={handleLevelSubmit}
              >
                {({ values, setFieldValue, isSubmitting, submitForm }) => (
                  <Form className="space-y-4">
                    <InputField label="Level Name" name="name" placeholder="Enter level name" />
                    <InputField label="Order" name="order" type="number" placeholder="Enter order number" />
                    <RadioGroup label="Status" name="isActive" required={false} />
                    <div className="flex gap-4 pt-4">
                      <button type="button" onClick={() => { setIsEditDrawerOpen(false); setEditingLevel(null); }} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition">Cancel</button>
                      <button type="button" onClick={submitForm} disabled={isSubmitting} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FDA92D] to-[#FDB84D] text-white font-semibold">{isSubmitting ? "Updating..." : "Update"}</button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}

      {/* SubLevel Drawer */}
      {isSubLevelDrawerOpen && selectedLevel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div onClick={() => { setIsSubLevelDrawerOpen(false); setEditingSubLevel(null); setSelectedLevel(null); }} className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-md h-full bg-white shadow-xl flex flex-col">
            <div className="flex items-start justify-between px-6 py-5 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{editingSubLevel ? "Edit SubLevel" : "Add SubLevel"}</h2>
                <p className="text-sm text-gray-500 mt-1">{editingSubLevel ? "Update sublevel details" : "Add new sublevel to " + selectedLevel.name}</p>
              </div>
              <button onClick={() => { setIsSubLevelDrawerOpen(false); setEditingSubLevel(null); setSelectedLevel(null); }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <Formik
                initialValues={{
                  name: editingSubLevel?.name || "",
                  order: editingSubLevel?.order || "",
                  isActive: editingSubLevel?.isActive !== undefined ? editingSubLevel.isActive : true
                }}
                validationSchema={subLevelValidationSchema}
                onSubmit={handleSubLevelSubmit}
              >
                {({ values, setFieldValue, isSubmitting, submitForm }) => (
                  <Form className="space-y-4">
                    <InputField label="SubLevel Name" name="name" placeholder="Enter sublevel name" />
                    <InputField label="Order" name="order" type="number" placeholder="Enter order number" />
                    <RadioGroup label="Status" name="isActive" required={false} />
                    <div className="flex gap-4 pt-4">
                      <button type="button" onClick={() => { setIsSubLevelDrawerOpen(false); setEditingSubLevel(null); setSelectedLevel(null); }} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition">Cancel</button>
                      <button type="button" onClick={submitForm} disabled={isSubmitting} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FDA92D] to-[#FDB84D] text-white font-semibold">{isSubmitting ? (editingSubLevel ? "Updating..." : "Adding...") : (editingSubLevel ? "Update" : "Add")}</button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubdepartmentDetails;
