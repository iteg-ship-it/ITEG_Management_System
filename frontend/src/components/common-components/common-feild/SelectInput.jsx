

import { Field, ErrorMessage } from "formik";

const SelectInput = ({ label, name, options }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} <span className="text-red-500">*</span>
    </label>
    <Field
      as="select"
      name={name}
      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Select {label}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Field>
    <ErrorMessage
      name={name}
      component="p"
      className="text-red-500 text-sm font-semibold mt-1"
    />
  </div>
);

export default SelectInput;
