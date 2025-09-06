/* eslint-disable react/prop-types */
import { useState } from "react";
import { useUpdatePlacementMutation } from "../../redux/api/authApi";
import { toast } from "react-toastify";
import { buttonStyles } from "../../styles/buttonStyles";

const PlacementModal = ({ isOpen, onClose, studentId }) => {
  const [placementData, setPlacementData] = useState({
    companyName: "",
    salary: "",
    location: "",
    jobProfile: "",
  });

  const [updatePlacement] = useUpdatePlacementMutation();

  const handleSubmit = async () => {
    try {
      await updatePlacement({ id: studentId, data: placementData }).unwrap();
      toast.success("Placement updated successfully");
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update placement");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl py-4 px-6 w-full max-w-lg relative">
        <h2 className="text-2xl font-semibold text-center mb-6 text-[var(--primary)]">Update Placement Info</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Company Name */}
          <div className="col-span-2 md:col-span-1">
            <div className="relative w-full">
              <input
                type="text"
                id="companyName"
                value={placementData.companyName}
                onChange={(e) =>
                  setPlacementData((prev) => ({ ...prev, companyName: e.target.value }))
                }
                className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-black w-full peer"
                placeholder=" "
              />
              <label
                htmlFor="companyName"
                className="absolute left-3 top-3 text-gray-500 transition-all duration-200 cursor-text peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black"
              >
                Company Name
              </label>
            </div>
          </div>

          {/* Job Profile */}
          <div className="col-span-2 md:col-span-1">
            <div className="relative w-full">
              <input
                type="text"
                id="jobProfile"
                value={placementData.jobProfile}
                onChange={(e) =>
                  setPlacementData((prev) => ({ ...prev, jobProfile: e.target.value }))
                }
                className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-black w-full peer"
                placeholder=" "
              />
              <label
                htmlFor="jobProfile"
                className="absolute left-3 top-3 text-gray-500 transition-all duration-200 cursor-text peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black"
              >
                Job Profile
              </label>
            </div>
          </div>

          {/* Salary */}
          <div className="col-span-2 md:col-span-1">
            <div className="relative w-full">
              <input
                type="text"
                id="salary"
                value={placementData.salary}
                onChange={(e) =>
                  setPlacementData((prev) => ({ ...prev, salary: e.target.value }))
                }
                className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-black w-full peer"
                placeholder=" "
              />
              <label
                htmlFor="salary"
                className="absolute left-3 top-3 text-gray-500 transition-all duration-200 cursor-text peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black"
              >
                Salary
              </label>
            </div>
          </div>

          {/* Location */}
          <div className="col-span-2 md:col-span-1">
            <div className="relative w-full">
              <input
                type="text"
                id="location"
                value={placementData.location}
                onChange={(e) =>
                  setPlacementData((prev) => ({ ...prev, location: e.target.value }))
                }
                className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-black w-full peer"
                placeholder=" "
              />
              <label
                htmlFor="location"
                className="absolute left-3 top-3 text-gray-500 transition-all duration-200 cursor-text peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black"
              >
                Location
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="col-span-2 mt-4">
            <button
              onClick={handleSubmit}
              className={`w-full py-3 rounded-lg transition ${buttonStyles.primary}`}
            >
              Update
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl text-gray-400 hover:text-gray-700"
        >
          &times;
        </button>
      </div>
    </div>
  );
};



export default PlacementModal;