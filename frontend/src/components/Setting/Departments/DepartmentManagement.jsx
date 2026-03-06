import { useState } from "react";
import { MdBusiness } from "react-icons/md";
import PageNavbar from "../../common-components/navbar/PageNavbar";
import {
  useGetAllDepartmentsQuery,
  useDeleteDepartmentMutation,
  useAddDepartmentMutation,
  useUpdateDepartmentMutation,
} from "../../../redux/api/authApi";
import Loader from "../../common-components/loader/Loader";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import InputField from "../../common-components/common-feild/InputField";
import RadioGroup from "../../common-components/common-feild/RadioGroup";

const DepartmentManagement = () => {
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useGetAllDepartmentsQuery();
  const [deleteDepartment] = useDeleteDepartmentMutation();
  const [addDepartment] = useAddDepartmentMutation();
  const [updateDepartment] = useUpdateDepartmentMutation();

  const departments = data?.data || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required("Department name required"),
    code: Yup.string().required("Department code required"),
    universityName: Yup.string().required("University required"),
    allowedCourses: Yup.array().of(
      Yup.object({
        courseName: Yup.string().required("Course name required"),
        durationInYears: Yup.number()
          .typeError("Must be number")
          .required("Duration required"),
      })
    ),
  });

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const payload = {
        ...values,
        allowedCourses: values.allowedCourses.map((c) => ({
          ...c,
          durationInYears: Number(c.durationInYears),
        })),
      };

      if (editingDepartment) {
        await updateDepartment({
          id: editingDepartment._id,
          ...payload,
        }).unwrap();
        toast.success("Department updated");
      } else {
        await addDepartment(payload).unwrap();
        toast.success("Department added");
      }

      resetForm();
      setEditingDepartment(null);
      setDrawerOpen(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Error saving department");
    }
  };

  const handleEdit = (dept) => {
    setEditingDepartment(dept);
    setDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;

    try {
      await deleteDepartment(id).unwrap();
      toast.success("Department deleted");
      refetch();
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Loader />;

  return (
    <>
      <PageNavbar
        title="Department Management"
        subtitle="Manage organization departments"
      />

      <div className="p-6">

        {/* Top Bar */}
        <div className="flex justify-between mb-6">

          <input
            type="text"
            placeholder="Search department..."
            className="border px-4 py-2 rounded-lg w-72"
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button
            onClick={() => {
              setEditingDepartment(null);
              setDrawerOpen(true);
            }}
            className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600"
          >
            Add Department
          </button>

        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {filteredDepartments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white border rounded-xl shadow hover:shadow-lg transition"
            >
              <div className="p-5">

                <div className="flex justify-between mb-4">

                  <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                    <MdBusiness className="text-orange-500" size={22} />
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      dept.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {dept.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>

                <h3 className="font-bold text-lg">{dept.name}</h3>

                <p className="text-sm text-gray-500 mb-4">
                  {dept.description || "No description"}
                </p>

                <div className="text-sm space-y-1">
                  <p>📋 Code: {dept.code}</p>
                  <p>👤 HOD: {dept.headOfDepartment || "N/A"}</p>
                  <p>📚 Courses: {dept.allowedCourses?.length || 0}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex border-t">

                <button
                  onClick={() =>
                    navigate(`/department-details/${dept._id}`)
                  }
                  className="w-1/2 py-2 text-sm hover:bg-gray-100"
                >
                  VIEW
                </button>

                <button
                  onClick={() => handleEdit(dept)}
                  className="w-1/4 py-2 text-orange-600 hover:bg-orange-50"
                >
                  EDIT
                </button>

                <button
                  onClick={() => handleDelete(dept._id)}
                  className="w-1/4 py-2 text-red-600 hover:bg-red-50"
                >
                  DELETE
                </button>

              </div>
            </div>
          ))}

        </div>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="w-[420px] bg-white h-full shadow-xl p-6 overflow-y-auto">

            <h2 className="text-xl font-semibold mb-4">
              {editingDepartment ? "Edit Department" : "Add Department"}
            </h2>

            <Formik
              initialValues={{
                name: editingDepartment?.name || "",
                code: editingDepartment?.code || "",
                description: editingDepartment?.description || "",
                universityName: editingDepartment?.universityName || "",
                headOfDepartment: editingDepartment?.headOfDepartment || "",
                allowedCourses:
                  editingDepartment?.allowedCourses || [
                    { courseName: "", durationInYears: "" },
                  ],
                isActive:
                  editingDepartment?.isActive !== undefined
                    ? editingDepartment.isActive
                    : true,
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, setFieldValue }) => (
                <Form className="space-y-4">

                  <InputField label="Department Name" name="name" />

                  <InputField label="Department Code" name="code" />

                  <InputField
                    label="Description"
                    name="description"
                    type="textarea"
                  />

                  <InputField
                    label="University Name"
                    name="universityName"
                  />

                  <InputField
                    label="Head of Department"
                    name="headOfDepartment"
                  />

                  {/* Courses */}
                  <div>
                    <label className="font-medium text-sm">
                      Allowed Courses
                    </label>

                    {values.allowedCourses.map((course, index) => (
                      <div key={index} className="flex gap-2 mt-2">

                        <Field
                          name={`allowedCourses.${index}.courseName`}
                          placeholder="Course"
                          className="flex-1 border px-2 py-1 rounded"
                        />

                        <Field
                          name={`allowedCourses.${index}.durationInYears`}
                          type="number"
                          placeholder="Years"
                          className="w-20 border px-2 py-1 rounded"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setFieldValue(
                              "allowedCourses",
                              values.allowedCourses.filter(
                                (_, i) => i !== index
                              )
                            )
                          }
                          className="text-red-500"
                        >
                          ✕
                        </button>

                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        setFieldValue("allowedCourses", [
                          ...values.allowedCourses,
                          { courseName: "", durationInYears: "" },
                        ])
                      }
                      className="text-orange-500 text-sm mt-2"
                    >
                      + Add Course
                    </button>

                  </div>

                  <RadioGroup label="Status" name="isActive" />

                  <div className="flex gap-3 pt-4">

                    <button
                      type="button"
                      onClick={() => setDrawerOpen(false)}
                      className="flex-1 py-2 bg-gray-100 rounded"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="flex-1 py-2 bg-orange-500 text-white rounded"
                    >
                      Save
                    </button>

                  </div>

                </Form>
              )}
            </Formik>

          </div>
        </div>
      )}
    </>
  );
};

