/* eslint-disable react/prop-types */
import { useField } from "formik";

const InputField = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <div className="flex flex-col">
      {label && <label className="font-medium">{label}</label>}
      <input {...field} {...props} className="input" />
      {meta.touched && meta.error && (
        <span className="text-red-500 text-sm">{meta.error}</span>
      )}
    </div>
  );
};

export default InputField;
