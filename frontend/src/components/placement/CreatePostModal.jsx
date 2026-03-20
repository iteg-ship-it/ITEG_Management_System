/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { IoClose, IoCloudUploadOutline, IoDocumentTextOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "../common-components/common-feild/InputField";
import { useCreatePlacementPostMutation, useUpdatePlacementPostMutation } from "../../redux/api/authApi";
import { buttonStyles } from "../../styles/buttonStyles";
import BlurBackground from "../common-components/BlurBackground";
import Header from "../common-components/sidebar/Header";

const PRIMARY_COLOR = "#FDA92D";
const TEXT_COLOR = "#4B4B4B";

const CreatePostModal = ({ isOpen, onClose, student, onSuccess, isUpdateMode = false }) => {
  const [companyLogoFile, setCompanyLogoFile] = useState(null);
  const [studentImageFile, setStudentImageFile] = useState(null);
  const [createPlacementPost] = useCreatePlacementPostMutation();
  const [updatePlacementPost] = useUpdatePlacementPostMutation();

  const validationSchema = Yup.object({
    position: Yup.string().required("Position is required"),
    companyName: Yup.string().required("Company name is required"),
    headOffice: Yup.string().required("Head office is required")
  });

  const initialValues = {
    position: student?.placedInfo?.jobProfile || "",
    companyName: student?.placedInfo?.companyName || "",
    headOffice: ""
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    if (!isUpdateMode && (!companyLogoFile || !studentImageFile)) {
      toast.error("Please upload both company logo and student image");
      setSubmitting(false);
      return;
    }

    try {
      const postData = {
        studentId: student._id,
        position: values.position,
        companyName: values.companyName,
        headOffice: values.headOffice
      };

      if (companyLogoFile) {
        postData.companyLogo = await fileToBase64(companyLogoFile);
      }
      if (studentImageFile) {
        postData.studentImage = await fileToBase64(studentImageFile);
      }

      if (isUpdateMode) {
        await updatePlacementPost(postData).unwrap();
        toast.success("Placement post updated successfully!");
      } else {
        await createPlacementPost(postData).unwrap();
        toast.success("Placement post created successfully!");
      }

      onSuccess?.();
      resetForm();
      setCompanyLogoFile(null);
      setStudentImageFile(null);
      onClose();
    } catch (error) {
      console.error(`Error ${isUpdateMode ? 'updating' : 'creating'} placement post:`, error);
      toast.error(`Error ${isUpdateMode ? 'updating' : 'creating'} placement post. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleClose = () => {
    setCompanyLogoFile(null);
    setStudentImageFile(null);
    onClose();
  };

  // Update initial values when student prop changes
  useEffect(() => {
    // This will be handled by Formik's initialValues
  }, [student]);


  if (!isOpen) return null;

  return (
    <>
      <Header 
        title={isUpdateMode ? 'Update Placement Post' : 'Create Placement Post'}
        showBack={true}
        onBack={handleClose}
      />
      <BlurBackground isOpen={isOpen} onClose={handleClose}>
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-lg p-8 relative max-h-[90vh] overflow-y-auto">

        {/* Student Info */}
        {student && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center">
              <p className="text-sm" style={{ color: TEXT_COLOR }}>
                <span className="font-medium">Student:</span> {student.firstName} {student.lastName}
              </p>
              <p className="text-sm" style={{ color: TEXT_COLOR }}>
                <span className="font-medium">Course:</span> {student.course}
              </p>
            </div>
          </div>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form className="grid grid-cols-1 gap-4 text-[15px]" style={{ color: TEXT_COLOR }}>
              <InputField 
                label="Position" 
                name="position" 
                disabled={!isUpdateMode}
                placeholder="Enter position"
              />

              <InputField 
                label="Company Name" 
                name="companyName" 
                disabled={!isUpdateMode}
                placeholder="Enter company name"
              />

              <InputField 
                label="Head Office" 
                name="headOffice" 
                placeholder="Enter head office location"
              />

          {/* Company Logo Upload */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2" style={{ color: TEXT_COLOR }}>
              Company Logo {!isUpdateMode ? '*' : '(Optional)'}
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCompanyLogoFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                required={!isUpdateMode}
                id="companyLogo"
              />
              <div className={`h-12 border-2 border-dashed rounded-md flex items-center px-3 transition-colors ${companyLogoFile
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-[#FDA92D] hover:bg-orange-50'
                }`}>
                <div className="flex items-center gap-2 w-full">
                  {companyLogoFile ? (
                    <>
                      <IoDocumentTextOutline className="text-green-500" size={20} />
                      <span className="text-sm text-green-700 truncate flex-1">
                        {companyLogoFile.name}
                      </span>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        Selected
                      </span>
                    </>
                  ) : (
                    <>
                      <IoCloudUploadOutline className="text-gray-400" size={20} />
                      <span className="text-sm text-gray-500">
                        Choose company logo or drag and drop
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        JPG, PNG
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Student Image Upload */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2" style={{ color: TEXT_COLOR }}>
              Student Image {!isUpdateMode ? '*' : '(Optional)'}
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setStudentImageFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                required={!isUpdateMode}
                id="studentImage"
              />
              <div className={`h-12 border-2 border-dashed rounded-md flex items-center px-3 transition-colors ${studentImageFile
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-[#FDA92D] hover:bg-orange-50'
                }`}>
                <div className="flex items-center gap-2 w-full">
                  {studentImageFile ? (
                    <>
                      <IoDocumentTextOutline className="text-green-500" size={20} />
                      <span className="text-sm text-green-700 truncate flex-1">
                        {studentImageFile.name}
                      </span>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        Selected
                      </span>
                    </>
                  ) : (
                    <>
                      <IoCloudUploadOutline className="text-gray-400" size={20} />
                      <span className="text-sm text-gray-500">
                        Choose student image or drag and drop
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        JPG, PNG
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

              {/* Submit Button */}
              <div className="mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full h-12 rounded-md transition disabled:opacity-50 ${buttonStyles.primary}`}
                >
                  {isSubmitting ? (isUpdateMode ? "Updating Post..." : "Creating Post...") : (isUpdateMode ? "Update Post" : "Create Post")}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </BlurBackground>
    </>
  );
};

export default CreatePostModal;