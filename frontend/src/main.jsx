import "./index.css"; // this is for tailwind css
import App from "./App.jsx";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import {store} from "./store/store";


ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
