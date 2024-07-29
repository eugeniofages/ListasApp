import { useState, useEffect, createContext, useCallback } from "react";
import axios from "axios";

const ListContext = createContext();
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAuth from "../hooks/useAuth";

const ListProvider = ({ children }) => {
  const { auth, setAuth, axiosError, setAxiosError, handleErrorsAxios } =
    useAuth();
  const [libros, setLibros] = useState();
  const [reservas, setReservas] = useState();
  const [notifications, setNotifications] = useState();
  const [tasks, setTasks] = useState();
  const [userCoincidencias, setUserCoincidencias] = useState();
  const [sharedTasks, setSharedTasks] = useState();
  const [usuarios, setUsuarios] = useState();
  const [lists, setLists] = useState();

  const getNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/taskLists/notifications`,

        {
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotifications(response.data);
      console.log('notifications',notifications)
    } catch (error) {
      // handleErrorsAxios(error.response.status);

      console.log("Se produjo un error", error);
    }
  };
  const shareList = async (data, user, typeNotification) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/taskLists/share`,
        {
          listId: data.listId,
          userId: data.userId,
          permissions: data.permissions,
          user,
          typeNotification,
        },
        {
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(`Lista compartida con el usuario ${user.displayName}`);
    } catch (error) {
      handleErrorsAxios(error.response.status);

      console.log("Se produjo un error", error);
    }
  };
  const getSharedLists = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/taskLists/shared-lists`,
        {
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSharedTasks(response.data);

      console.log("respuestas", response);
    } catch (error) {
      handleErrorsAxios(error.response.status);

      console.log("Se produjo un error", error);
    }
  };
  const queueLibro = async (libro, user) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/notificacion/${libro.id}`,

        {
          libro,
        },
        {
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(
        "En el caso de ser el primero te avisaremos por correo cuando este disponible."
      );
    } catch (error) {
      toast.warning(error.response.data.message);
    }
  };
  const prestarLibroAdmin = async (libro) => {
    const { user_id, libro_id } = libro;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/reservas/prestar`,
        {
          user_id,
          libro_id,
        },
        {
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      // toast.success(`El libro ${response.data.reserva.libro.nombre} fue prestado correctamente`)

      console.log("reservas", reservas);
      console.log("response", response);
      //  return console.log(response.data.reserva)
      toast.success(
        `El libro ${response.data.reserva.libro.nombre} fue otorgado a el usuario ${response.data.reserva.user.name}`
      );
      setReservas((prevReservas) => {
        if (prevReservas) {
          return {
            ...prevReservas,
            data: [...prevReservas.data, response.data.reserva], //
          };
        }
        return prevReservas;
      });
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };
  const eliminarReservaAdmin = async (reserva) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/delete-reserva/${reserva.id}`,
        reserva,
        {
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      const reservasActualizados = reservas.data.filter(
        (item) => item.id !== reserva.id
      );
      setReservas((prevReservas) => ({
        ...prevReservas,
        data: reservasActualizados,
      }));

      toast.success(
        `La reserva ${response.data.id} fue eliminada correctamente`
      );
    } catch (error) {
      console.log(error);
      // toast.error("No se pudo eliminar el usuario");
    }
  };
  const deleteTask = async (lista, name) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/taskLists/removeTask`,
        {
          listId: lista.id,
          taskName: name,
        },
        {
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success(`${response.data.message}`);
        return response.data;
      } else {
        handleErrorsAxios(response.data.status);
        console.error(response.data.error);
      }
    } catch (error) {
      console.error("Error al agregar la tarea:", error);
    }
  };
  const addNewTask = async (lista, newTask) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/taskLists/addTask`,
        {
          listId: lista.id,
          task: newTask,
        },
        {
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success(`Nueva tarea agregada`);
        return response.data;
      } else {
        console.error(response.data.error);
      }
    } catch (error) {
      console.error("Error al agregar la tarea:", error);
    }
  };

  const addComment = async (listId, comment, idTask) => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/taskLists/task/comment`,
        {
          listId,
          comment,
          idTask,
        },
        {
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data, "data");
      toast.success(response.data);
      return response.data;
    } catch (error) {
      // handleErrorsAxios(error.response.status);
      console.error("Error agregando comentario", error);
      return null;
    }
  };
  const getListById = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/taskLists/${id}`,
        {
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      handleErrorsAxios(error.response.status);
      console.error("Error lista no encontrada.", error);
      return null;
    }
  };
  const getLists = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/taskLists`,
        {
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks(response.data);

      console.log("respuestas", response);
    } catch (error) {
      handleErrorsAxios(error.response.status);

      console.log("Se produjo un error", error);
    }
  };
  const addNewNotificationFromSocket = useCallback ((notification) => {
    console.log("la notificacion", notification);
  })
  const addNewTaskFromSocket = useCallback((task) => {
    console.log("la tarea", task);
    setTasks((prevTasks) => [...prevTasks, task]);
  }, []);
  const eliminarUsuario = async (user, setErrores) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/delete-user/${user.id}`,
        user,
        {
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const usuariosActualizados = usuarios.data.filter(
        (item) => item.id !== user.id
      );
      setUsuarios((prevUsuarios) => ({
        ...prevUsuarios,
        data: usuariosActualizados,
      }));

      toast.success(
        `El usuario ${response.data.name} fue eliminado correctamente`
      );
    } catch (error) {
      console.log(error);
      toast.error("No se pudo eliminar el usuario");
    }
  };

  const autoCompleteUser = async (q) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/searchUsers?q=${q}`,
        {
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserCoincidencias(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };
  const eliminarLibro = async (libro, setErrores) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/delete-libro/${libro.id}`,
        libro,
        {
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const librosActualizados = libros.data.filter(
        (item) => item.id !== libro.id
      );
      setLibros((prevLibros) => ({ ...prevLibros, data: librosActualizados }));
      console.log("delete", libros, response.data);
      toast.success(
        `El libro ${response.data.nombre} fue eliminado correctamente`
      );
    } catch (error) {
      console.log(error);
      toast.error("No se pudo eliminar el libro");
    }
  };

  const modificarUsuarioAdmin = async (user, setErrores) => {
    try {
      user.role = Number(user.role);
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/${user.id}`,
        user,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsuarios((prevUsers) => {
        if (prevUsers) {
          const updatedUsers = prevUsers.data.map((user) => {
            if (user.id === response.data.id) {
              return response.data;
            } else {
              return user;
            }
          });
          return {
            ...prevUsers,
            data: updatedUsers,
          };
        }
        return prevUsers;
      });
      console.log(response.data, "actualizado");
      toast.success("Usuario actualizado");

      setErrores([]);
    } catch (error) {
      console.log(error);
      setErrores(Object.values(error.response.data.errors));
    }
  };

  const modificarLibroAdmin = async (libro, setErrores) => {
    try {
      console.log("llega esto", libro);
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/libros/${libro.id}`,
        libro,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response);
      setLibros((prevLibros) => {
        if (prevLibros) {
          const updatedLibros = prevLibros.data.map((lib) => {
            if (lib.id === libro.id) {
              return response.data;
            } else {
              return lib;
            }
          });
          return {
            ...prevLibros,
            data: updatedLibros,
          };
        }
        return prevLibros;
      });
      console.log(response.data, "actualizado");
      toast.success("Libro actualizado");

      setErrores([]);
    } catch (error) {
      console.log(error);
      setErrores(Object.values(error.response.data.errors));
    }
  };

  const agregarLista = async (name, description) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/taskLists/create`,
        {
          name,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Nueva lista agregada correctamente");
      console.log(response);
    } catch (error) {
      handleErrorsAxios(error.response.status);

      console.log(error);
    }
  };
  const agregarUsuarioAdmin = async (user, setErrores) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/usuarios`,
        user,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsuarios((prevUsers) => {
        if (prevUsers) {
          return {
            ...prevUsers,
            data: [...prevUsers.data, response.data], //
          };
        }
        return prevUsers;
      });
      toast.success("Usuario agregado correctamente");
      setErrores([]);
    } catch (error) {
      setErrores(Object.values(error.response.data.errors));
    }
  };
  const agregarLibroAdmin = async (libro, setErrores) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/libros`,
        libro,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLibros((prevLibros) => {
        if (prevLibros) {
          return {
            ...prevLibros,
            data: [...prevLibros.data, response.data], //
          };
        }
        return prevLibros;
      });
      toast.success("Libro agregado correctamente");
      setErrores([]);
    } catch (error) {
      setErrores(Object.values(error.response.data.errors));
    }
  };
  const devolverLibro = async (libro) => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/reservas/${libro.id}/devolver`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message);
    } catch (error) {
      toast.error("Ocurrio un error");
    }
  };
  const getLibros = async (page, searchTerm) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/libros?page=${page}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLibros(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
    // setLibros(data)
  };

  const getReservas = async (page, searchTerm) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/reservas?page=${page}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReservas(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  const getUsuarios = async (page, searchTerm) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/usuarios?page=${page}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsuarios(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
    // setLibros(data)
  };
  return (
    <ListContext.Provider
      value={{
        addNewNotificationFromSocket,
        getNotifications,
        setNotifications,
        notifications,
        shareList,
        userCoincidencias,
        setUserCoincidencias,
        autoCompleteUser,
        getSharedLists,
        addComment,
        sharedTasks,
        setSharedTasks,
        axiosError,
        setAxiosError,
        deleteTask,
        addNewTask,
        agregarLista,
        getListById,
        addNewTaskFromSocket,
        getLibros,
        getLists,
        tasks,
        setTasks,
        libros,
        setLibros,
        devolverLibro,
        agregarLibroAdmin,
        modificarLibroAdmin,
        eliminarLibro,
        getUsuarios,
        usuarios,
        modificarUsuarioAdmin,
        setUsuarios,
        agregarUsuarioAdmin,
        eliminarUsuario,
        getReservas,
        reservas,
        setReservas,
        prestarLibroAdmin,
        eliminarReservaAdmin,
        queueLibro,
      }}
    >
      {children}
    </ListContext.Provider>
  );
};

export { ListProvider };
export default ListContext;
