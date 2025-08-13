/* eslint-disable react/prop-types */
import { useState } from "react";
import { useUpdatePlacementMutation } from "../../redux/api/authApi";
import { toast } from "react-toastify";

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
        <h2 className="text-xl font-bold text-center text-orange-500 mb-4">Update Placement Info</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Company Name */}
          <div className="col-span-2 md:col-span-1">
            <div className="relative w-full">
              <input
                type="text"
                value={placementData.companyName}
                onChange={(e) =>
                  setPlacementData((prev) => ({ ...prev, companyName: e.target.value }))
                }
                className="peer h-12 w-full border border-gray-300 rounded-md px-3 py-2 leading-tight focus:outline-none focus:border-[#FDA92D] focus:ring-0 transition-all duration-200"
                placeholder=" "
              />
              <label className="absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none text-xs -top-2 text-black">
                Company Name
              </label>
            </div>
          </div>

          {/* Job Profile */}
          <div className="col-span-2 md:col-span-1">
            <div className="relative w-full">
              <input
                type="text"
                value={placementData.jobProfile}
                onChange={(e) =>
                  setPlacementData((prev) => ({ ...prev, jobProfile: e.target.value }))
                }
                className="peer h-12 w-full border border-gray-300 rounded-md px-3 py-2 leading-tight focus:outline-none focus:border-[#FDA92D] focus:ring-0 transition-all duration-200"
                placeholder=" "
              />
              <label className="absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none text-xs -top-2 text-black">
                Job Profile
              </label>
            </div>
          </div>

          {/* Salary */}
          <div className="col-span-2 md:col-span-1">
            <div className="relative w-full">
              <input
                type="text"
                value={placementData.salary}
                onChange={(e) =>
                  setPlacementData((prev) => ({ ...prev, salary: e.target.value }))
                }
                className="peer h-12 w-full border border-gray-300 rounded-md px-3 py-2 leading-tight focus:outline-none focus:border-[#FDA92D] focus:ring-0 transition-all duration-200"
                placeholder=" "
              />
              <label className="absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none text-xs -top-2 text-black">
                Salary
              </label>
            </div>
          </div>

          {/* Location */}
          <div className="col-span-2 md:col-span-1">
            <div className="relative w-full">
              <input
                type="text"
                value={placementData.location}
                onChange={(e) =>
                  setPlacementData((prev) => ({ ...prev, location: e.target.value }))
                }
                className="peer h-12 w-full border border-gray-300 rounded-md px-3 py-2 leading-tight focus:outline-none focus:border-[#FDA92D] focus:ring-0 transition-all duration-200"
                placeholder=" "
              />
              <label className="absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none text-xs -top-2 text-black">
                Location
              </label>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="col-span-2 flex justify-center mt-4 gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="bg-[#FDA92D]  text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
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