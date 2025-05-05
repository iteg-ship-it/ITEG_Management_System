import React from "react";
import { Field, ErrorMessage } from "formik";

const RadioGroup = ({ label, name, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">
      {label} <span className="text-red-500">*</span>
    </label>
    <div className="mt-2 space-x-8">
      {options.map((opt) => (
        <label key={opt.value} className="inline-flex items-center">
          <Field
            type="radio"
            name={name}
            value={opt.value}
            className="form-radio h-4 w-4 text-red-600 accent-red-600 border-gray-300"
          />
          <span className="ml-2">{opt.label}</span>
        </label>
      ))}
    </div>
    <ErrorMessage
      name={name}
      component="p"
      className="text-red-500 text-sm font-semibold"
    />
  </div>
);

export default RadioGroup;
