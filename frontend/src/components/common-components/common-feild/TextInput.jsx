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
          const hasValue = !!field.value;
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
                placeholder=" "
                className={`peer h-12 w-full border border-gray-300 rounded-md
                  px-3 py-2 leading-tight 
                  focus:outline-none focus:border-orange-500 
                  focus:ring-0
                  ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
                  transition-all duration-200
                `}
              />
              <label
                htmlFor={name}
                className={`
                  absolute left-3 bg-white px-1 transition-all duration-200
                  pointer-events-none
                  ${isFocused || hasValue
                    ? "text-xs -top-2  "
                    : "text-gray-400 top-3"}
                `}
              >
                {label} <span className="text-orange-500">*</span>
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
// import { Field, ErrorMessage } from 'formik';

// const TextInput = ({ name, placeholder, type = 'text', disabled = false, className = '' }) => {
//   return (
//     <div className={`w-full ${className}`}>
//       <Field name={name}>
//         {({ field }) => (
//           <input
//             {...field}
//             type={type}
//             disabled={disabled}
//             placeholder={placeholder}
//             className={`
//               w-full border border-gray-300 rounded-md px-3 py-2
//               focus:outline-none focus:ring-2 focus:-orange-400
//               ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
//             `}
//           />
//         )}
//       </Field>
//       <ErrorMessage name={name} component="p" className="text-red-500 text-sm mt-1" />
//     </div>
//   );
// };

// export default TextInput;

