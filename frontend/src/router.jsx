import Layout from "./views/Layout";
import Login from "./views/Login";
import Registro from "./views/Registro";
import Home from "./views/user/Home";
import ListaEspecifica from "./views/user/ListaEspecifica";
import Notificaciones from "./views/user/Notificaciones";
import UserLayout from "./views/user/UserLayout";

import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: "/registro",
        element: <Registro />,
      },
      
    ],
  },
  {
    path: "/panel",
    element: (
     
        <UserLayout />
      
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "lista/:id",
        element: <ListaEspecifica />,
      },
      {
        path: "notificaciones",
        element: <Notificaciones />,
      },
    ],
  },
]);

export default router;