export default DepartmentManagement;


// import { useState } from "react";
// import { MdEdit, MdDelete, MdBusiness } from "react-icons/md";
// import PageNavbar from "../../common-components/navbar/PageNavbar";
// import { useGetAllDepartmentsQuery, useDeleteDepartmentMutation, useAddDepartmentMutation, useUpdateDepartmentMutation } from "../../../redux/api/authApi";
// import Loader from "../../common-components/loader/Loader";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import OrangeButton from "./../../common-components/sidebar/OrangeButton";
// import { Formik, Form, Field } from "formik";
// import * as Yup from "yup";
// import InputField from "../../common-components/common-feild/InputField";
// import RadioGroup from "../../common-components/common-feild/RadioGroup";
// import CommonTable from "../../common-components/table/CommonTable";
// import Pagination from "../../common-components/pagination/Pagination";

// const DepartmentManagement = () => {
//   const navigate = useNavigate();
//   const { data: departmentsData, isLoading, refetch } = useGetAllDepartmentsQuery();
//   const [deleteDepartment] = useDeleteDepartmentMutation();
//   const [addDepartment] = useAddDepartmentMutation();
//   const [updateDepartment] = useUpdateDepartmentMutation();
//   const [editingDepartment, setEditingDepartment] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [rowsPerPage] = useState(10);
//   const [selectedRows, setSelectedRows] = useState([]);
//   const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

