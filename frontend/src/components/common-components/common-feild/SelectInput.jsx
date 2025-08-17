// /* eslint-disable react/prop-types */
// import { Field, ErrorMessage } from 'formik';

// const SelectInput = ({ name, options, placeholder, disabled = false, className = '' }) => {
//   return (
//     <div className={`w-full ${className}`}>
//       <Field as="select" name={name} disabled={disabled}
//         className={`
//           w-full border border-gray-300 rounded-md px-3 py-2 
//           focus:outline-none focus:ring-2 focus:ring-orange-400
//           bg-white ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
//         `}
//       >
//         <option value="">{placeholder || 'Select'}</option>
//         {options.map((option) => (
//           <option key={option.value} value={option.value}>{option.label}</option>
//         ))}
//       </Field>
//       <ErrorMessage name={name} component="p" className="text-red-500 text-sm mt-1" />
//     </div>
//   );
// };

// export default SelectInput;



/* eslint-disable react/prop-types */
// import { Field, ErrorMessage } from "formik";
// import { useState } from "react";

// const SelectInput = ({
//   name,
//   label,
//   options,
//   className = "",
//   disabled = false,
// }) => {
//   const [isFocused, setIsFocused] = useState(false);

//   return (
//     <div className={`relative w-full ${className}`}>
//       <Field name={name}>
//         {({ field }) => {
//           const hasValue = field.value && field.value.length > 0;
//           console.log('field.value', field.value);
//           return (
//             <div className="relative">
//               <select
//                 {...field}
//                 value={options?.find((option) => option.value == field.values) || ""}
//                 id={name}
//                 disabled={disabled}
//                 onFocus={() => setIsFocused(true)}
//                 onBlur={(e) => {
//                   setIsFocused(false);
//                   field.onBlur(e);
//                 }}
//                 className={`
//                   peer h-12 w-full border border-[var(--text-color)] rounded-md
//                   px-3 py-2 bg-white leading-tight
//                   focus:outline-none focus:border-[var(--text-color)] 
//                   focus:ring-0
//                   appearance-none
//                   ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
//                   transition-all duration-200
//                 `}
//               >
//                 <option value="" disabled hidden>
//                   Select
//                 </option>
//                 {options.map((option) => (
//                   <option key={option.value} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>

//               <label
//                 htmlFor={name}
//                 className={`
//                   absolute left-3
//                   bg-white px-1 transition-all duration-200
//                   pointer-events-none
//                   ${isFocused || hasValue
//                     ? "text-xs -top-2 text-[var(--text-color)]"
//                     : "text-gray-400 top-2"}
//                 `}
//               >
//                 {label} {label && <span className="text-[var(--text-color)]">*</span>}
//               </label>
//             </div>
//           );
//         }}
//       </Field>

//       <ErrorMessage
//         name={name}
//         component="p"
//         className="text-red-500 text-sm font-semibold mt-1"
//       />
//     </div>
//   );
// };

// export default SelectInput;
 

import { Field, ErrorMessage } from "formik";
import { useState } from "react";
import tableRowDropdownImg from "../../../assets/images/table-row-dropdown.png";

const SelectInput = ({ name, label, options, className = "", disabled = false }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative w-full ${className}`}>
      <style>
        {`
          select option,
          select[name] option,
          select[id] option {
            background-color: rgba(173, 216, 230, 0.3) !important;
            background-image: linear-gradient(135deg, rgba(173, 216, 230, 0.4), rgba(255, 182, 193, 0.4)) !important;
            padding: 10px !important;
            color: #333 !important;
            border: none !important;
            margin: 1px 0 !important;
          }
          select option:hover,
          select option:focus {
            background-color: rgba(173, 216, 230, 0.5) !important;
            background-image: linear-gradient(135deg, rgba(173, 216, 230, 0.6), rgba(255, 182, 193, 0.6)) !important;
          }
          select option:checked,
          select option:selected {
            background-color: rgba(173, 216, 230, 0.7) !important;
            background-image: linear-gradient(135deg, rgba(173, 216, 230, 0.8), rgba(255, 182, 193, 0.8)) !important;
          }
        `}
      </style>
      <Field name={name}>
        {({ field }) => {
          const hasValue = field.value !== "";
          return (
            <div className="relative">
              <select
                {...field}
                id={name}
                disabled={disabled}
                onFocus={() => setIsFocused(true)}
                onBlur={(e) => {
                  setIsFocused(false);
                  field.onBlur(e);
                }}
                className={`
                  peer h-12 w-full border border-gray-300 rounded-md
                  px-3 py-2 leading-tight bg-white
                  focus:outline-none focus:border-[#FDA92D] 
                  focus:ring-0 appearance-none
                  ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
                  transition-all duration-200
                `}
              >
                <option value="" disabled hidden>Select</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <label
                htmlFor={name}
                className={`
                  absolute left-3 bg-white px-1 transition-all duration-200
                  pointer-events-none
                  ${isFocused || hasValue
                    ? "text-xs -top-2 text-black"
                    : "text-gray-500 top-3"}
                `}
              >
                {label}
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

export default SelectInput;
