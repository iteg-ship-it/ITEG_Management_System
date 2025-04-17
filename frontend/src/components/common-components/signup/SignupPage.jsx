import React from "react";
import ReusableForm from "../../../ReusableForm";
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
      <div className="w-full px-8 md:flex  justify-between">
        <div className="flex">
          <img
            className="h-28 object-cover object-fit"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBjw8YBC_nn5QPHaP3T1IfWTQTQ6dASsbwpA&s"
            alt="Placeholder"
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
      <div className="bg-sky-900 w-full h-1 mx-8 "></div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange }) => (
          <Form className="bg-white p-8 rounded-lg  w-full ">
            <h2 className="text-3xl font-bold mb-6 ">Personal Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <Field
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  className="input-style"
                />
                <ErrorMessage
                  name="firstName"
                  component="p"
                  className="text-red-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Field
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  className="input-style"
                />
                <ErrorMessage
                  name="lastName"
                  component="p"
                  className="text-red-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gender <span className="text-red-500">*</span>
                </label>
                <Field as="select" name="gender" className="input-style">
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Field>
                <ErrorMessage
                  name="gender"
                  component="p"
                  className="text-red-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <Field
                  type="text"
                  name="contactNumber"
                  placeholder="Contact Number"
                  className="input-style"
                />
                <ErrorMessage
                  name="contactNumber"
                  component="p"
                  className="text-red-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Father's Name <span className="text-red-500">*</span>
                </label>
                <Field
                  type="text"
                  name="fathersName"
                  placeholder="Father's Name"
                  className="input-style"
                />
                <ErrorMessage
                  name="fathersName"
                  component="p"
                  className="text-red-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Father's Contact <span className="text-red-500">*</span>
                </label>
                <Field
                  type="text"
                  name="fathersContact"
                  placeholder="Father's Contact"
                  className="input-style"
                />
                <ErrorMessage
                  name="fathersContact"
                  component="p"
                  className="text-red-500 text-sm font-semibold"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Address <span className="text-red-500">*</span>
                </label>
                <Field
                  type="text"
                  name="address"
                  placeholder="Address"
                  className="input-style"
                />
                <ErrorMessage
                  name="address"
                  component="p"
                  className="text-red-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block pt-4 text-sm font-medium text-gray-700">
                  Select Track <span className="text-red-500">*</span>
                </label>
                <Field as="select" name="track" className="input-style">
                  <option value="">Select Track</option>
                  <option value="track1">Track 1</option>
                  <option value="track2">Track 2</option>
                  <option value="Gopalpur">Gopalpur</option>
                  <option value="Narshullaganj">Narshullaganj</option>
                </Field>
                <ErrorMessage
                  name="track"
                  component="p"
                  className="text-red-500 text-sm font-semibold"
                />
              </div>
            </div>

            <h2 className="text-3xl font-bold my-6 w-full">Academic details</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  12th Subject <span className="text-red-500">*</span>
                </label>
                <Field
                  type="text"
                  name="twelfthSubject"
                  placeholder="12th Subject"
                  className="input-style"
                />
                <ErrorMessage
                  name="twelfthSubject"
                  component="p"
                  className="text-red-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  12th Percentage <span className="text-red-500">*</span>
                </label>
                <Field
                  type="text"
                  name="twelfthPercentage"
                  placeholder="12th Percentage"
                  className="input-style"
                />
                <ErrorMessage
                  name="twelfthPercentage"
                  component="p"
                  className="text-red-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  10th Percentage <span className="text-red-500">*</span>
                </label>
                <Field
                  type="text"
                  name="tenthPercentage"
                  placeholder="10th Percentage"
                  className="input-style"
                />
                <ErrorMessage
                  name="tenthPercentage"
                  component="p"
                  className="text-red-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  12th Passout Year <span className="text-red-500">*</span>
                </label>
                <Field
                  type="date"
                  name="twelfthPassoutYear"
                  className="input-style"
                />
                <ErrorMessage
                  name="twelfthPassoutYear"
                  component="p"
                  className="text-red-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  What do you want to do here{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="mt-2 space-x-8">
                  <label className="inline-flex items-center">
                    <Field
                      type="radio"
                      name="courseOrDiploma"
                      value="course"
                      className="form-radio h-4 w-4 text-red-600 accent-red-600 border-gray-300"
                    />
                    <span className="ml-2">Course</span>
                  </label>
                  <label className="inline-flex items-center">
                    <Field
                      type="radio"
                      name="courseOrDiploma"
                      value="diploma"
                      className="form-radio h-4 w-4 text-red-600 accent-red-600 border-gray-300"
                    />
                    <span className="ml-2">Diploma</span>
                  </label>
                </div>
                <ErrorMessage
                  name="courseOrDiploma"
                  component="p"
                  className="text-red-500 text-sm font-semibold"
                />
              </div>
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
        )}
      </Formik>
    </div>
  );
};

