// src/components/FormWrapper.j

import React from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import {
  loginValidationSchema,
  signupValidationSchema,
} from "./validationSchema";

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
      {({ values, handleChange }) => (
        <Form className="bg-white p-8 rounded-lg w-full">
          {children(values, handleChange)}
        </Form>
      )}
    </Formik>
  );
};

export default ReusableForm;



