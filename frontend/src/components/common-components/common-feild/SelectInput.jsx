/* eslint-disable react/prop-types */
import { Field, ErrorMessage } from 'formik';

const SelectInput = ({ name, options, placeholder, disabled = false, className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      <Field as="select" name={name} disabled={disabled}
        className={`
          w-full border border-gray-300 rounded-md px-3 py-2 
          focus:outline-none focus:ring-2 focus:ring-orange-400
          bg-white ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
        `}
      >
        <option value="">{placeholder || 'Select'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </Field>
      <ErrorMessage name={name} component="p" className="text-red-500 text-sm mt-1" />
    </div>
  );
};

export default SelectInput;
