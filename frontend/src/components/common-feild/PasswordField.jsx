// import React from "react";
// import { ErrorMessage, Field } from "formik";

// const PasswordField = () => {
//   return (
//     <div>
//       <Field
//         type="password"
//         name="password"
//         placeholder="Password"
//         className="w-full p-3 mb-1 border rounded-lg focus:outline-none focus:ring-2"
//       />
//       <ErrorMessage
//         name="password"
//         component="p"
//         className="text-red-500 text-sm mb-2"
//       />
//     </div>
//   );
// };

// export default PasswordField;


// import React from "react";
// import { ErrorMessage } from "formik";

// const PasswordField = ({ value, onChange }) => {
//   return (
//     <>
//       <input
//         type="password"
//         name="password"
//         placeholder="Password"
//         value={value}
//         onChange={onChange}
//         className="w-full p-3 mb-1 border rounded-lg focus:outline-none focus:ring-2"
//       />
//       <ErrorMessage
//         name="password"
//         component="p"
//         className="text-red-500 text-sm mb-2"
//       />
//     </>
//   );
// };

// export default PasswordField;


import React from "react";
import { useField } from "formik";

const PasswordField = () => {
  const [field, meta] = useField("password");

  return (
    <>
      <input
        type="password"
        {...field}
        placeholder="Password"
        className="w-full p-3 mb-1 border rounded-lg focus:outline-none focus:ring-2"
      />
      {meta.touched && meta.error && (
        <p className="text-red-500 text-sm mb-2">{meta.error}</p>
      )}
    </>
  );
};

export default PasswordField;
