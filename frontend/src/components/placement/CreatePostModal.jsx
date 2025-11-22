/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { IoClose, IoCloudUploadOutline, IoDocumentTextOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { useCreatePlacementPostMutation } from "../../redux/api/authApi";
import { buttonStyles } from "../../styles/buttonStyles";
import BlurBackground from "../common-components/BlurBackground";

const PRIMARY_COLOR = "#FDA92D";
const TEXT_COLOR = "#4B4B4B";

const CreatePostModal = ({ isOpen, onClose, student, onSuccess }) => {
  const [formData, setFormData] = useState({
    position: "",
    companyName: "",
    headOffice: ""
  });
  const [companyLogoFile, setCompanyLogoFile] = useState(null);
  const [studentImageFile, setStudentImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createPlacementPost] = useCreatePlacementPostMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyLogoFile || !studentImageFile) {
      toast.error("Please upload both company logo and student image");
      return;
    }

    if (!formData.headOffice) {
      toast.error("Please fill in head office location");
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert files to base64
      const companyLogoBase64 = await fileToBase64(companyLogoFile);
      const studentImageBase64 = await fileToBase64(studentImageFile);

      const postData = {
        studentId: student._id,
        position: formData.position,
        companyName: formData.companyName,
        companyLogo: companyLogoBase64,
        headOffice: formData.headOffice,
        studentImage: studentImageBase64
      };

      // Call API to create placement post
      await createPlacementPost(postData).unwrap();

      toast.success("Placement post created successfully!");
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error creating placement post:", error);
      toast.error("Error creating placement post. Please try again.");
    } finally {
      setIsSubmitting(false);
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
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      position: student?.placedInfo?.jobProfile || "",
      companyName: student?.placedInfo?.companyName || "",
      headOffice: ""
    });
    setCompanyLogoFile(null);
    setStudentImageFile(null);
  };

  // Update form data when student prop changes
  useEffect(() => {
    if (student?.placedInfo) {
      setFormData({
        position: student.placedInfo.jobProfile || "",
        companyName: student.placedInfo.companyName || "",
        headOffice: ""
      });
    }
  }, [student]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  if (!isOpen) return null;

  return (
    <BlurBackground isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-lg p-8 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <IoClose size={22} />
        </button>

        {/* Title */}
        <h2
          className="text-2xl font-semibold text-center mb-6"
          style={{ color: PRIMARY_COLOR }}
        >
          Create Placement Post
        </h2>

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

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 text-[15px]" style={{ color: TEXT_COLOR }}>
          {/* Position (Auto-filled) */}
          <div className="relative">
            <input
              type="text"
              id="position"
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full peer"
              placeholder=" "
              required
              readOnly
            />
            <label
              htmlFor="position"
              className="absolute left-3 -top-2 text-xs bg-white px-1 text-black"
            >
              Position *
            </label>
          </div>

          {/* Company Name (Auto-filled) */}
          <div className="relative">
            <input
              type="text"
              id="companyName"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full peer"
              placeholder=" "
              required
              readOnly
            />
            <label
              htmlFor="companyName"
              className="absolute left-3 -top-2 text-xs bg-white px-1 text-black"
            >
              Company Name *
            </label>
          </div>

          {/* Head Office */}
          <div className="relative">
            <input
              type="text"
              id="headOffice"
              value={formData.headOffice}
              onChange={(e) => handleInputChange('headOffice', e.target.value)}
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full peer"
              placeholder=" "
              required
            />
            <label
              htmlFor="headOffice"
              className="absolute left-3 top-3 text-gray-500 transition-all duration-200 cursor-text peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black"
            >
              Head Office *
            </label>
          </div>

          {/* Company Logo Upload */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2" style={{ color: TEXT_COLOR }}>
              Company Logo *
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCompanyLogoFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                required
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
              Student Image *
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setStudentImageFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                required
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
              {isSubmitting ? "Creating Post..." : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </BlurBackground>
  );
};

export default CreatePostModal;