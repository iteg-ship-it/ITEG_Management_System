import { useState } from "react";
import { MdLayers, MdAdd, MdEdit, MdDelete } from "react-icons/md";
import { IoNotificationsOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import OrangeButton from "../../common-components/sidebar/OrangeButton";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "../../common-components/common-feild/InputField";
import RadioGroup from "../../common-components/common-feild/RadioGroup";
import PageNavbar from "../../common-components/navbar/PageNavbar";
import Header from "../../common-components/sidebar/Header";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDeleteLevelMutation, useDeleteSubLevelMutation, useGetSubdepartmentByIdQuery, useGetLevelsBySubdepartmentQuery, useAddLevelMutation, useUpdateLevelMutation, useAddSubLevelMutation, useUpdateSubLevelMutation, useGetSubLevelsByLevelQuery } from "../../../redux/api/authApi";

/* ─── LevelCard (unchanged logic) ───────────────────────────── */
const LevelCard = ({ level, subdepartmentId, onAddSubLevel, onEditSubLevel, onDeleteSubLevel, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const { data: subLevelsData, isLoading, refetch } = useGetSubLevelsByLevelQuery(level._id);
  const subLevels = subLevelsData?.data || [];

  return (
    <div
      onClick={() => navigate(`/subdepartment/${subdepartmentId}/level/${level._id}`, {
        state: { level }
      })}
      className={`border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 cursor-pointer ${
        level.isActive ? "bg-white" : "bg-gray-100 opacity-70"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <MdLayers size={20} className="text-orange-500" />
        </div>
        <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold ${
          level.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {level.isActive ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-sm text-gray-900">{level.name}</h3>
      </div>
      <p className="text-xs text-gray-400 mb-3">SubLevels: {subLevels.length}</p>

      {/* Inline SubLevels count only — click card to view details */}

      <div className="flex gap-2 pt-3 border-t border-gray-100" onClick={e => e.stopPropagation()}>
        <button onClick={() => onAddSubLevel(level)} className="flex-1 py-1.5 px-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition text-xs font-medium flex items-center justify-center gap-1">
          <MdAdd size={14} /> SubLevel
        </button>
        <button onClick={() => onEdit(level)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><MdEdit size={16} /></button>
        <button onClick={() => onDelete(level._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><MdDelete size={16} /></button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const SubdepartmentDetails = () => {
  const location = useLocation();
  const { id: paramId } = useParams();
  const subdepartmentId = paramId || location.state?.subdepartment?._id;

  const { data: subdepartmentData } = useGetSubdepartmentByIdQuery(subdepartmentId, { skip: !subdepartmentId });
  const { data: levelsData, refetch } = useGetLevelsBySubdepartmentQuery(subdepartmentId, { skip: !subdepartmentId });

  const [deleteLevel]    = useDeleteLevelMutation();
  const [deleteSubLevel] = useDeleteSubLevelMutation();
  const [addLevel]       = useAddLevelMutation();
  const [updateLevel]    = useUpdateLevelMutation();
  const [addSubLevel]    = useAddSubLevelMutation();
  const [updateSubLevel] = useUpdateSubLevelMutation();

  const [editingLevel,        setEditingLevel]        = useState(null);
  const [isEditDrawerOpen,    setIsEditDrawerOpen]    = useState(false);
  const [isSubLevelDrawerOpen,setIsSubLevelDrawerOpen]= useState(false);
  const [editingSubLevel,     setEditingSubLevel]     = useState(null);
  const [selectedLevel,       setSelectedLevel]       = useState(null);

  const subdepartment  = subdepartmentData?.data || location.state?.subdepartment;
  const departmentName = location.state?.departmentName || subdepartment?.departmentId?.name;
  const levels         = levelsData?.data || [];

  /* ── Validation schemas ── */
  const validationSchema = Yup.object({
    name:     Yup.string().required("Level name is required"),
    order:    Yup.number().required("Order is required").positive("Must be positive"),
    isActive: Yup.boolean(),
  });
  const subLevelValidationSchema = Yup.object({
    name:     Yup.string().required("SubLevel name is required"),
    order:    Yup.number().required("Order is required").positive("Must be positive"),
    isActive: Yup.boolean(),
  });

  /* ── Handlers (all unchanged) ── */
  const handleLevelSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = { name: values.name, order: Number(values.order), subDepartmentId: subdepartmentId, isActive: values.isActive };
      if (editingLevel) {
        await updateLevel({ levelId: editingLevel._id, ...payload }).unwrap();
        toast.success("Level updated successfully!");
      } else {
        await addLevel(payload).unwrap();
        toast.success("Level added successfully!");
      }
      resetForm(); setEditingLevel(null); setIsEditDrawerOpen(false); refetch();
    } catch (error) { toast.error(error?.data?.message || "Error saving level"); }
    finally { setSubmitting(false); }
  };

  const handleSubLevelSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = { name: values.name, order: Number(values.order), levelId: selectedLevel?._id, isActive: values.isActive };
      if (editingSubLevel) {
        await updateSubLevel({ subLevelId: editingSubLevel._id, ...payload }).unwrap();
        toast.success("SubLevel updated successfully!");
      } else {
        await addSubLevel(payload).unwrap();
        toast.success("SubLevel added successfully!");
      }
      resetForm(); setEditingSubLevel(null); setSelectedLevel(null); setIsSubLevelDrawerOpen(false); refetch();
    } catch (error) { toast.error(error?.data?.message || "Error saving sublevel"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (levelId) => {
    if (window.confirm("Are you sure you want to delete this level?")) {
      try { await deleteLevel(levelId).unwrap(); toast.success("Level deleted successfully!"); refetch(); }
      catch (error) { toast.error(error?.data?.message || "Error deleting level"); }
    }
  };

  const handleEdit         = (level)           => { setEditingLevel(level); setIsEditDrawerOpen(true); };
  const handleAddSubLevel  = (level)           => { setSelectedLevel(level); setEditingSubLevel(null); setIsSubLevelDrawerOpen(true); };
  const handleEditSubLevel = (level, sublevel) => { setSelectedLevel(level); setEditingSubLevel(sublevel); setIsSubLevelDrawerOpen(true); };

  const handleDeleteSubLevel = async (subLevelId, refetchSubLevels) => {
    if (window.confirm("Are you sure you want to delete this sublevel?")) {
      try { await deleteSubLevel(subLevelId).unwrap(); toast.success("SubLevel deleted successfully!"); refetchSubLevels?.(); }
      catch (error) { toast.error(error?.data?.message || "Error deleting sublevel"); }
    }
  };

  if (!subdepartment) return <div className="p-6 text-gray-500">No subdepartment data found</div>;

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <>
      <Header sidebarOpen={true} title="Subdepartment Details" />
      <div className="px-5 pb-8">

        {/* ── Page Navbar ── */}
        <div className="flex justify-between items-start py-4 gap-4 flex-wrap">
          <PageNavbar
            title={subdepartment.name}
            subtitle="View subdepartment information and manage levels"
            showBackButton={true}
            breadcrumbs={[
              { label: "Departments", path: "/department-management" },
              { label: "Sub-Level Management" },
            ]}
          />
          {/* right: bell + Add Sub-Level */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition relative">
              <IoNotificationsOutline size={20} className="text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
            </button>
            <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
              <MdAdd size={18} /> Add Sub-Level
            </button>
          </div>
        </div>

        {/* ── Levels management section ── */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                <MdLayers size={18} className="text-orange-500" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Levels</h2>
                <p className="text-xs text-gray-400">{levels.length} levels registered</p>
              </div>
            </div>
            <Formik initialValues={{ name: "", order: "", isActive: true }} validationSchema={validationSchema} onSubmit={handleLevelSubmit}>
              {({ isSubmitting, submitForm, resetForm }) => (
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

          {levels.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <MdLayers size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No levels added yet</p>
            </div>
          ) : (
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {levels.map(level => (
                <LevelCard
                  key={level._id}
                  level={level}
                  subdepartmentId={subdepartmentId}
                  onAddSubLevel={handleAddSubLevel}
                  onEditSubLevel={handleEditSubLevel}
                  onDeleteSubLevel={handleDeleteSubLevel}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Level Drawer ── */}
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
                initialValues={{ name: editingLevel?.name || "", order: editingLevel?.order || "", isActive: editingLevel?.isActive !== undefined ? editingLevel.isActive : true }}
                validationSchema={validationSchema}
                onSubmit={handleLevelSubmit}
              >
                {({ isSubmitting, submitForm }) => (
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

      {/* ── SubLevel Drawer ── */}
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
                initialValues={{ name: editingSubLevel?.name || "", order: editingSubLevel?.order || "", isActive: editingSubLevel?.isActive !== undefined ? editingSubLevel.isActive : true }}
                validationSchema={subLevelValidationSchema}
                onSubmit={handleSubLevelSubmit}
              >
                {({ isSubmitting, submitForm }) => (
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
