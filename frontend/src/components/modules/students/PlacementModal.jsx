/* eslint-disable react/prop-types */
import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "../../shared/form-fields/InputField";
import { useUpdatePlacementMutation } from "../../../redux/api/authApi";
import { toast } from "react-toastify";
import { buttonStyles } from "../../../styles/buttonStyles";
import BlurBackground from "../../shared/BlurBackground";

const PlacementModal = ({ isOpen, onClose, studentId }) => {
  const [updatePlacement] = useUpdatePlacementMutation();

  const validationSchema = Yup.object({
    companyName: Yup.string().required("Company name is required"),
    salary: Yup.string().required("Salary is required"),
    location: Yup.string().required("Location is required"),
    jobProfile: Yup.string().required("Job profile is required")
  });

  const initialValues = {
    companyName: "",
    salary: "",
    location: "",
    jobProfile: ""
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await updatePlacement({ id: studentId, data: values }).unwrap();
      toast.success("Placement updated successfully");
      resetForm();
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update placement");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BlurBackground isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl py-4 px-6 w-full max-w-lg relative">
        <h2 className="text-2xl font-semibold text-center mb-6 text-[var(--primary)]">Update Placement Info</h2>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <InputField label="Company Name" name="companyName" placeholder="Enter company name" />
              </div>

              <div className="col-span-2 md:col-span-1">
                <InputField label="Job Profile" name="jobProfile" placeholder="Enter job profile" />
              </div>

              <div className="col-span-2 md:col-span-1">
                <InputField label="Salary" name="salary" placeholder="Enter salary" />
              </div>

              <div className="col-span-2 md:col-span-1">
                <InputField label="Location" name="location" placeholder="Enter location" />
              </div>

              <div className="col-span-2 mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-lg transition disabled:opacity-50 ${buttonStyles.primary}`}
                >
                  {isSubmitting ? "Updating..." : "Update"}
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



export default PlacementModal;