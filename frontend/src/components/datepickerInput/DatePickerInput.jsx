// components/DatePickerInput.js
import { useField, ErrorMessage } from 'formik';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useEffect, useState } from 'react';
// import { format } from 'date-fns';

const DatePickerInput = ({ label, name, className = '', disabled = false }) => {
  const [field, meta, helpers] = useField(name);
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = !!field.value;

  useEffect(() => {
    if (!field.value) {
      helpers.setValue(new Date()); // Default to today
    }
  }, []);

  return (
    <div className={`relative w-full ${className}`}>
      <DatePicker
        selected={field.value ? new Date(field.value) : null}
        onChange={(date) => helpers.setValue(date)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        maxDate={new Date()} // Restrict to today or earlier
        dateFormat="dd/MM/yyyy" // UI Format
        className={`peer h-12 w-full border border-[var(--text-color)] rounded-md px-3 pt-5 pb-2
          leading-tight focus:outline-none focus:border-[var(--text-color)]
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
        `}
        disabled={disabled}
        placeholderText="Select Date"
      />

      <label
        className={`
          absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none
          ${isFocused || hasValue
            ? 'text-xs -top-2 text-[var(--text-color)]'
            : 'text-gray-400 top-3.5'}
        `}
      >
        {label} <span className="text-[var(--text-color)]">*</span>
      </label>

      <ErrorMessage name={name} component="p" className="text-red-500 text-sm font-semibold mt-1" />
    </div>
  );
};

export default DatePickerInput;
