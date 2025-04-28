import logo from "../../../assets/images/logo-ssism.png";
import ReusableForm from "../../../ReusableForm";
import EmailField from "../common-feild/EmailField";
import { loginValidationSchema } from "../../../validationSchema"; 

const ForgetPassword = () => {
  const initialValues = {
    email: "",
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-lg w-full max-w-sm">
        <div className="flex flex-col items-center">
          <img src={logo} alt="SSISM Logo" className="h-20 w-30" />
          <h2 className="text-xl font-bold text-gray-800 mt-2">
            Enter Your Email
          </h2>
        </div>

        {/* ✅ ReusableForm properly used */}
        <ReusableForm
          initialValues={initialValues}
          validationSchema={loginValidationSchema}
        >
          {(values, handleChange) => (
            <>
              <div className="mt-4">
                <EmailField value={values.email} onChange={handleChange} />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-3 rounded-full mt-4 hover:bg-orange-600 transition"
              >
                Get Link
              </button>
            </>
          )}
        </ReusableForm>
      </div>
    </div>
  );
};

export default ForgetPassword;
