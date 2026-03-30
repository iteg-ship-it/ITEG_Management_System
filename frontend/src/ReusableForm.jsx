/* eslint-disable react/prop-types */
import { Formik, Form } from "formik";

const ReusableForm = ({ initialValues, onSubmit, validationSchema, children }) => {
  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
      {(formikProps) => (
        <Form className="bg-white p-8 rounded-lg w-full">
          {children(formikProps)}
        </Form>
      )}
    </Formik>
  );
};

export default ReusableForm;

