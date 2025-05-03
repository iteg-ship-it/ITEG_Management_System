/* eslint-disable react/prop-types */
import { useField } from "formik";

const PasswordField = ({ password }) => {
  const [field, meta] = useField("password");

  return (
    <>
      <input
        type="password"
        {...field}
        placeholder={password}
        className="w-full p-3 mb-1 border rounded-2xl focus:outline-none bg-gray-100 focus:ring-2"
      />
      {meta.touched && meta.error && (
        <p className="text-red-500 text-sm mb-2">{meta.error}</p>
      )}
    </>
  );
};

export default PasswordField;
