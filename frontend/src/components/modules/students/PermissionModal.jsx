/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "../../shared/form-fields/InputField";
import { useUpdatePermissionMutation } from "../../../redux/api/authApi";
import { toast } from "react-toastify";
import imageCompression from "browser-image-compression";
import { buttonStyles } from "../../../styles/buttonStyles";
import BlurBackground from "../../shared/BlurBackground";

const PermissionModal = ({ isOpen, onClose, studentId }) => {
    const [imageURL, setImageURL] = useState("");
    const [currentUser, setCurrentUser] = useState("");
    const [updatePermission] = useUpdatePermissionMutation();

    const validationSchema = Yup.object({
        approved_by: Yup.string().required("Approver is required"),
        remark: Yup.string()
    });

    const initialValues = {
        approved_by: "admin",
        remark: ""
    };

    // Get current logged-in user
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userName = user.name || "Unknown User";
        setCurrentUser(userName);
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const options = {
            maxSizeMB: 0.3,
            maxWidthOrHeight: 600,
            useWebWorker: true,
        };

        try {
            const compressedFile = await imageCompression(file, options);
            const base64 = await imageCompression.getDataUrlFromFile(compressedFile);
            setImageURL(base64);
        } catch (err) {
            toast.error("Image compression failed.", err.message);
        }
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        if (!imageURL) {
            toast.error("Please upload an image");
            setSubmitting(false);
            return;
        }

        if (!studentId) {
            toast.error("Student ID is missing");
            setSubmitting(false);
            return;
        }

        try {
            const permissionData = {
                imageURL,
                remark: values.remark,
                approved_by: values.approved_by,
                requested_by: currentUser
            };

            await updatePermission({ id: studentId, data: permissionData }).unwrap();
            toast.success("Permission updated successfully");
            resetForm();
            setImageURL("");
            onClose();
            window.location.reload();
        } catch (error) {
            console.error('Form submission error:', error);
            toast.error(error?.data?.message || error?.message || "Failed to update permission");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <BlurBackground isOpen={isOpen} onClose={onClose}>
            <div className="bg-white rounded-xl py-4 px-6 w-full max-w-lg relative">
                <h2 className="text-2xl font-semibold text-center mb-6 text-[var(--primary)]"
                >Permission Request Form</h2>

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Current User Field */}
                            <div className="col-span-2 md:col-span-1">
                                <InputField 
                                    label="Requested By" 
                                    name="requested_by" 
                                    value={currentUser}
                                    disabled
                                    placeholder="Current user"
                                />
                            </div>

                            {/* Approver Role */}
                            <div className="col-span-2 md:col-span-1">
                                <InputField 
                                    label="Approved By" 
                                    name="approved_by" 
                                    type="select"
                                    options={[
                                        { value: "super admin", label: "Super Admin" },
                                        { value: "admin", label: "Admin" },
                                        { value: "faculty", label: "Faculty" }
                                    ]}
                                    placeholder="Select approver"
                                />
                            </div>

                            {/* Signature Upload */}
                            <div className="col-span-2">
                                <div className="relative w-full">
                                    <div
                                        onClick={() => document.getElementById('uploadSignature').click()}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const files = e.dataTransfer.files;
                                            if (files.length > 0) {
                                                handleImageUpload({ target: { files } });
                                            }
                                        }}
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors duration-200 bg-gray-50"
                                    >
                                        <div className="flex flex-col items-center space-y-2">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <div>
                                                <span className="text-blue-600 font-medium">Choose application file</span>
                                                <span className="text-gray-500"> or drag and drop</span>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                PDF, DOC, DOCX
                                            </div>
                                        </div>
                                        {imageURL && (
                                            <div className="mt-2 text-green-600 text-sm">
                                                ✓ File uploaded successfully
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        id="uploadSignature"
                                        accept="image/*,.pdf,.doc,.docx"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    <label className="absolute left-3 -top-2 text-xs bg-white px-1 text-black pointer-events-none">
                                        Upload Signature <span className="text-red-500">*</span>
                                    </label>
                                </div>
                                {imageURL && (
                                    <div className="mt-3 p-2 border rounded-lg bg-gray-50">
                                        <img
                                            src={imageURL}
                                            alt="Signature Preview"
                                            className="h-20 w-full object-contain rounded"
                                        />
                                        <p className="text-xs text-gray-600 text-center mt-1">Signature Preview</p>
                                    </div>
                                )}
                            </div>

                            {/* Remark Field */}
                            <div className="col-span-2">
                                <InputField 
                                    label="Remark / Reason" 
                                    name="remark" 
                                    type="textarea"
                                    placeholder="Enter remark or reason for permission"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="col-span-2 mt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyles.primary}`}
                                >
                                    {isSubmitting ? "Submitting..." : "Submit"}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-xl text-gray-400 hover:text-gray-700"
                >
                    &times;
                </button>
            </div>
        </BlurBackground>
    );
};

export default PermissionModal;
