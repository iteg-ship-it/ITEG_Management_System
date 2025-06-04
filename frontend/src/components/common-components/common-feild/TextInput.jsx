/* eslint-disable react/prop-types */
import { Field, ErrorMessage } from "formik";

const TextInput = ({ label, name, placeholder, className = "" }) => (
  <div className={`w-full ${className}`}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {label && <span className="text-red-500">*</span>}
    </label>
    <Field
      type="text"
      name={name}
      placeholder={placeholder}
      className="input-style w-full"
    />
    <ErrorMessage
      name={name}
      component="p"
      className="text-red-500 text-sm font-semibold mt-1"
    />
  </div>
);

export default TextInput;



// /* eslint-disable react/prop-types */
// import { Field, ErrorMessage } from "formik";

// const TextInput = ({ label, name, placeholder }) => (
//   <div>
//     <label className="block text-sm font-medium text-gray-700">
//       {label} {label && <span className="text-red-500">*</span>}
//     </label>
//     <Field
//       type="text"
//       name={name}
//       placeholder={placeholder}
//       className="input-style"
//     />
//     <ErrorMessage
//       name={name}
//       component="p"
//       className="text-red-500 text-sm font-semibold"
//     />
//   </div>
// );

// export default TextInput;
