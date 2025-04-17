// import React from "react";
// import { ErrorMessage, Field } from "formik";

// const EmailField = () => {
//   return (
//     <div>
//       <Field
//         type="email"
//         name="email"
//         placeholder="Email"
//         className="w-full p-3 mb-1 border rounded-lg focus:outline-none focus:ring-2"
//       />
//       <ErrorMessage
//         name="email"
//         component="p"
//         className="text-red-500 text-sm mb-2"
//       />
//     </div>
//   );
// };

// export default EmailField;



import React from "react";
import { ErrorMessage } from "formik";

const EmailField = ({ value, onChange }) => {
  return (
    <>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={value}
        onChange={onChange}
        className="w-full p-3 mb-1 border rounded-lg focus:outline-none focus:ring-2"
      />
      <ErrorMessage
        name="email"
        component="p"
        className="text-red-500 text-sm mb-2"
      />
    </>
  );
};

export default EmailField;
