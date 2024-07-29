import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { auth as fireauth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function Login() {
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [alerta, setAlerta] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    // if(auth)
    // {
    //   return navigate('/panel')
    // }
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if ([username, password].includes("")) {
      setAlerta({ msg: "Todos los campos son obligatorios" });

      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        fireauth,
        username,
        password
      );
      const idToken = await userCredential.user.getIdToken();
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        {
          idToken,
        }
      );
      console.log("idtoken", idToken);
      setAlerta({});
      localStorage.setItem("token", data.token);

      

      setAuth(data);
      navigate("/panel");
    } catch (error) {
      console.log(error);
      setAlerta({ msg: error.response?.data?.message || error.message });
    }
  };
  return (
    <div className="flex justify-center items-center h-screen flex-col gap-5">
      <h1 className="font-bold text-5xl text-center text-blue-800">
        Lista de Tareas - APP
      </h1>
      <div className="bg-white rounded-lg shadow-2xl w-80 p-8">
        <h1 className="font-bold text-3xl text-center">Iniciar Sesión </h1>
        {alerta.msg && (
          <div className="bg-red-500 p-2 text-white text-center my-4">
            {alerta.msg}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <input
              name="email"
              type="text"
              placeholder="Usuario"
              className="w-full p-2 border border-gray-400 rounded mt-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <input
              type="password"
              placeholder="Contraseña"
              className="w-full p-2 border border-gray-400 rounded mt-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className=" mt-2 flex flex-col">
            <Link to="/registro">
              <span className=" mb-5 text-xs text-gray-400">Registrarme</span>
            </Link>
            <button
              className="bg-blue-500 w-full py-2 text-white rounded hover:bg-blue-600"
              type="submit"
            >
              Iniciar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
