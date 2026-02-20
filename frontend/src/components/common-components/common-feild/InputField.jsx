/* eslint-disable react/prop-types */
import { useField } from "formik";
import { Field, ErrorMessage } from "formik";

const InputField = ({
  label,
  name,
  type = "text",        // text | select | textarea | password etc.
  options = [],         // for select
  placeholder = "",
  disabled = false,
  className = "",
}) => {
  const [field, meta] = useField(name);

  const baseInputStyle = `
    w-full h-11 px-3 rounded-lg
    border border-gray-200
    bg-gray-50
    text-sm text-gray-700
    focus:outline-none focus:border-orange-400 focus:bg-white
    transition
    ${disabled ? "cursor-not-allowed opacity-70" : ""}
  `;

  return (
    <div className={`w-full ${className}`}>
      
      {/* label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      {/* ================= TEXTAREA ================= */}
      {type === "textarea" && (
        <textarea
          {...field}
          disabled={disabled}
          placeholder={placeholder}
          className={`${baseInputStyle} h-24 resize-none`}
        />
      )}

      {/* ================= SELECT ================= */}
      {type === "select" && (
        <div className="relative">
          <select
            {...field}
            disabled={disabled}
            className={`${baseInputStyle} appearance-none`}
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* dropdown icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            ▼
          </div>
        </div>
      )}

      {/* ================= NORMAL INPUT ================= */}
      {type !== "select" && type !== "textarea" && (
        <Field
          {...field}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          className={baseInputStyle}
        />
      )}

      {/* error */}
      <ErrorMessage name={name} component="p" className="text-red-500 text-xs mt-1" />
    </div>
  );
};

export default InputField;

// /* eslint-disable react/prop-types */
// import { useField } from "formik";
// import { useState } from "react";

// const InputField = ({
//   label,
//   name,
//   disabled = false,
//   type = "text",
//   className = "",
//   autoComplete = "on",
// }) => {
//   const [field, meta] = useField(name);
//   const [isFocused, setIsFocused] = useState(false);

//   const hasValue = field.value && field.value.length > 0;

//   return (
//     <div className={`relative w-full ${className}`}>
//       <input
//         {...field}
//         type={type}
//         disabled={disabled}
//         autoComplete={autoComplete}
//         data-form-type="other"
//         onFocus={() => setIsFocused(true)}
//         onBlur={(e) => {
//           setIsFocused(false);
//           field.onBlur(e);
//         }}
//         placeholder=" "
//         className={`
//           peer
//           h-12 w-full border border-gray-300 rounded-md
//           px-3 py-2 leading-tight 
//           focus:outline-none focus:border-[#FDA92D] 
//           focus:ring-0
//           ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
//           transition-all duration-200
//         `}
//       />
//       <label
//         className={`
//           absolute left-3
//           bg-white px-1 transition-all duration-200
//           pointer-events-none
//           ${isFocused || hasValue
//             ? "text-xs -top-2 text-black"
//             : "text-gray-500 top-3"
//           }
//         `}
//       >
//         {label}
//       </label>
//       {meta.touched && meta.error && (
//         <p className="text-red-500 text-sm font-semibold mt-1">{meta.error}</p>
//       )}
//     </div>
//   );
// };

// export default InputField;
