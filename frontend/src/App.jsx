import { BrowserRouter as Router } from "react-router-dom";
import Sidebar from "./components/common-components/sidebar/Sidebar";
import Dashboard from "./components/dashboard/Dashboard";
// import Login from "./components/common-components/login&registration/Login"
// import  { useSelector, useDispatch } from "react-redux";
// import { increment, decrement, incrementByAmount } from "./features/counterSlice";
import Table from "./components/tables/Table";

function App() {
  return (
    <>
      <Router>
        {/* <Login /> */}
        <div className="flex bg-gray-100">
          <Sidebar role="admin" />

          {/* <Table
            columns={columns}
            data={studentData}
            searchable={true}
            selectable={true}
            editable={true}
          /> */}

          <Dashboard />
        </div>
      </Router>

      {/* <div>
      <h1>Counter: {count}</h1>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
    </div> */}
    </>
  );
}

export default App;
