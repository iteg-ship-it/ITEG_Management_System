/* eslint-disable react/prop-types */

import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { FaCamera } from "react-icons/fa";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import UserProfile from "../common-components/user-profile/UserProfile";
import TextInput from "../common-components/common-feild/TextInput";
import SelectInput from "../common-components/common-feild/SelectInput";
import RadioGroup from "../common-components/common-feild/RadioGroup";
import CheckboxGroup from "../common-components/common-feild/CheckboxGroup";

import { useUpdateStudentByIdMutation } from "../../redux/api/authApi";

const StudentEditPage = () => {
  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState("https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg");
  const location = useLocation();
  const studentData = location.state?.student || {};

  const [updateStudentById] = useUpdateStudentByIdMutation();

  const initialValues = {
    firstName: studentData.name || "",
    lastName: "",
    contactNumber: studentData.mobile || "",
    fatherName: studentData.fatherName || "",
    gender: "",
    track: studentData.course || "",
    address: studentData.village || "",
    twelfthSubject: "",
    twelfthPercentage: "",
    tenthPercentage: "",
    passoutYear: "",
    courseType: "Course",
    itegLevels: [],
    permission: false,
    permissionReason: "",
    permissionDate: "",
    placed: false,
    companyName: "",
    placementDate: "",
    imageSrc: imageSrc,
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    contactNumber: Yup.string()
      .matches(/^\d{10}$/, "Must be a valid 10-digit number")
      .required("Contact number is required"),
    twelfthPercentage: Yup.number()
      .typeError("Enter a valid percentage")
      .min(0)
      .max(100)
      .required("12th percentage is required"),
    tenthPercentage: Yup.number()
      .typeError("Enter a valid percentage")
      .min(0)
      .max(100)
      .required("10th percentage is required"),
    passoutYear: Yup.string().required("Passout year is required"),
  });

  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = (e, setFieldValue) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
        setFieldValue("imageSrc", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const payload = { id: studentData._id, ...values };
      const res = await updateStudentById({ data: payload }).unwrap();
      console.log("Student updated successfully:", res);
    } catch (error) {
      console.error("Failed to update student:", error);
    }
  };

  return (
    <>
      <UserProfile showBackButton heading="Student Profile" />
      <div>
        <div>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue, values }) => (
              <Form className="space-y-10">
                {/* Profile Image Upload */}
                <div className="flex justify-center">
                  <div
                    className="relative w-32 h-32 rounded-full border-4 border-dashed border-orange-500 cursor-pointer"
                    onClick={handleImageClick}
                  >
                    <img
                      className="w-full h-full rounded-full object-cover"
                      src={imageSrc}
                      alt="Profile"
                    />
                    <div className="absolute bottom-1 right-1 bg-orange-500 rounded-full p-1">
                      <FaCamera className="text-white text-lg" />
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setFieldValue)}
                    />
                  </div>
                </div>

                {/* Personal Info */}
                <Section title="Personal Information">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <TextInput label="First Name" name="firstName" placeholder="First Name" />
                    <TextInput label="Last Name" name="lastName" placeholder="Last Name" />
                    <TextInput label="Contact Number" name="contactNumber" placeholder="Contact Number" />
                    <TextInput label="Father's Name" name="fatherName" placeholder="Father's Name" />
                    <SelectInput
                      name="gender"
                      label="Gender"
                      options={[
                        { value: "", label: "Select Gender" },
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                        { value: "other", label: "Other" },
                      ]}
                    />
                    <SelectInput
                      name="track"
                      label="Track"
                      options={[
                        { value: "", label: "Select Track" },
                        { value: "Harda", label: "Harda" },
                        { value: "Khategaon", label: "Khategaon" },
                      ]}
                    />
                    <TextInput label="Address" name="address" placeholder="Village/Address" />
                  </div>
                </Section>

                {/* Academic Info */}
                <Section title="Academic Details">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <TextInput label="12th Subject" name="twelfthSubject" placeholder="Subject Name" />
                    <TextInput label="12th Percentage" name="twelfthPercentage" placeholder="e.g. 82.5" />
                    <TextInput label="10th Percentage" name="tenthPercentage" placeholder="e.g. 75.3" />
                    <TextInput label="Passout Year" name="passoutYear" placeholder="e.g. 2023" />
                    <RadioGroup
                      label="Course Type"
                      name="courseType"
                      options={[
                        { label: "Course", value: "Course" },
                        { label: "Diploma", value: "Diploma" },
                      ]}
                      containerClassName="flex gap-6 mt-2"
                    />
                  </div>
                </Section>

                {/* ITEG Levels */}
                <Section title="ITEG Levels">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                    {["1A Level", "1B Level", "1C Level", "2A Level", "2B Level", "2C Level"].map((level) => (
                      <CheckboxGroup
                        key={level}
                        label=""
                        name="itegLevels"
                        options={[{ value: level, label: level }]}
                      />
                    ))}
                  </div>
                </Section>

                {/* Permission Section */}
                <Section title="Permission Details">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">Permission</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={values.permission}
                        onChange={(e) => setFieldValue("permission", e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-orange-500 peer-focus:ring-2 peer-focus:ring-orange-300 after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextInput name="permissionReason" placeholder="Reason" />
                    <TextInput name="permissionDate" placeholder="dd/mm/yyyy" />
                  </div>
                </Section>

                {/* Placement Info */}
                <Section title="Placement Details">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">Placed</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={values.placed}
                        onChange={(e) => setFieldValue("placed", e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-orange-500 peer-focus:ring-2 peer-focus:ring-orange-300 after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextInput label="Company Name" name="companyName" placeholder="e.g. Infosys" />
                    <TextInput label="Placement Date" name="placementDate" placeholder="dd/mm/yyyy" />
                  </div>
                </Section>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-8 py-2 rounded-md shadow-sm transition"
                  >
                    Save Changes
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
};

// Reusable Section Wrapper
const Section = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
    {children}
  </div>
);

export default StudentEditPage;


// import { useLocation, useParams, useNavigate } from "react-router-dom";
// import { useState } from "react";
// import {
//   useUpdatePermissionMutation,
//   useUpdatePlacementMutation,
// } from "../../redux/api/authApi";
// import { toast } from "react-toastify";
// import imageCompression from "browser-image-compression";

// const StudentEditPage = () => {
//   const { id } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const student = location.state?.student;

//   const [updatePermission] = useUpdatePermissionMutation();
//   const [updatePlacement] = useUpdatePlacementMutation();

//   const [permissionData, setPermissionData] = useState({
//     imageURL: "",
//     remark: "",
//     approved_by: "admin",
//   });

//   const [placementData, setPlacementData] = useState({
//     companyName: "",
//     salary: "",
//     location: "",
//     jobProfile: "",
//   });

//   // Compress and convert to base64
//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const options = {
//       maxSizeMB: 0.3, // ~300 KB
//       maxWidthOrHeight: 600,
//       useWebWorker: true,
//     };

//     try {
//       const compressedFile = await imageCompression(file, options);
//       const base64 = await imageCompression.getDataUrlFromFile(compressedFile);
//       setPermissionData((prev) => ({ ...prev, imageURL: base64 }));
//     } catch (err) {
//       console.error("Compression Error:", err);
//       toast.error("Image compression failed.");
//     }
//   };

//   const handlePermissionSubmit = async () => {
//     try {
//       if (!permissionData.imageURL) {
//         toast.error("Please upload an image");
//         return;
//       }
//       await updatePermission({ id, data: permissionData }).unwrap();
//       toast.success("Permission updated successfully");
//     } catch (error) {
//       console.error("Permission Error:", error);
//       toast.error(error?.data?.message || "Failed to update permission");
//     }
//   };

//   const handlePlacementSubmit = async () => {
//     try {
//       await updatePlacement({ id, data: placementData }).unwrap();
//       toast.success("Placement updated successfully");
//     } catch (error) {
//       console.error("Placement Error:", error);
//       toast.error(error?.data?.message || "Failed to update placement");
//     }
//   };

//   return (
//     <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md mt-6">
//       <h2 className="text-2xl font-bold mb-4">
//         Edit Student: {student?.firstName} {student?.lastName}
//       </h2>

//       {/* Permission Details */}
//       <div className="mb-8">
//         <h3 className="text-xl font-semibold mb-2">Permission Details</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block mb-1 font-medium">Upload Image (Base64)</label>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleImageUpload}
//               className="border p-2 w-full"
//             />
//             {permissionData.imageURL && (
//               <img
//                 src={permissionData.imageURL}
//                 alt="Preview"
//                 className="mt-2 h-32 rounded border"
//               />
//             )}
//           </div>

//           <div>
//             <label className="block mb-1 font-medium">Remark</label>
//             <input
//               type="text"
//               value={permissionData.remark}
//               onChange={(e) =>
//                 setPermissionData((prev) => ({
//                   ...prev,
//                   remark: e.target.value,
//                 }))
//               }
//               className="border p-2 w-full"
//               placeholder="Enter remark"
//             />
//           </div>

//           <div>
//             <label className="block mb-1 font-medium">Approved By</label>
//             <select
//               value={permissionData.approved_by}
//               onChange={(e) =>
//                 setPermissionData((prev) => ({
//                   ...prev,
//                   approved_by: e.target.value,
//                 }))
//               }
//               className="border p-2 w-full"
//             >
//               <option value="super admin">Super Admin</option>
//               <option value="admin">Admin</option>
//               <option value="faculty">Faculty</option>
//             </select>
//           </div>
//         </div>
//         <button
//           onClick={handlePermissionSubmit}
//           className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded"
//         >
//           Update Permission
//         </button>
//       </div>

//       {/* Placement Info */}
//       <div className="mb-8">
//         <h3 className="text-xl font-semibold mb-2">Placement Info</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block mb-1 font-medium">Company Name</label>
//             <input
//               type="text"
//               value={placementData.companyName}
//               onChange={(e) =>
//                 setPlacementData((prev) => ({
//                   ...prev,
//                   companyName: e.target.value,
//                 }))
//               }
//               className="border p-2 w-full"
//               placeholder="e.g. Infosys"
//             />
//           </div>

//           <div>
//             <label className="block mb-1 font-medium">Job Profile</label>
//             <input
//               type="text"
//               value={placementData.jobProfile}
//               onChange={(e) =>
//                 setPlacementData((prev) => ({
//                   ...prev,
//                   jobProfile: e.target.value,
//                 }))
//               }
//               className="border p-2 w-full"
//               placeholder="e.g. Frontend Developer"
//             />
//           </div>

//           <div>
//             <label className="block mb-1 font-medium">Salary</label>
//             <input
//               type="text"
//               value={placementData.salary}
//               onChange={(e) =>
//                 setPlacementData((prev) => ({
//                   ...prev,
//                   salary: e.target.value,
//                 }))
//               }
//               className="border p-2 w-full"
//               placeholder="e.g. 6 LPA"
//             />
//           </div>

//           <div>
//             <label className="block mb-1 font-medium">Location</label>
//             <input
//               type="text"
//               value={placementData.location}
//               onChange={(e) =>
//                 setPlacementData((prev) => ({
//                   ...prev,
//                   location: e.target.value,
//                 }))
//               }
//               className="border p-2 w-full"
//               placeholder="e.g. Bangalore"
//             />
//           </div>
//         </div>
//         <button
//           onClick={handlePlacementSubmit}
//           className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded"
//         >
//           Update Placement
//         </button>
//       </div>

//       <button
//         onClick={() => navigate(-1)}
//         className="mt-6 bg-gray-500 text-white py-2 px-6 rounded hover:bg-gray-600"
//       >
//         Go Back
//       </button>
//     </div>
//   );
// };

// export default StudentEditPage;