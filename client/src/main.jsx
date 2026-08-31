import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "@fontsource-variable/manrope";
import "@fontsource-variable/space-grotesk";
import "./styles.css";
import "./styles/emerald.css";
createRoot(document.getElementById("root")).render(<StrictMode><AuthProvider><App/></AuthProvider></StrictMode>);