//   const departments = departmentsData?.data || [];

//   const validationSchema = Yup.object({
//     name: Yup.string().required("Department name is required"),
//     code: Yup.string().required("Department code is required"),
//     description: Yup.string(),
//     universityName: Yup.string().required("University name is required"),
//     headOfDepartment: Yup.string(),
//     allowedCourses: Yup.array().of(
//       Yup.object({
//         courseName: Yup.string().required("Course name is required"),
//         durationInYears: Yup.number().required("Duration is required").positive("Must be positive")
//       })
//     ),
//     reportConfig: Yup.object({
//       templateType: Yup.string().required("Template type is required"),
//       sections: Yup.object()
//     }).required("Report config is required"),
//     isActive: Yup.boolean()
//   });

//   const handleDepartmentSubmit = async (values, { setSubmitting, resetForm }) => {
//     try {
//       const payload = {
//         name: values.name,
//         code: values.code,
//         description: values.description,
//         universityName: values.universityName,
//         headOfDepartment: values.headOfDepartment,
//         allowedCourses: values.allowedCourses,
//         reportConfig: values.reportConfig,
//         isActive: values.isActive
//       };

//       if (editingDepartment) {
//         const result = await updateDepartment({ id: editingDepartment._id, ...payload }).unwrap();
//         toast.success(result.message || "Department updated successfully!");
//       } else {
//         const result = await addDepartment(payload).unwrap();
//         toast.success(result.message || "Department added successfully!");
//       }
//       resetForm();
//       setEditingDepartment(null);
//       setIsEditDrawerOpen(false);
//       refetch();
//     } catch (error) {
//       toast.error(error?.data?.message || "Error saving department");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleEdit = (row) => {
//     setEditingDepartment(row);
//     setIsEditDrawerOpen(true);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this department?")) {
//       try {
//         await deleteDepartment(id).unwrap();
//         toast.success("Department deleted successfully!");
//         refetch();
//       } catch (error) {
//         toast.error(error?.data?.message || "Error deleting department");
//       }
//     }
//   };

//   const handleRowClick = (department) => {
//     navigate(`/department-details/${department._id}`, { state: { department } });
//   };

//   if (isLoading) {
//     return <Loader />;
//   }

//   return (
//     <>
//       <PageNavbar
//         title="Department Management"
//         subtitle="Manage your organization departments and their details"
//         showBackButton={false}
//       />
//       <div className="mt-1 border bg-[var(--backgroundColor)] shadow-sm rounded-lg">
//         <div className="px-6">
//           <div className="flex justify-between items-center flex-wrap gap-4 py-4">
//             <Pagination
//               rowsPerPage={rowsPerPage}
//               searchTerm={searchTerm}
//               setSearchTerm={setSearchTerm}
//               filtersConfig={[]}
//               filteredData={departments}
//               selectedRows={selectedRows}
//               allData={departments}
//               sectionName="departments"
//             />
//             <div className="flex-shrink-0">
//             <Formik
//               key={editingDepartment?._id || 'new'}
//               initialValues={{
//                 name: editingDepartment?.name || "",
//                 code: editingDepartment?.code || "",
//                 description: editingDepartment?.description || "",
//                 universityName: editingDepartment?.universityName || "",
//                 headOfDepartment: editingDepartment?.headOfDepartment || "",
//                 allowedCourses: editingDepartment?.allowedCourses || [{ courseName: "", durationInYears: "" }],
//                 reportConfig: editingDepartment?.reportConfig || {
//                   templateType: "ITEG_STANDARD",
//                   sections: {
//                     showTechnicalSkills: true,
//                     showSoftSkills: true,
//                     showDiscipline: true,
//                     showProjects: true,
//                     showCareerReadiness: true,
//                     showUniversityAcademicHistory: true,
//                     showTaskCompletionPercentage: true,
//                     showEvaluationBreakdown: true
//                   }
//                 },
//                 isActive: editingDepartment?.isActive !== undefined ? editingDepartment.isActive : true
//               }}
//               validationSchema={validationSchema}
//               onSubmit={handleDepartmentSubmit}
//               enableReinitialize
//             >
//               {({ values, setFieldValue, isSubmitting, submitForm, resetForm }) => (
//                 <OrangeButton
//                   buttonTitle="Add Department"
//                   panelTitle={editingDepartment ? "Edit Department" : "Add New Department"}
//                   drawerContent={
//                     <Form className="space-y-4">
//                       <InputField
//                         label="Department Name"
//                         name="name"
//                         placeholder="Enter department name"
//                       />

