import logo from "../../../assets/images/logo-ssism.png";
import ReusableForm from "../../../ReusableForm";
import { loginValidationSchema } from "../../../validationSchema";
import PasswordField from "../common-feild/PasswordField";

const ConfirmPassword = () => {
  const initialValues = {
    password: "",
    confirmpassword: "",
  };
  return (
    <>
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white p-10 rounded-lg w-full max-w-sm">
          <div className="flex flex-col items-center">
            <img src={logo} alt="SSISM Logo" className="h-20 w-30" />
            <h2 className="text-xl font-bold text-gray-800 mt-2">
              Confirm Password{" "}
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
                  <PasswordField
                    value={values.password}
                    onChange={handleChange}
                    password="Password"
                  />{" "}
                </div>
                <div className="mt-4">
                  <PasswordField
                    value={values.confirmpassword}
                    onChange={handleChange}
                    password="Confirm Password"
                  />{" "}
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 text-white py-3 rounded-full mt-4 hover:bg-orange-600 transition"
                >
                  Update Password{" "}
                </button>
              </>
            )}
          </ReusableForm>
        </div>
      </div>
    </>
  );
};

export default ConfirmPassword;
