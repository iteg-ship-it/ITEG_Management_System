/* eslint-disable react/prop-types */
import { useField } from "formik";

const CheckboxGroup = ({ label, name, options }) => {
  const [field, meta, helpers] = useField(name);

  const handleChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      helpers.setValue([...field.value, value]);
    } else {
      helpers.setValue(field.value.filter((v) => v !== value));
    }
  };

  return (
    <div className="mb-4">
      {label && <label className="block font-semibold mb-2">{label}</label>}
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option.value} className="flex items-center space-x-2">
            <input
              type="checkbox"
              name={name}
              value={option.value}
              checked={field.value.includes(option.value)}
              onChange={handleChange}
              className="form-checkbox text-orange-500"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {meta.touched && meta.error ? (
        <div className="text-red-500 text-sm mt-1">{meta.error}</div>
      ) : null}
    </div>
  );
};

export default CheckboxGroup;