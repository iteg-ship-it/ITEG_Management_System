/* eslint-disable react/prop-types */
import { useState } from "react";
import { useUpdatePlacementMutation } from "../../redux/api/authApi";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";

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
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fadeIn relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-2xl font-semibold text-gray-800">
            Update Placement Info
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-2xl"
          >
            <IoClose />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <FormField
            label="Company Name"
            value={placementData.companyName}
            onChange={(e) =>
              setPlacementData((prev) => ({ ...prev, companyName: e.target.value }))
            }
          />
          <FormField
            label="Job Profile"
            value={placementData.jobProfile}
            onChange={(e) =>
              setPlacementData((prev) => ({ ...prev, jobProfile: e.target.value }))
            }
          />
          <FormField
            label="Salary"
            value={placementData.salary}
            onChange={(e) =>
              setPlacementData((prev) => ({ ...prev, salary: e.target.value }))
            }
          />
          <FormField
            label="Location"
            value={placementData.location}
            onChange={(e) =>
              setPlacementData((prev) => ({ ...prev, location: e.target.value }))
            }
          />
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable input field component
const FormField = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
    />
  </div>
);

export default PlacementModal;





// /* eslint-disable react/prop-types */
// import { useState } from "react";
// import { useUpdatePlacementMutation } from "../../redux/api/authApi";
// import { toast } from "react-toastify";

// const PlacementModal = ({ isOpen, onClose, studentId }) => {
//     const [placementData, setPlacementData] = useState({
//         companyName: "",
//         salary: "",
//         location: "",
//         jobProfile: "",
//     });

//     const [updatePlacement] = useUpdatePlacementMutation();

//     const handleSubmit = async () => {
//         try {
//             await updatePlacement({ id: studentId, data: placementData }).unwrap();
//             toast.success("Placement updated successfully");
//             onClose();
//         } catch (error) {
//             toast.error(error?.data?.message || "Failed to update placement");
//         }
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
//             <div className="bg-white p-6 rounded-md w-full max-w-xl shadow-lg">
//                 <h2 className="text-xl font-bold mb-4">Update Placement Info</h2>

//                 <label className="block font-medium">Company Name</label>
//                 <input
//                     type="text"
//                     value={placementData.companyName}
//                     onChange={(e) =>
//                         setPlacementData((prev) => ({ ...prev, companyName: e.target.value }))
//                     }
//                     className="w-full border p-2 rounded"
//                 />

//                 <label className="block mt-4 font-medium">Job Profile</label>
//                 <input
//                     type="text"
//                     value={placementData.jobProfile}
//                     onChange={(e) =>
//                         setPlacementData((prev) => ({ ...prev, jobProfile: e.target.value }))
//                     }
//                     className="w-full border p-2 rounded"
//                 />

//                 <label className="block mt-4 font-medium">Salary</label>
//                 <input
//                     type="text"
//                     value={placementData.salary}
//                     onChange={(e) =>
//                         setPlacementData((prev) => ({ ...prev, salary: e.target.value }))
//                     }
//                     className="w-full border p-2 rounded"
//                 />

//                 <label className="block mt-4 font-medium">Location</label>
//                 <input
//                     type="text"
//                     value={placementData.location}
//                     onChange={(e) =>
//                         setPlacementData((prev) => ({ ...prev, location: e.target.value }))
//                     }
//                     className="w-full border p-2 rounded"
//                 />

//                 <div className="mt-6 flex justify-end gap-2">
//                     <button onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded">
//                         Cancel
//                     </button>
//                     <button
//                         onClick={handleSubmit}
//                         className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//                     >
//                         Update
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default PlacementModal;
