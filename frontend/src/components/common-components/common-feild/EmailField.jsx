import { Field, ErrorMessage } from "formik";
import { useState } from "react";

const EmailField = () => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative w-full">
      <Field name="email">
        {({ field }) => {
          const hasValue = !!field.value;
          return (
            <>
              <input
                {...field}
                type="email"
                onFocus={() => setIsFocused(true)}
                onBlur={(e) => {
                  setIsFocused(false);
                  field.onBlur(e);
                }}
                className="peer h-12 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FDA92D] transition-all duration-200"
              />
              <label
                className={`
                  absolute left-3 bg-white px-1 transition-all duration-200
                  pointer-events-none
                  ${isFocused || hasValue
                    ? "text-xs -top-2 text-black"
                    : "text-gray-500 top-3"}
                `}
              >
                Email
              </label>
            </>
          );
        }}
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
