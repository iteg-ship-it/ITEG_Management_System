import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // this is for tailwind css
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
