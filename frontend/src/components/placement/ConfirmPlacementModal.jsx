/* eslint-disable react/prop-types */
import { useState } from "react";
import { IoClose, IoCloudUploadOutline, IoDocumentTextOutline } from "react-icons/io5";
import { useConfirmPlacementMutation } from "../../redux/api/authApi";
import { toast } from "react-toastify";
import CustomDatePicker from "../student-records/CustomDatePicker";
import { buttonStyles } from "../../styles/buttonStyles";

const PRIMARY_COLOR = "#FDA92D";
const TEXT_COLOR = "#4B4B4B";

const ConfirmPlacementModal = ({ isOpen, onClose, student, onSuccess }) => {
  const [formData, setFormData] = useState({
    companyName: "",
    salary: "",
    location: "",
    jobProfile: "",
    jobType: "",
    joiningDate: ""
  });
  const [applicationFile, setApplicationFile] = useState(null);
  const [offerLetterFile, setOfferLetterFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmPlacement] = useConfirmPlacementMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!applicationFile || !offerLetterFile) {
      toast.error("Please upload both Application and Offer Letter files");
      return;
    }

    // Validate required fields
    const requiredFields = ['companyName', 'salary', 'location', 'jobProfile', 'jobType', 'joiningDate'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      const placementData = new FormData();
      
      // Add studentId
      placementData.append('studentId', student?._id);
      
      // Add form fields
      placementData.append('companyName', formData.companyName);
      placementData.append('salary', formData.salary);
      placementData.append('location', formData.location);
      placementData.append('jobProfile', formData.jobProfile);
      placementData.append('jobType', formData.jobType);
      placementData.append('joiningDate', formData.joiningDate);
      
      // Add files
      placementData.append('applicationFile', applicationFile);
      placementData.append('offerLetterFile', offerLetterFile);
      
      await confirmPlacement(placementData).unwrap();
      
      toast.success("Placement confirmed successfully!");
      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        companyName: "",
        salary: "",
        location: "",
        jobProfile: "",
        jobType: "",
        joiningDate: ""
      });
      setApplicationFile(null);
      setOfferLetterFile(null);
    } catch (error) {
      console.error("Error confirming placement:", error);
      toast.error(error?.data?.message || "Error confirming placement. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      companyName: "",
      salary: "",
      location: "",
      jobProfile: "",
      jobType: "",
      joiningDate: ""
    });
    setApplicationFile(null);
    setOfferLetterFile(null);
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-lg p-8 relative">
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
          Confirm Placement
        </h2>

        {/* Student Info */}
        {student && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center">
              <p className="text-sm" style={{ color: TEXT_COLOR }}>
                <span className="font-medium">Student:</span> {student.firstName} {student.lastName}
              </p>
              <p className="text-sm" style={{ color: TEXT_COLOR }}>
                <span className="font-medium">Email:</span> {student.email}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 text-[15px]" style={{ color: TEXT_COLOR }}>
          {/* Company Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full peer"
                placeholder=" "
                required
              />
              <label 
                htmlFor="companyName"
                className="absolute left-3 top-3 text-gray-500 transition-all duration-200 cursor-text peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black"
              >
                Company Name *
              </label>
            </div>

            {/* Salary */}
            <div className="relative">
              <input
                type="number"
                id="salary"
                value={formData.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
                className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full peer"
                placeholder=" "
                required
              />
              <label 
                htmlFor="salary"
                className="absolute left-3 top-3 text-gray-500 transition-all duration-200 cursor-text peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black"
              >
                Yearly Salary *
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location */}
            <div className="relative">
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full peer"
                placeholder=" "
                required
              />
              <label 
                htmlFor="location"
                className="absolute left-3 top-3 text-gray-500 transition-all duration-200 cursor-text peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black"
              >
                Location *
              </label>
            </div>

            {/* Job Profile */}
            <div className="relative">
              <input
                type="text"
                id="jobProfile"
                value={formData.jobProfile}
                onChange={(e) => handleInputChange('jobProfile', e.target.value)}
                className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full peer"
                placeholder=" "
                required
              />
              <label 
                htmlFor="jobProfile"
                className="absolute left-3 top-3 text-gray-500 transition-all duration-200 cursor-text peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black"
              >
                Job Profile *
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Job Type */}
            <div className="relative">
              <select
                id="jobType"
                value={formData.jobType}
                onChange={(e) => handleInputChange('jobType', e.target.value)}
                className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full peer bg-white"
                required
              >
                <option value="">Select Job Type</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
              <label 
                htmlFor="jobType"
                className="absolute left-3 -top-2 text-xs bg-white px-1 text-black"
              >
                Job Type *
              </label>
            </div>

            {/* Joining Date */}
            <div className="relative">
              <CustomDatePicker
                name="joiningDate"
                value={formData.joiningDate}
                onChange={({ name, value }) => handleInputChange(name, value)}
                allowFuture={true}
              />
              <label className="absolute left-3 -top-2 text-xs bg-white px-1 text-black">
                Joining Date *
              </label>
            </div>
          </div>
          {/* Application Upload */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2" style={{ color: TEXT_COLOR }}>
              Application Upload *
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setApplicationFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                required
                id="applicationFile"
              />
              <div className={`h-12 border-2 border-dashed rounded-md flex items-center px-3 transition-colors ${
                applicationFile 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-gray-300 hover:border-[#FDA92D] hover:bg-orange-50'
              }`}>
                <div className="flex items-center gap-2 w-full">
                  {applicationFile ? (
                    <>
                      <IoDocumentTextOutline className="text-green-500" size={20} />
                      <span className="text-sm text-green-700 truncate flex-1">
                        {applicationFile.name}
                      </span>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        Selected
                      </span>
                    </>
                  ) : (
                    <>
                      <IoCloudUploadOutline className="text-gray-400" size={20} />
                      <span className="text-sm text-gray-500">
                        Choose application file or drag and drop
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        PDF, DOC, DOCX
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Offer Letter Upload */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2" style={{ color: TEXT_COLOR }}>
              Offer Letter Upload *
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setOfferLetterFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                required
                id="offerLetterFile"
              />
              <div className={`h-12 border-2 border-dashed rounded-md flex items-center px-3 transition-colors ${
                offerLetterFile 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-gray-300 hover:border-[#FDA92D] hover:bg-orange-50'
              }`}>
                <div className="flex items-center gap-2 w-full">
                  {offerLetterFile ? (
                    <>
                      <IoDocumentTextOutline className="text-green-500" size={20} />
                      <span className="text-sm text-green-700 truncate flex-1">
                        {offerLetterFile.name}
                      </span>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        Selected
                      </span>
                    </>
                  ) : (
                    <>
                      <IoCloudUploadOutline className="text-gray-400" size={20} />
                      <span className="text-sm text-gray-500">
                        Choose offer letter file or drag and drop
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        PDF, DOC, DOCX
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
              {isSubmitting ? "Confirming..." : "Confirm Placement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmPlacementModal;