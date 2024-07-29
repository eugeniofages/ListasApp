import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { ListProvider } from "./context/ListProvider.jsx";
import { RouterProvider } from "react-router-dom";
import router from "./router.jsx";
import { RedirectProvider } from "./context/RedirectContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    
    <ListProvider>
      <RouterProvider router={router}>
      
      </RouterProvider>
    </ListProvider>
  </AuthProvider>
);
