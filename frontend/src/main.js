import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import ContextProvider from "./context/Context";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <AuthProvider>
      <ContextProvider>
        <App />
      </ContextProvider>
    </AuthProvider>
  </ThemeProvider>
);
