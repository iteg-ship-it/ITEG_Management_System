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

import { useUpdateStudentByIdMutation, } from "../../redux/api/authApi"; // Adjust path if needed

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

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

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
    const payload = {
      id: studentData._id,
      ...values,
    };

    try {
      const res = await updateStudentById({ data: payload }).unwrap();
      console.log("Student updated successfully:", res);
      // Optionally show success UI or redirect
    } catch (error) {
      console.error("Failed to update student:", error);
      // Optionally show error UI
    }
  };

  return (
    <>
      <UserProfile showBackButton heading="Student Profile" />

      <div className="w-full min-h-screen mt-5 font-sans">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values }) => (
            <Form className="space-y-6 rounded-lg">
              {/* Profile Image Upload */}
              <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
                <div
                  className="relative w-28 h-28 rounded-full border-4 border-dotted border-orange-500 cursor-pointer flex items-center justify-center"
                  onClick={handleImageClick}
                >
                  <img
                    className="w-full h-full rounded-full object-cover p-1"
                    src={imageSrc}
                    alt="Profile"
                  />
                  <div className="absolute bottom-1 right-1 bg-orange-500 rounded-full p-1">
                    <FaCamera className="text-white text-base" />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setFieldValue)}
                  />
                </div>

                <button
                  type="submit"
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition duration-300 text-sm font-medium"
                >
                  Save
                </button>
              </div>

              {/* Personal Info */}
              <div className="border-b border-gray-300 pb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <TextInput label="First Name" name="firstName" placeholder="First Name" />
                  <TextInput label="Last Name" name="lastName" placeholder="Last Name" />
                  <TextInput label="Contact Number" name="contactNumber" placeholder="Contact Number" />
                  <TextInput label="Father's Name" name="fatherName" placeholder="Father's Name" />
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <SelectInput
                      name="gender"
                      options={[
                        { value: "", label: "Gender" },
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                        { value: "other", label: "Other" },
                      ]}
                    />
                  </div>
                  <div>
                    <label htmlFor="track" className="block text-sm font-medium text-gray-700 mb-1">
                      Track
                    </label>
                    <SelectInput
                      name="track"
                      options={[
                        { value: "", label: "Select Track" },
                        { value: "Harda", label: "Harda" },
                        { value: "Khategaon", label: "Khategaon" },
                      ]}
                    />
                  </div>
                  <TextInput label="Address" name="address" placeholder="Enter your address" />
                </div>
              </div>

              {/* Academic Info */}
              <div className="border-b border-gray-300 pb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Academic Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <TextInput label="12th Subject" name="twelfthSubject" placeholder="12th Subject" />
                  <TextInput label="12th Percentage" name="twelfthPercentage" placeholder="12th %" />
                  <TextInput label="10th Percentage" name="tenthPercentage" placeholder="10th %" />
                  <TextInput label="Passout Year" name="passoutYear" placeholder="dd/mm/yyyy" />
                  <RadioGroup
                    label=""
                    name="courseType"
                    options={[
                      { label: "Course", value: "Course" },
                      { label: "Diploma", value: "Diploma" },
                    ]}
                    containerClassName="flex items-center gap-4 mt-6"
                    radioClassName="form-radio text-orange-500"
                    labelClassName="text-gray-700 ml-2"
                  />
                </div>
              </div>

              {/* ITEG Levels */}
              <div className="border-b border-gray-300 pb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Iteg Levels</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                  {["1A Level", "1B Level", "1C Level", "2A Level", "2B Level", "2C Level"].map(
                    (level) => (
                      <CheckboxGroup
                        key={level}
                        label=""
                        name="itegLevels"
                        options={[{ value: level, label: level }]}
                        checkboxClassName="form-checkbox text-orange-500"
                        labelClassName="text-gray-700 ml-2"
                      />
                    )
                  )}
                </div>
              </div>

              {/* Permission Section */}
              <div className="border-b border-gray-300 pb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Permission</h2>
                <div className="flex justify-between items-center w-full mb-4">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="permissionSwitch">
                    Permission
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="permissionSwitch"
                      name="permission"
                      className="sr-only peer"
                      onChange={(e) => setFieldValue("permission", e.target.checked)}
                      checked={values.permission}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextInput label="" name="permissionReason" placeholder="Reasons" />
                  <TextInput label="" name="permissionDate" placeholder="dd/mm/yyyy" type="text" />
                </div>
              </div>

              {/* Placed Info */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Placed</h2>
                <div className="flex justify-between items-center w-full mb-4">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="placedSwitch">
                    Placed
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="placedSwitch"
                      name="placed"
                      className="sr-only peer"
                      onChange={(e) => setFieldValue("placed", e.target.checked)}
                      checked={values.placed}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextInput label="Company Name" name="companyName" placeholder="Company Name" />
                  <TextInput label="Date of Placement" name="placementDate" placeholder="dd/mm/yyyy" type="text" />
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
};

export default StudentEditPage;
