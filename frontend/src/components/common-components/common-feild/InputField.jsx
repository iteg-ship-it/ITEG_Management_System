/* eslint-disable react/prop-types */
import { useField } from "formik";
import { useState } from "react";

const InputField = ({
  label,
  name,
  disabled = false,
  type = "text",
  className = "",
}) => {
  const [field, meta] = useField(name);
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = field.value && field.value.length > 0;

  return (
    <div className={`relative w-full ${className}`}>
      <input
        {...field}
        type={type}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false);
          field.onBlur(e);
        }}
        placeholder=" "
        className={`
          peer
          h-12 w-full border border-gray-300 rounded-md
          px-3 py-2 leading-tight 
          focus:outline-none focus:border-[#FDA92D] 
          focus:ring-0
          ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
          transition-all duration-200
        `}
      />
      <label
        className={`
          absolute left-3
          bg-white px-1 transition-all duration-200
          pointer-events-none
          ${isFocused || hasValue
            ? "text-xs -top-2 text-black"
            : "text-gray-500 top-3"
          }
        `}
      >
        {label}
      </label>
      {meta.touched && meta.error && (
        <p className="text-red-500 text-sm font-semibold mt-1">{meta.error}</p>
      )}
    </div>
  );
};

export default InputField;
