/* eslint-disable react/prop-types */
import { useState } from "react";
import { useField } from "formik";
import { Eye, EyeOff } from "lucide-react";

const PasswordField = ({ name, password }) => {
  const [field, meta] = useField(name);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        {...field}
        id="password"
        placeholder=" "
        className="h-12 border border-gray-300 px-3 pr-10 rounded-md focus:outline-none focus:border-black w-full peer autofill-detect"
      />
      
      <label
        htmlFor="password"
        className="absolute left-3 top-3 text-gray-500 transition-all duration-200 cursor-text peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black"
      >
        {password}
      </label>

      <div
        className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer"
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
