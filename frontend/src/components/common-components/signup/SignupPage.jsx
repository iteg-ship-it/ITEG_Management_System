

import React from "react";
import { Formik, Form } from "formik";

import {
  TextInput,
  SelectInput,
  RadioInput,
} from "./../../common-feild/FormFields";


import { signupValidationSchema } from "../../../validationSchema";

const SignupPage = () => {
  const initialValues = {
    firstName: "",
    lastName: "",
    gender: "",
    contactNumber: "",
    address: "",
    fathersName: "",
    fathersContact: "",
    track: "",
    twelfthSubject: "",
    twelfthPercentage: "",
    tenthPercentage: "",
    twelfthPassoutYear: "",
    courseOrDiploma: "",
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const response = await axios.post("YOUR_API_ENDPOINT", values);
      alert("Form submitted successfully!");
      resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit the form");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full px-8 md:flex justify-between">
        <div className="flex">
          <img
            className="h-28 object-cover object-fit"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBjw8YBC_nn5QPHaP3T1IfWTQTQ6dASsbwpA&s"
            alt="Logo"
          />
          <div>
           
 <h1 className="text-3xl font-bold mb-6 w-52 mx-8">
              SANT SINGAJI EDUCATIONAL SOCIETY
            </h1>
          </div>
        </div>
        <div className="py-4 md:pt-20">
          <h1 className="text-3xl font-bold text-sky-1000 mx-8 w-full">
            Registration form
          </h1>
        </div>
      </div>
      <div className="bg-sky-900 w-full h-1 mx-8"></div>

      <Formik
        initialValues={initialValues}
        validationSchema={signupValidationSchema}
        onSubmit={handleSubmit}
      >
        <Form className="bg-white p-8 rounded-lg w-full">
          <h2 className="text-3xl font-bold mb-6">Personal Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TextInput label="First Name" name="firstName" />
            <TextInput label="Last Name" name="lastName" />
            <SelectInput
              label="Gender"
              name="gender"
              options={[
                { value: "", label: "Select Gender" },
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ]}
            />
            <TextInput label="Contact Number" name="contactNumber" />
            <TextInput label="Father's Name" name="fathersName" />
            <TextInput label="Father's Contact" name="fathersContact" />
            <TextInput
              label="Address"
              name="address"
              className="col-span-1 md:col-span-2"
            />
            <SelectInput
              label="Select Track"
              name="track"
              options={[
                { value: "", label: "Select Track" },
                { value: "track1", label: "Track 1" },
                { value: "track2", label: "Track 2" },
                { value: "Gopalpur", label: "Gopalpur" },
                { value: "Narshullaganj", label: "Narshullaganj" },
              ]}
            />
          </div>

          <h2 className="text-3xl font-bold my-6 w-full">Academic details</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TextInput label="12th Subject" name="twelfthSubject" />
            <TextInput label="12th Percentage" name="twelfthPercentage" />
            <TextInput label="10th Percentage" name="tenthPercentage" />
            <TextInput
              label="12th Passout Year"
              name="twelfthPassoutYear"
              type="date"
            />
            <RadioInput
              label="What do you want to do here"
              name="courseOrDiploma"
              options={[
                { value: "course", label: "Course" },
                { value: "diploma", label: "Diploma" },
              ]}
              className="col-span-1 md:col-span-2"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="w-40 bg-orange-600 font-bold text-xl text-white py-3 px-4 rounded-full 
                   relative overflow-hidden transition-all duration-300 ease-in-out
                   hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-700
                   hover:scale-105 hover:shadow-[0_0_15px_rgba(255,127,0,0.6)]
                   active:scale-95
                   before:absolute before:top-0 before:left-0 before:w-full before:h-full 
                   before:bg-white/10 before:scale-0 before:rounded-full
                   hover:before:scale-150 hover:before:opacity-0
                   before:transition-all before:duration-500"
            >
              Submit
            </button>
          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default SignupPage;