export default SignupPage;

// import React from "react";
// import logo from "../../../assets/images/logo.png"; // Make sure path is correct

// const SignupPage = () => {
//   return (
//     <div className="flex flex-col md:flex-row h-screen bg-white">
//       {" "}
//       {/* Full screen, column on mobile, row on medium+ */}
//       {/* First Column (Left on larger screens) */}
//       <div className="md:w-1/2 md:p-16 p-8 flex items-center justify-center">
//         <div className="w-full md:w-96">
//           {" "}
//           {/* Container for form content */}
//           <div className="flex justify-center mb-6">
//             <img src={logo} alt="logo" className="h-16 w-auto" />
//           </div>
//           <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>
//           <div className="mb-4 flex space-x-2">
//             <div className="w-1/2">
//               <label
//                 htmlFor="firstName"
//                 className="block text-gray-700 text-sm font-bold mb-2"
//               >
//                 First Name
//               </label>
//               <input
//                 type="text"
//                 id="firstName"
//                 className="shadow appearance-none border rounded-2xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                 placeholder="First Name"
//               />
//             </div>
//             <div className="w-1/2">
//               <label
//                 htmlFor="lastName"
//                 className="block text-gray-700 text-sm font-bold mb-2"
//               >
//                 Last Name
//               </label>
//               <input
//                 type="text"
//                 id="lastName"
//                 className="shadow appearance-none border rounded-2xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                 placeholder="Last Name"
//               />
//             </div>
//           </div>
//           <div className="mb-4">
//             <label
//               htmlFor="email"
//               className="block text-gray-700 text-sm font-bold mb-2"
//             >
//               Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               className="shadow appearance-none border rounded-2xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//               placeholder="Enter your email"
//             />
//           </div>
//           <div className="mb-6">
//             <label
//               htmlFor="password"
//               className="block text-gray-700 text-sm font-bold mb-2"
//             >
//               Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               className="shadow appearance-none border rounded-2xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//               placeholder="Enter your password"
//             />
//           </div>
//           <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline w-full">
//             Sign Up
//           </button>
//           <div className="mt-6 text-center">
//             <p className="text-sm">
//               Already have an account?
//               <a
//                 href="#"
//                 className="text-orange-500 hover:text-orange-700 ml-1 focus:outline-none"
//               >
//                 Login
//               </a>
//             </p>
//           </div>
//         </div>
//       </div>
//       {/* Second Column (Right on larger screens) - You can add content here */}
//       <div className="md:w-1/2 md:p-16 p-8 flex items-center justify-center bg-gray-200">
//         {" "}
//         {/* Example background color */}
//         {/* Add your image, information, or other content here */}
//         <div>
//           <h1 className="text-3xl font-bold text-center mb-4">
//             Welcome to Our Platform!
//           </h1>
//           <p className="text-lg text-center">
//             Some descriptive text about your platform or benefits of signing up.
//           </p>
//           {/* <img src={yourImage} alt="Promotional" className="max-w-full h-auto rounded-lg shadow-md"/> */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignupPage;