//                       <InputField
//                         label="Department Code"
//                         name="code"
//                         placeholder="e.g., ITEG, MEG, BEG (unique code)"
//                       />

//                       <InputField
//                         label="Description"
//                         name="description"
//                         type="textarea"
//                         placeholder="Enter description"
//                       />

//                       <InputField
//                         label="University Name"
//                         name="universityName"
//                         placeholder="Enter university name"
//                       />

//                       <InputField
//                         label="Head of Department"
//                         name="headOfDepartment"
//                         placeholder="Enter HOD name"
//                       />

//                       <div>
//                         <label className="block text-sm font-medium mb-2">Allowed Courses</label>
//                         {values.allowedCourses.map((course, index) => (
//                           <div key={index} className="flex gap-2 mb-2">
//                             <Field
//                               name={`allowedCourses.${index}.courseName`}
//                               placeholder="Course name"
//                               className="flex-1 border rounded px-3 py-2"
//                             />
//                             <Field
//                               name={`allowedCourses.${index}.durationInYears`}
//                               type="number"
//                               placeholder="Years"
//                               className="w-24 border rounded px-3 py-2"
//                             />
//                             {values.allowedCourses.length > 1 && (
//                               <button
//                                 type="button"
//                                 onClick={() => {
//                                   const newCourses = values.allowedCourses.filter((_, i) => i !== index);
//                                   setFieldValue('allowedCourses', newCourses);
//                                 }}
//                                 className="px-3 py-2 bg-red-500 text-white rounded"
//                               >
//                                 ✕
//                               </button>
//                             )}
//                           </div>
//                         ))}
//                         <button
//                           type="button"
//                           onClick={() => setFieldValue('allowedCourses', [...values.allowedCourses, { courseName: '', durationInYears: '' }])}
//                           className="text-sm text-orange-500 hover:text-orange-600"
//                         >
//                           + Add Course
//                         </button>
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium mb-2">Template Type</label>
//                         <Field as="select" name="reportConfig.templateType" className="w-full border rounded px-3 py-2">
//                           <option value="ITEG_STANDARD">ITEG Standard</option>
//                           <option value="MEG_WEIGHTED">MEG Weighted</option>
//                           <option value="BEG_CUTOFF">BEG Cutoff</option>
//                           <option value="BTECH_STAGE">BTech Stage</option>
//                         </Field>
//                       </div>

//                       <RadioGroup label="Status" name="isActive" required={false} />
//                     </Form>
//                   }
//                   leftBtnText="Cancel"
//                   rightBtnText={isSubmitting ? "Saving..." : (editingDepartment ? "Update Department" : "Add Department")}
//                   onLeftClick={() => {
//                     resetForm();
//                     setEditingDepartment(null);
//                   }}
//                   onRightClick={submitForm}
//                 />
//               )}
//             </Formik>
//           </div>
//         </div>
//         <div className="mt-1 ">

//           {/* Departments Cards Grid */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-3">
//             {departments.map((dept) => (
//               <div
//                 key={dept._id}
//                 className="bg-[#f9fafb] border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden min-h-[380px] flex flex-col"
//               >
//                 <div className="p-6 flex-1">

//                   {/* top row */}
//                   <div className="flex items-start justify-between mb-4">

