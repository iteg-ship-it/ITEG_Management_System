/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* UpdateTechnologyModal.jsx */
/* eslint-disable react/prop-types */
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { useUpdateTechnologyMutation } from "../../redux/api/authApi";
import CustomDropdown from "../common-components/common-feild/CustomDropdown";
import { buttonStyles } from "../../styles/buttonStyles";

const UpdateTechnologyModal = ({ isOpen, onClose, studentId }) => {
    const [updateTechnology, { isLoading }] = useUpdateTechnologyMutation();
    const [showCustomInput, setShowCustomInput] = useState(false);

    const techOptions = [
        { value: "Python (AI/ML)", label: "Python (AI/ML)" },
        { value: "UI/UX Design", label: "UI/UX Design" },
        { value: "Mern Developer", label: "Mern Developer" },
        { value: "Full Stack Developer", label: "Full Stack Developer" },
        { value: "DevOps Engineer", label: "DevOps Engineer" },
        { value: "Digital Marketing", label: "Digital Marketing" },
        { value: "Others", label: "Others" }
    ];

    const techSchema = Yup.object().shape({
        techno: Yup.string().required("Technology is required"),
        customTechno: Yup.string().when('techno', {
            is: 'Others',
            then: (schema) => schema.required("Please specify the technology"),
            otherwise: (schema) => schema.notRequired()
        })
    });

    const initialValues = {
        techno: "",
        customTechno: ""
    };

    const handleSubmit = async (values, actions) => {
        try {
            if (!studentId) {
                toast.error("Student ID missing!");
                return;
            }

            const finalTechno = values.techno === "Others" ? values.customTechno : values.techno;
            await updateTechnology({ id: studentId, techno: finalTechno }).unwrap();
            toast.success("Technology updated successfully!");
            actions.resetForm();
            setShowCustomInput(false);
            onClose();
        } catch (err) {
            console.error("Error updating technology", err);
            toast.error(err?.data?.message || "Update failed");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl py-4 px-6 w-full max-w-lg relative">
                <h2 className="text-2xl font-semibold text-center mb-6 text-[var(--primary)]">Update Technology</h2>

                <TechnologyForm
                    initialValues={initialValues}
                    techSchema={techSchema}
                    handleSubmit={handleSubmit}
                    techOptions={techOptions}
                    showCustomInput={showCustomInput}
                    setShowCustomInput={setShowCustomInput}
                    isLoading={isLoading}
                    onClose={onClose}
                />

                <button
                    onClick={() => {
                        setShowCustomInput(false);
                        onClose();
                    }}
                    className="absolute top-3 right-3 text-xl text-gray-400 hover:text-gray-700"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

// Separate component to handle the form logic
const TechnologyForm = ({ initialValues, techSchema, handleSubmit, techOptions, showCustomInput, setShowCustomInput, isLoading }) => {
    return (
        <Formik
            initialValues={initialValues}
            validationSchema={techSchema}
            onSubmit={handleSubmit}
        >
            {({ values, handleChange, touched, errors, setFieldValue }) => {
                // Watch for techno field changes
                useEffect(() => {
                    setShowCustomInput(values.techno === "Others");
                    if (values.techno !== "Others") {
                        setFieldValue('customTechno', "");
                    }
                }, [values.techno, setFieldValue, setShowCustomInput]);

                return (
                    <Form>
                        <div className="grid grid-cols-1 gap-4">
                            {/* Technology Dropdown */}
                            <CustomDropdown
                                name="techno"
                                label="Technology"
                                options={techOptions}
                            />

                            {/* Custom Technology Input - Only show when "Others" is selected */}
                            {showCustomInput && (
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        name="customTechno"
                                        value={values.customTechno}
                                        onChange={handleChange}
                                        className="peer h-12 w-full border border-gray-300 rounded-md px-3 py-2 leading-tight focus:outline-none focus:border-black focus:ring-0 transition-all duration-200"
                                        placeholder=" "
                                    />
                                    <label className="absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none text-xs -top-2 text-black">
                                        Custom Technology
                                    </label>
                                    {touched.customTechno && errors.customTechno && (
                                        <p className="text-sm text-red-500">{errors.customTechno}</p>
                                    )}
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="mt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyles.primary}`}
                                >
                                    {isLoading ? "Updating..." : "Update"}
                                </button>
                            </div>
                        </div>
                    </Form>
                );
            }}
        </Formik>
    );
};

export default UpdateTechnologyModal;
