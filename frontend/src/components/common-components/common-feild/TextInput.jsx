/* eslint-disable react/prop-types */
import { Field, ErrorMessage } from "formik";
import { useState } from "react";

const TextInput = ({
  label,
  name,
  className = "",
  disabled = false,
  type = "text",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative w-full ${className}`}>
      <Field name={name}>
        {({ field }) => {
          const hasValue = field.value && field.value.length > 0;
          return (
            <div className="relative">
              <input
                {...field}
                type={type}
                disabled={disabled}
                onFocus={() => setIsFocused(true)}
                onBlur={(e) => {
                  setIsFocused(false);
                  field.onBlur(e);
                }}
                placeholder=""
                className={`
                  w-full border border-gray-300 rounded-md px-3 pt-6 pb-2
                  focus:outline-none focus:border-blue-600
                  ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
                  transition-all duration-300
                `}
              />
              <label
                className={`
                  absolute left-3
                  transition-all duration-300
                  pointer-events-none
                  ${
                    isFocused || hasValue
                      ? "text-xs -top-1 px-1 bg-white text-blue-600"
                      : "text-gray-400 top-3"
                  }
                `}
              >
                {label} {label && <span className="text-red-500">*</span>}
              </label>
            </div>
          );
        }}
      </Field>
      <ErrorMessage
        name={name}
        component="p"
        className="text-red-500 text-sm font-semibold mt-1"
      />
    </div>
  );
};

export default TextInput;


// /* eslint-disable react/prop-types */
// import { Field, ErrorMessage } from "formik";

// const TextInput = ({
//   label,
//   name,
//   placeholder,
//   className = "",
//   disabled = false,
//   value,
//   type = "text",
// }) => (
//   <div className={`w-full ${className}`}>
//     <label className="block text-sm font-medium text-gray-700 mb-1">
//       {label} {label && <span className="text-red-500">*</span>}
//     </label>
//     <Field name={name}>
//       {({ field, form }) => (
//         <input
//           {...field}
//           type={type}
//           placeholder={placeholder}
//           disabled={disabled}
//           value={value !== undefined ? value : field.value}
//           onChange={(e) => {
//             form.setFieldValue(name, e.target.value);
//           }}
//           className={`input-style w-full ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
//         />
//       )}
//     </Field>
//     <ErrorMessage
//       name={name}
//       component="p"
//       className="text-red-500 text-sm font-semibold mt-1"
//     />
//   </div>
// );

// export default TextInput;


// // /* eslint-disable react/prop-types */
// // import { Field, ErrorMessage } from "formik";

// // const TextInput = ({ label, name, placeholder }) => (
// //   <div>
// //     <label className="block text-sm font-medium text-gray-700">
// //       {label} {label && <span className="text-red-500">*</span>}
// //     </label>
// //     <Field
// //       type="text"
// //       name={name}
// //       placeholder={placeholder}
// //       className="input-style"
// //     />
// //     <ErrorMessage
// //       name={name}
// //       component="p"
// //       className="text-red-500 text-sm font-semibold"
// //     />
// //   </div>
// // );

// // export default TextInput;
