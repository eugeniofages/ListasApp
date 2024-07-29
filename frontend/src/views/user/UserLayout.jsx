import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { ToastContainer } from "react-toastify";
import useAuth from "../../hooks/useAuth";
import useLists from "../../hooks/useLists";
export default function UserLayout() {
  const { auth, cargando } = useAuth();
  const { axiosError, setAxiosError } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    console.log(axiosError, "axiosERror");
    if (axiosError != undefined) {
      navigate(axiosError);
      setAxiosError(undefined)
    }
  }, [axiosError]);
  return (
    <div className="flex ">
      <Sidebar />

      <main className="m-10">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}
