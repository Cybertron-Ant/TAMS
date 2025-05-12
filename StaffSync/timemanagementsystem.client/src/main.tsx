import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { store } from "./app/store";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <div className="bg-background-100">
          <App />
        </div>
      </BrowserRouter>
      <ToastContainer />
    </Provider>
  </React.StrictMode>
);
