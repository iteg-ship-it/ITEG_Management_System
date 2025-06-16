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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-md w-full max-w-xl shadow-lg">
                <h2 className="text-xl font-bold mb-4">Update Placement Info</h2>

                <label className="block font-medium">Company Name</label>
                <input
                    type="text"
                    value={placementData.companyName}
                    onChange={(e) =>
                        setPlacementData((prev) => ({ ...prev, companyName: e.target.value }))
                    }
                    className="w-full border p-2 rounded"
                />

                <label className="block mt-4 font-medium">Job Profile</label>
                <input
                    type="text"
                    value={placementData.jobProfile}
                    onChange={(e) =>
                        setPlacementData((prev) => ({ ...prev, jobProfile: e.target.value }))
                    }
                    className="w-full border p-2 rounded"
                />

                <label className="block mt-4 font-medium">Salary</label>
                <input
                    type="text"
                    value={placementData.salary}
                    onChange={(e) =>
                        setPlacementData((prev) => ({ ...prev, salary: e.target.value }))
                    }
                    className="w-full border p-2 rounded"
                />

                <label className="block mt-4 font-medium">Location</label>
                <input
                    type="text"
                    value={placementData.location}
                    onChange={(e) =>
                        setPlacementData((prev) => ({ ...prev, location: e.target.value }))
                    }
                    className="w-full border p-2 rounded"
                />

                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlacementModal;