//                     {/* icon circle */}
//                     <div className="w-14 h-14 rounded-full border border-orange-200 bg-orange-50 flex items-center justify-center">
//                       <MdBusiness className="text-orange-500" size={26} />
//                     </div>

//                     {/* status pill */}
//                     <span
//                       className={`text-xs font-semibold px-3 py-1 rounded-full tracking-wide
//               ${dept.status
//                           ? "bg-green-100 text-green-700"
//                           : "bg-gray-200 text-gray-600"}
//             `}
//                     >
//                       {dept.isActive ? "ACTIVE" : "INACTIVE"}
//                     </span>
//                   </div>

//                   {/* title */}
//                   <h3 className="text-lg font-bold text-gray-900 mb-1">
//                     {dept.name}
//                   </h3>

//                   {/* description */}
//                   <p className="text-sm text-gray-500 mb-4 line-clamp-2">
//                     {dept.description || dept.universityName || "No description"}
//                   </p>

//                   {/* divider */}
//                   <div className="border-t border-gray-200 my-4"></div>

//                   {/* info */}
//                   <div className="space-y-2 text-sm text-gray-600">
//                     <div className="flex items-center gap-2">
//                       📋 <span>Code: {dept.code}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       👤 <span>HOD: {dept.headOfDepartment || "Not assigned"}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       📚 <span>Courses: {dept.allowedCourses?.length || 0}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* bottom actions */}
//                 <div className="flex gap-3 p-4 bg-gray-50">
//                   <button
//                     onClick={() => handleRowClick(dept)}
//                     className="w-1/2 border border-gray-300 rounded-lg py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
//                   >
//                     VIEW
//                   </button>

//                   <Formik
//                     key={dept._id}
//                     initialValues={{
//                       name: dept.name,
//                       code: dept.code,
//                       description: dept.description || "",
//                       universityName: dept.universityName,
//                       headOfDepartment: dept.headOfDepartment || "",
//                       allowedCourses: dept.allowedCourses || [{ courseName: "", durationInYears: "" }],
//                       reportConfig: dept.reportConfig,
//                       isActive: dept.isActive
//                     }}
//                     validationSchema={validationSchema}
//                     onSubmit={async (values, { setSubmitting, resetForm }) => {
//                       try {
//                         const payload = {
//                           name: values.name,
//                           code: values.code,
//                           description: values.description,
//                           universityName: values.universityName,
//                           headOfDepartment: values.headOfDepartment,
//                           allowedCourses: values.allowedCourses,
//                           reportConfig: values.reportConfig,
//                           isActive: values.isActive
//                         };
//                         const result = await updateDepartment({ id: dept._id, ...payload }).unwrap();
//                         toast.success(result.message || "Department updated successfully!");
//                         resetForm();
//                         refetch();
//                       } catch (error) {
//                         toast.error(error?.data?.message || "Error updating department");
//                       } finally {
//                         setSubmitting(false);
//                       }
//                     }}
//                     enableReinitialize
//                   >
//                     {({ isSubmitting, submitForm, resetForm, values, setFieldValue }) => (
//                       <div className="w-1/2">
//                         <OrangeButton
//                           buttonTitle="EDIT"
//                           panelTitle="Edit Department"
//                           customButtonClass="w-full bg-orange-500 text-white rounded-lg py-2 text-sm font-semibold hover:bg-orange-600 transition"
//                           drawerContent={
//                             <Form className="space-y-4">
//                               <InputField
//                                 label="Department Name"
//                                 name="name"
//                                 placeholder="Enter department name"
//                               />

//                               <InputField
//                                 label="Department Code"
//                                 name="code"
//                                 placeholder="Enter department code"
//                                 disabled={true}
//                               />

//                               <InputField
//                                 label="Description"
//                                 name="description"
//                                 type="textarea"
//                                 placeholder="Enter description"
//                               />

//                               <InputField
//                                 label="University Name"
//                                 name="universityName"
//                                 placeholder="Enter university name"
//                               />

