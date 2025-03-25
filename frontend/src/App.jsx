import LoginPage from "./components/login/LoginPage";
import Dashboard from "./components/deshboard/Dashboard";
import SignupPage from "./components/signup/SignupPage";
// import Sidebar from "./components/sidebar/Sidebar";

function App() {
  return (
    <>
      {/* <Sidebar /> */}
      <LoginPage />
      <SignupPage />
      <Dashboard />
    </>
  );
}

export default App;
