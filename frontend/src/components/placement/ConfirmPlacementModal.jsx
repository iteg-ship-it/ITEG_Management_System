import { useState } from "react";
import { IoClose, IoCloudUploadOutline, IoDocumentTextOutline } from "react-icons/io5";

const PRIMARY_COLOR = "#FDA92D";
const TEXT_COLOR = "#4B4B4B";

const ConfirmPlacementModal = ({ isOpen, onClose, student, onSuccess }) => {
  const [applicationFile, setApplicationFile] = useState(null);
  const [offerLetterFile, setOfferLetterFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!applicationFile || !offerLetterFile) {
      alert("Please upload both Application and Offer Letter files");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Here you would implement the API call to confirm placement
      console.log("Confirming placement for student:", student?._id);
      console.log("Application file:", applicationFile);
      console.log("Offer letter file:", offerLetterFile);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess?.();
      onClose();
      
      // Reset form
      setApplicationFile(null);
      setOfferLetterFile(null);
    } catch (error) {
      console.error("Error confirming placement:", error);
      alert("Error confirming placement. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setApplicationFile(null);
    setOfferLetterFile(null);
    onClose();
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
              className="w-full h-12 rounded-md text-white hover:opacity-90 transition disabled:opacity-50"
              style={{ backgroundColor: PRIMARY_COLOR }}
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