//                               <InputField
//                                 label="Head of Department"
//                                 name="headOfDepartment"
//                                 placeholder="Enter HOD name"
//                               />

//                               <div>
//                                 <label className="block text-sm font-medium mb-2">Allowed Courses</label>
//                                 {values.allowedCourses.map((course, index) => (
//                                   <div key={index} className="flex gap-2 mb-2">
//                                     <Field
//                                       name={`allowedCourses.${index}.courseName`}
//                                       placeholder="Course name"
//                                       className="flex-1 border rounded px-3 py-2"
//                                     />
//                                     <Field
//                                       name={`allowedCourses.${index}.durationInYears`}
//                                       type="number"
//                                       placeholder="Years"
//                                       className="w-24 border rounded px-3 py-2"
//                                     />
//                                     {values.allowedCourses.length > 1 && (
//                                       <button
//                                         type="button"
//                                         onClick={() => {
//                                           const newCourses = values.allowedCourses.filter((_, i) => i !== index);
//                                           setFieldValue('allowedCourses', newCourses);
//                                         }}
//                                         className="px-3 py-2 bg-red-500 text-white rounded"
//                                       >
//                                         ✕
//                                       </button>
//                                     )}
//                                   </div>
//                                 ))}
//                                 <button
//                                   type="button"
//                                   onClick={() => setFieldValue('allowedCourses', [...values.allowedCourses, { courseName: '', durationInYears: '' }])}
//                                   className="text-sm text-orange-500 hover:text-orange-600"
//                                 >
//                                   + Add Course
//                                 </button>
//                               </div>

//                               <div>
//                                 <label className="block text-sm font-medium mb-2">Template Type</label>
//                                 <Field as="select" name="reportConfig.templateType" className="w-full border rounded px-3 py-2">
//                                   <option value="ITEG_STANDARD">ITEG Standard</option>
//                                   <option value="MEG_WEIGHTED">MEG Weighted</option>
//                                   <option value="BEG_CUTOFF">BEG Cutoff</option>
//                                   <option value="BTECH_STAGE">BTech Stage</option>
//                                 </Field>
//                               </div>

//                               <RadioGroup label="Status" name="isActive" required={false} />
//                             </Form>
//                           }
//                           leftBtnText="Cancel"
//                           rightBtnText={isSubmitting ? "Updating..." : "Update Department"}
//                           onLeftClick={resetForm}
//                           onRightClick={submitForm}
//                         />
//                       </div>
//                     )}
//                   </Formik>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//         <CommonTable
//           columns={[
//             { key: 'name', label: 'Department Name' },
//             { key: 'code', label: 'Code' },
//             { key: 'universityName', label: 'University' },
//             { 
//               key: 'isActive', 
//               label: 'Status',
//               render: (row) => (
//                 <span className={`inline-block px-3 py-1 text-xs rounded-full ${
//                   row.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
//                 }`}>
//                   {row.isActive ? "Active" : "Inactive"}
//                 </span>
//               )
//             },
//             { key: 'allowedCourses', label: 'Courses', render: (row) => row.allowedCourses?.length || 0 },
//           ]}
//           data={departments}
//           editable={true}
//           pagination={true}
//           rowsPerPage={rowsPerPage}
//           searchTerm={searchTerm}
//           actionButton={(row) => (
//             <div className="flex gap-2">
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleEdit(row);
//                 }}
//                 className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
//               >
//                 <MdEdit size={18} />
//               </button>
//               <button
//                 onClick={() => handleDelete(row._id)}
//                 className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
//               >
//                 <MdDelete size={18} />
//               </button>
//             </div>
//           )}
//           onRowClick={handleRowClick}
//           onSelectionChange={setSelectedRows}
//         />
//       </div>

//       {/* Edit Drawer */}
//       {isEditDrawerOpen && editingDepartment && (
//         <div className="fixed inset-0 z-50 flex justify-end">
//           <div onClick={() => { setIsEditDrawerOpen(false); setEditingDepartment(null); }} className="absolute inset-0 bg-black/40" />
//           <div className="relative w-full max-w-md h-full bg-white shadow-xl flex flex-col">
//             <div className="flex items-start justify-between px-6 py-5 border-b">
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-900">Edit Department</h2>
//                 <p className="text-sm text-gray-500 mt-1">Update department details</p>
//               </div>
//               <button onClick={() => { setIsEditDrawerOpen(false); setEditingDepartment(null); }} className="text-gray-400 hover:text-gray-600">✕</button>
//             </div>
//             <div className="flex-1 overflow-y-auto p-6">
//               <Formik
//                 initialValues={{
//                   name: editingDepartment?.name || "",
//                   code: editingDepartment?.code || "",
//                   description: editingDepartment?.description || "",
//                   universityName: editingDepartment?.universityName || "",
//                   headOfDepartment: editingDepartment?.headOfDepartment || "",
//                   allowedCourses: editingDepartment?.allowedCourses || [{ courseName: "", durationInYears: "" }],
//                   reportConfig: editingDepartment?.reportConfig || { templateType: "ITEG_STANDARD", sections: {} },
//                   isActive: editingDepartment?.isActive !== undefined ? editingDepartment.isActive : true
//                 }}
//                 validationSchema={validationSchema}
//                 onSubmit={handleDepartmentSubmit}
//               >
//                 {({ values, setFieldValue, isSubmitting, submitForm }) => (
//                   <Form className="space-y-4">
//                     <InputField label="Department Name" name="name" placeholder="Enter department name" />
//                     <InputField label="Department Code" name="code" placeholder="Enter department code" />
//                     <InputField label="Description" name="description" type="textarea" placeholder="Enter description" />
//                     <InputField label="University Name" name="universityName" placeholder="Enter university name" />
//                     <InputField label="Head of Department" name="headOfDepartment" placeholder="Enter HOD name" />
//                     <div>
//                       <label className="block text-sm font-medium mb-2">Allowed Courses</label>
//                       {values.allowedCourses.map((course, index) => (
//                         <div key={index} className="flex gap-2 mb-2">
//                           <Field name={`allowedCourses.${index}.courseName`} placeholder="Course name" className="flex-1 border rounded px-3 py-2" />
//                           <Field name={`allowedCourses.${index}.durationInYears`} type="number" placeholder="Years" className="w-24 border rounded px-3 py-2" />
//                           {values.allowedCourses.length > 1 && (
//                             <button type="button" onClick={() => setFieldValue('allowedCourses', values.allowedCourses.filter((_, i) => i !== index))} className="px-3 py-2 bg-red-500 text-white rounded">✕</button>
//                           )}
//                         </div>
//                       ))}
//                       <button type="button" onClick={() => setFieldValue('allowedCourses', [...values.allowedCourses, { courseName: '', durationInYears: '' }])} className="text-sm text-orange-500 hover:text-orange-600">+ Add Course</button>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium mb-2">Template Type</label>
//                       <Field as="select" name="reportConfig.templateType" className="w-full border rounded px-3 py-2">
//                         <option value="ITEG_STANDARD">ITEG Standard</option>
//                         <option value="MEG_WEIGHTED">MEG Weighted</option>
//                         <option value="BEG_CUTOFF">BEG Cutoff</option>
//                         <option value="BTECH_STAGE">BTech Stage</option>
//                       </Field>
//                     </div>
//                     <RadioGroup label="Status" name="isActive" required={false} />
//                     <div className="flex gap-4 pt-4">
//                       <button type="button" onClick={() => { setIsEditDrawerOpen(false); setEditingDepartment(null); }} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition">Cancel</button>
//                       <button type="button" onClick={submitForm} disabled={isSubmitting} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FDA92D] to-[#FDB84D] text-white font-semibold">{isSubmitting ? "Updating..." : "Update"}</button>
//                     </div>
//                   </Form>
//                 )}
//               </Formik>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default DepartmentManagement;