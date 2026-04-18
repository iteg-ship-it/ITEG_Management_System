import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { store } from "./redux/store.js";
import App from "./App.jsx";
import { Provider } from "react-redux";

// Apply saved theme on load — fetch from DB first, fallback to localStorage
const savedTheme = localStorage.getItem('theme') || 'orange';
document.documentElement.setAttribute('data-theme', savedTheme);

// Fetch latest theme from DB and apply
fetch(`${import.meta.env.VITE_API_URL}/settings/theme`)
  .then(r => r.json())
  .then(data => {
    if (data?.value) {
      document.documentElement.setAttribute('data-theme', data.value);
      localStorage.setItem('theme', data.value);
    }
  })
  .catch(() => {});

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
