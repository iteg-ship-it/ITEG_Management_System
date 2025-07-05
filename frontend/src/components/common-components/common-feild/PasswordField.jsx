/* eslint-disable react/prop-types */
import { useState } from "react";
import { useField } from "formik";
import { Eye, EyeOff } from "lucide-react"; // Make sure lucide-react is installed

const PasswordField = ({ name, password }) => {
  const [field, meta] = useField(name);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative mb-2">
      <input
        type={showPassword ? "text" : "password"}
        {...field}
        placeholder={password}
        className="w-full p-3 border rounded-2xl focus:outline-none bg-gray-100 focus:ring-2 pr-10"
      />

      {/* Eye toggle icon */}
      <div
        className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500 cursor-pointer"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </div>

      {meta.touched && meta.error && (
        <p className="text-red-500 text-sm mt-1">{meta.error}</p>
      )}
    </div>
  );
};

export default PasswordField;




// /* eslint-disable react/prop-types */
// import { useField } from "formik";

// const PasswordField = ({ name, password }) => {
//   const [field, meta] = useField(name); // ✅ Use dynamic name

//   return (
//     <>
//       <input
//         type="password"
//         {...field}
//         placeholder={password}
//         className="w-full p-3 mb-1 border rounded-2xl focus:outline-none bg-gray-100 focus:ring-2"
//       />
//       {meta.touched && meta.error && (
//         <p className="text-red-500 text-sm mb-2">{meta.error}</p>
//       )}
//     </>
//   );
// };

// export default PasswordField;




// // import { useField } from "formik";

// // const PasswordField = ({ password }) => {
// //   const [field, meta] = useField("password");

// //   return (
// //     <>
// //       <input
// //         type="password"
// //         {...field}
// //         placeholder={password}
// //         className="w-full p-3 mb-1 border rounded-2xl focus:outline-none bg-gray-100 focus:ring-2"
// //       />
// //       {meta.touched && meta.error && (
// //         <p className="text-red-500 text-sm mb-2">{meta.error}</p>
// //       )}
// //     </>
// //   );
// // };

// // export default PasswordField;
