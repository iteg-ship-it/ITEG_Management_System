/* eslint-disable no-unused-vars */
import { Field, ErrorMessage } from "formik";
import { useState } from "react";

const EmailField = () => {
  return (
    <div className="relative">
      <Field name="email">
        {({ field }) => (
          <>
            <input
              {...field}
              id="email"
              type="email"
              placeholder=" "
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-black w-full peer autofill-detect"
            />
            <label
              htmlFor="email"
              className="absolute left-3 top-3 text-gray-500 transition-all duration-200 cursor-text peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black"
            >
              Email
            </label>
          </>
        )}
      </Field>
      <ErrorMessage
        name="email"
        component="p"
        className="text-red-500 text-sm mt-1"
      />
    </div>
  );
};

export default EmailField;
