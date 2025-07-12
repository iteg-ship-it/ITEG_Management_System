/* eslint-disable react/prop-types */
import { Field, ErrorMessage } from 'formik';
import { useState } from 'react';

const SelectInput = ({ name, options, placeholder, disabled = false, className = '' }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  return (
    <div className={`relative w-full ${className}`}>
      <Field name={name}>
        {({ field }) => (
          <div className="relative">
            <select
              {...field}
              id={name}
              name={name}
              disabled={disabled}
              onFocus={() => setIsFocused(true)}
              onBlur={(e) => {
                setIsFocused(false);
                setHasValue(!!e.target.value);
                field.onBlur(e);
              }}
              onChange={(e) => {
                field.onChange(e);
                setHasValue(!!e.target.value);
              }}
              className={`
                peer w-full h-12 border border-[var(--text-color)] rounded-md
                bg-white px-3 pt-5 pb-2 text-sm appearance-none
                focus:outline-none focus:border-[var(--text-color)]
                ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
              `}
            >
              <option value="" disabled hidden>
                {placeholder || 'Select'}
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label
              htmlFor={name}
              className={`
                absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none
                ${isFocused || hasValue || field.value
                  ? 'text-xs -top-2 text-[var(--text-color)]'
                  : 'text-gray-400 top-3.5'}
              `}
            >
              {placeholder || 'Select'} <span className="text-[var(--text-color)]">*</span>
            </label>
          </div>
        )}
      </Field>

      <ErrorMessage name={name} component="p" className="text-red-500 text-sm font-semibold mt-1" />
    </div>
  );
};

export default SelectInput;
 