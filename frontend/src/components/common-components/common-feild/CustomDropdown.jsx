/* eslint-disable react/prop-types */
import { useField } from "formik";
import { ErrorMessage } from "formik";

const CustomDropdown = ({
  label,
  name,
  options = [],
  placeholder = "",
  disabled = false,
  className = "",
}) => {
  const [field] = useField(name);

  const baseSelectStyle = `
    w-full h-11 px-3 rounded-lg
    border border-gray-200
    bg-gray-50
    text-sm text-gray-700
    focus:outline-none focus:border-orange-400 focus:bg-white
    transition appearance-none
    ${disabled ? "cursor-not-allowed opacity-70" : ""}
  `;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          {...field}
          disabled={disabled}
          className={baseSelectStyle}
        >
          <option value="">{placeholder || `Select ${label}`}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          ▼
        </div>
      </div>

      <ErrorMessage name={name} component="p" className="text-red-500 text-xs mt-1" />
    </div>
  );
};

export default CustomDropdown;
