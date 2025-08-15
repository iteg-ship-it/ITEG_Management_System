/* eslint-disable react/prop-types */
import { useState } from "react";
import { useField } from "formik";
import { Eye, EyeOff } from "lucide-react";

const PasswordField = ({ name, password }) => {
  const [field, meta] = useField(name);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = field.value && field.value.length > 0;

  return (
    <div className="relative w-full">
      <input
        type={showPassword ? "text" : "password"}
        {...field}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false);
          field.onBlur(e);
        }}
        placeholder=" "
        className="peer h-12 w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:border-[#FDA92D] transition-all duration-200"
      />
      
      <label
        className={`
          absolute left-3 bg-white px-1 transition-all duration-200
          pointer-events-none
          ${isFocused || hasValue
            ? "text-xs -top-2 text-black"
            : "text-gray-500 top-3"}
        `}
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
