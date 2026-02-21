import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { store } from "./redux/store.js";
import App from "./App.jsx";
import { Provider } from "react-redux";

console.log('API URL:', import.meta.env.VITE_API_URL);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found!');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
