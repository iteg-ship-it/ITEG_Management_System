/* eslint-disable react/prop-types */
// src/components/FormWrapper.js

import { Formik, Form } from "formik";

const ReusableForm = ({
  initialValues,
  onSubmit,
  validationSchema,
  children,
}) => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {(formikProps) => (
        <Form className="bg-white p-8 rounded-lg w-full">
          {children(formikProps)}
        </Form>
      )}
    </Formik>
  );
};

export default ReusableForm;


// /* eslint-disable react/prop-types */
// // src/components/FormWrapper.j

// import { Formik,  Form,  } from "formik";

// const ReusableForm = ({
//   initialValues,
//   onSubmit,
//   validationSchema,
//   children,
// }) => {
//   return (
//     <Formik
//       initialValues={initialValues}
//       validationSchema={validationSchema}
//       onSubmit={onSubmit}
//     >
//       {({ values, handleChange }) => (
//         <Form className="bg-white p-8 rounded-lg w-full">
//           {children(values, handleChange)}
//         </Form>
//       )}
//     </Formik>
//   );
// };

// export default ReusableForm;



