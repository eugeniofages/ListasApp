import { useState, useEffect, createContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navigate } from "react-router-dom";
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({});
  const [cargando, setCargando] = useState(true);
  const [infoUser, setInfoUser] = useState({});
  const [axiosError, setAxiosError] = useState();
  const handleErrorsAxios = (codeError) => {
    switch (codeError) {
      case 401:
        setAxiosError("/");
        setAuth({});
        localStorage.removeItem("token");
        toast.error("No estas autenticado");

        break;
      case 404:
        setAxiosError("/panel");
        toast.error("Pagina inexistente");
        break;
      case 405:
        setAxiosError("/panel");
        toast.error("No permitido");

        break;
      case 403:
        toast.error("No tienes permiso para acceder a esta ruta");

        setAxiosError("/panel");
        break;
      default:
        setAxiosError(null);
    }
  };
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const fetchAuth = async () => {
        try {
          const { data } = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setAuth(data.user);
          console.log("datauser", data);
        } catch (error) {
          console.log(error);
          localStorage.removeItem("token");
        } finally {
          setCargando(false);
        }
      };
      fetchAuth();
    } else {
      setCargando(false);
    }
  }, []);

  const cerrarSesionAuth = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAxiosError("/");
      localStorage.removeItem("token");
      toast.success("Cerraste sesion correctamente");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        axiosError,
        setAxiosError,
        handleErrorsAxios,
        auth,
        setAuth,
        cargando,
        auth,
        setCargando,
        cerrarSesionAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
export default AuthContext;
