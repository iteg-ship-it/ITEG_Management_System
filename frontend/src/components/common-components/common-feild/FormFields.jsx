/* eslint-disable react/prop-types */

import { useField } from "formik";
import tableRowDropdownImg from "../../../assets/images/table-row-dropdown.png";

export const TextInput = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <div>
      <label className="font-semibold">{label}</label>
      <input {...field} {...props} className="w-full p-2 border rounded" />
      {meta.touched && meta.error ? (
        <div className="text-red-600 text-sm">{meta.error}</div>
      ) : null}
    </div>
  );
};

export const SelectInput = ({ label, options, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <div>
      <label className="font-semibold">{label}</label>
      <select 
        {...field} 
        {...props} 
        className="w-full p-2 border rounded"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,240,240,0.8) 100%), url(${tableRowDropdownImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {meta.touched && meta.error ? (
        <div className="text-red-600 text-sm">{meta.error}</div>
      ) : null}
    </div>
  );
};

export const RadioInput = ({ label, options, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <div>
      <label className="font-semibold block mb-1">{label}</label>
      <div className="flex gap-4">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-1">
            <input
              type="radio"
              {...field}
              value={opt.value}
              checked={field.value === opt.value}
            />
            {opt.label}
          </label>
        ))}
      </div>
      {meta.touched && meta.error ? (
        <div className="text-red-600 text-sm">{meta.error}</div>
      ) : null}
    </div>
  );
};
