import { useState } from "react";
import { useForgetPasswordMutation } from "../../../redux/api/authApi";
import { buttonStyles } from "../../../styles/buttonStyles";
import InputField from "../common-feild/InputField";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import logo from "../../../assets/images/logo-ssism.png";
import bg from "../../../assets/images/forgetBg.png";

const validationSchema = Yup.object({ email: Yup.string().email("Invalid email").required("Email is required") });

export default function ForgetPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [forgetPassword, { isLoading, isError, error }] = useForgetPasswordMutation();

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-gray-100"
      style={{ backgroundImage: `url(${bg})`, backgroundPosition: "center", backgroundSize: "cover" }}
    >
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="SSISM Logo" className="h-20 w-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mt-2">Forgot Password</h2>
          <p className="text-sm text-gray-500 mt-1 text-center">Enter your email to receive a reset link</p>
        </div>

        {submitted ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">✉️</span>
            </div>
            <p className="text-green-600 font-semibold text-sm">Reset link sent!</p>
            <p className="text-gray-500 text-xs mt-1">Check your email inbox.</p>
          </div>
        ) : (
          <Formik
            initialValues={{ email: "" }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
              try {
                await forgetPassword({ email: values.email }).unwrap();
                setSubmitted(true);
              } catch (err) {
                console.error("Error:", err);
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <InputField name="email" type="email" label="Email" placeholder="Enter your email" />

                {isError && (
                  <p className="text-red-500 text-sm">{error?.data?.message || "Failed to send reset email."}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || isSubmitting}
                  className={`w-full py-3 rounded-full mt-2 ${buttonStyles.primary}`}
                >
                  {isLoading ? "Sending..." : "Get Reset Link"}
                </button>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
}
