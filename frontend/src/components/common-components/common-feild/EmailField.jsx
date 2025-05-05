import { Field, ErrorMessage } from "formik";

const EmailField = () => {
  return (
    <>
      <Field
        type="email"
        name="email"
        placeholder="Email"
        className="w-full p-3 mb-1 border rounded-2xl focus:outline-none bg-gray-100 focus:ring-2"
      />
      <ErrorMessage
        name="email"
        component="p"
        className="text-red-500 text-sm mb-2"
      />
    </>
  );
};

export default EmailField;
