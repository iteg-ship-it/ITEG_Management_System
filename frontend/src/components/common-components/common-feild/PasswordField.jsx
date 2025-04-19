import { useField } from "formik";

const PasswordField = () => {
  const [field, meta] = useField("password");

  return (
    <>
      <input
        type="password"
        {...field}
        placeholder="Password"
        className="w-full p-3 mb-1 border rounded-lg focus:outline-none focus:ring-2"
      />
      {meta.touched && meta.error && (
        <p className="text-red-500 text-sm mb-2">{meta.error}</p>
      )}
    </>
  );
};

export default PasswordField;
