import Modal from "@mui/material/Modal";
import React, { useEffect, useState } from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import useLists from "../hooks/useLists";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import io from "socket.io-client";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
const socket = io("http://localhost:3000");

import Typography from "@mui/material/Typography";
import useAuth from "../hooks/useAuth";
import { TextField } from "@mui/material";
import { toast } from "react-toastify";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  borderRadius: 5,
  bgcolor: "background.paper",
  border: "0.5px solid #FAFAFA",
  boxShadow: 24,
  p: 4,
};

const ListaInfo = ({ lista }) => {
  const { auth } = useAuth();

  console.log(lista, "listaprops", auth, "user");
  const [listaProp, setListaProp] = useState(lista);
  const [suggestions, setSuggestions] = useState([]);

  const isOwner = (auth?.uid === listaProp.owner) || (auth?.auth?.uid == listaProp.owner);
  const isSharedWithUser = listaProp.sharedWith?.some(
    (user) => user.userId === auth?.uid && user.permissions.canWrite
  );
  const {
    addNewTask,
    deleteTask,
    addComment,
    autoCompleteUser,
    userCoincidencias,
    setUserCoincidencias,
    shareList,
    notifications,
    setNotifications,
  } = useLists();
  const [openAdd, setOpenAdd] = useState(false);
  const [openModalComments, setOpenModalComments] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [taskToComment, setTaskToComment] = useState();
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const [openComment, setOpenComment] = useState(false);
  const [openCompartir, setOpenCompartir] = useState(false);

  const [comentariosView, setComentariosView] = useState();
  const handleOpenAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => setOpenAdd(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [query, setQuery] = useState("");
  const handleUserSelect = (event, value) => {
    setSelectedUser(value);
  };
  const handleOpenAddComment = () => setOpenComment(true);
  const handleCloseAddComment = () => setOpenComment(false);
  const handleOpenCompartirList = () => setOpenCompartir(true);
  const handleCloseCompartirList = () => setOpenCompartir(false);
  const handleOpenComments = (comments) => {
    console.log(comments, "comentarios");
    setComentariosView(comments);
    setOpenModalComments(true);
  };
  const handleCloseComments = () => setOpenModalComments(false);
  const handleChangeNewTask = (e) => {
    setNewTask(e.target.value);
  };

  const handleChangeNewComment = (e) => {
    setNewComment(e.target.value);
  };
  const writeComment = (e) => {
    e.preventDefault();

    console.log(newComment, taskToComment.id, listaProp.id);
    addComment(listaProp.id, newComment, taskToComment.id);
    setNewComment("");
    setOpenComment(false);
  };
  const deleteTaskArray = async (name) => {
    const data = await deleteTask(lista, name);
  };
  const handleSubmitCompartir = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formValues = Object.fromEntries(formData.entries());

    const isEmpty = Object.values(formValues).some((value) => value === "");

    const canWrite = formData.get("write") === "on";
    const canRead = formData.get("read") === "on";

    const isPermisoChecked = canWrite || canRead;

    const notificarPor = formData.get("notificar-por");
    const isNotificacionChecked =
      notificarPor === "to-email" || notificarPor === "push-notifications";

    if (isEmpty || !isPermisoChecked || !isNotificacionChecked) {
      console.error("Todos los campos son requeridos.");
      return;
    }

    const data = {
      listId: listaProp.id,
      userId: selectedUser.uid,
      permissions: {
        canWrite,
        canRead,
      },
    };
    await shareList(data, selectedUser, notificarPor);
    console.log("Encapsulated Data:", data);
    setOpenCompartir(false);
  };
  const handleChangeUser = async (event, newValue) => {
    setQuery(newValue);
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length > 2) {
        setLoading(true);
        try {
          const data = await autoCompleteUser(query);
          setSuggestions(data);
        } catch (error) {
          console.error("Error fetching suggestions", error);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [query]);

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    console.log(lista, newTask);
    try {
      const data = await addNewTask(lista, newTask);

      setNewTask("");
      setOpenAdd(false);
    } catch (error) {}
  };

  useEffect(() => {
    socket.on("notificationsUpdated", ({ notifications, message }) => {
      console.log("nueva notificacion", notifications,message);
      toast.info('Has recibido una nueva notificación')
      setNotifications(notifications);
    });
    socket.on("listUpdated", ({ listId, updatedList }) => {
      if (listId === listaProp.id) {
        console.log(
          "la lista fue actualizada con una nueva tarea",
          updatedList
        );
        setListaProp(updatedList);
      }
    });

    return () => {
      socket.off("listUpdated");
    };
  }, [listaProp.id]);
  return (
    <div>
      <div>
        <div className="grid grid-cols-2 gap-5">
          <button
            disabled={!(isOwner || isSharedWithUser)}
            onClick={handleOpenAdd}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          >
            Agregar tarea a la lista
          </button>
          <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={openAdd}
            onClose={handleCloseAdd}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
              backdrop: {
                timeout: 500,
              },
            }}
          >
            <Fade in={openAdd}>
              <Box sx={style}>
                <Typography
                  id="transition-modal-title"
                  variant="h6"
                  component="h2"
                >
                  Nueva tarea
                </Typography>

                <form onSubmit={handleSubmitAdd}>
                  <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label className="block text-md font-medium leading-6 text-gray-900">
                        Nombre de la tarea
                      </label>
                      <div className="mt-2">
                        <input
                          value={newTask}
                          onChange={handleChangeNewTask}
                          type="text"
                          name="task-name"
                          id="task-name"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-end gap-x-6">
                    <input
                      className="
                      cursor-pointer
                      rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      type="submit"
                      value="Agregar"
                    />
                  </div>
                </form>
              </Box>
            </Fade>
          </Modal>

          <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={openCompartir}
            onClose={handleCloseCompartirList}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
              backdrop: {
                timeout: 500,
              },
            }}
          >
            <Fade in={openCompartir}>
              <Box sx={style}>
                <Typography
                  id="transition-modal-title"
                  variant="h6"
                  component="h2"
                >
                  Compartir lista
                </Typography>

                <form onSubmit={handleSubmitCompartir}>
                  <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6" />
                  <div className="sm:col-span-3">
                    <label className="block text-md font-medium leading-6 text-gray-900">
                      Persona
                    </label>
                    <div className="mt-2">
                      <Autocomplete
                        freeSolo
                        inputValue={query}
                        onInputChange={handleChangeUser}
                        onChange={handleUserSelect}
                        options={suggestions}
                        getOptionLabel={(option) =>
                          option.displayName || option.email
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Busca usuarios..."
                            variant="outlined"
                            name="persona"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {loading ? (
                                    <CircularProgress
                                      color="inherit"
                                      size={20}
                                    />
                                  ) : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                      />
                    </div>
                    <div className="mt-4 space-y-5">
                      <label className="block text-md font-medium leading-6 text-gray-900">
                        Permisos
                      </label>
                      <fieldset>
                        <div className="mt-0 space-y-6">
                          <div className="relative flex gap-x-3">
                            <div className="flex h-6 items-center">
                              <input
                                id="write"
                                name="write"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                              />
                            </div>
                            <div className="text-sm leading-6">
                              <label
                                htmlFor="write"
                                className="font-medium text-gray-900"
                              >
                                Escritura
                              </label>
                              <p className="text-gray-500">
                                Permite que el usuario pueda escribir tareas
                                sobre la lista.
                              </p>
                            </div>
                          </div>
                          <div className="relative flex gap-x-3">
                            <div className="flex h-6 items-center">
                              <input
                                id="read"
                                name="read"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                              />
                            </div>
                            <div className="text-sm leading-6">
                              <label
                                htmlFor="read"
                                className="font-medium text-gray-900"
                              >
                                Lectura
                              </label>
                              <p className="text-gray-500">
                                Permite al usuario que pueda visualizar la lista
                              </p>
                            </div>
                          </div>
                        </div>
                      </fieldset>
                      <fieldset>
                        <label className="block text-md font-medium leading-6 text-gray-900">
                          Notificar por
                        </label>
                        <div className="mt-4 space-y-5">
                          <div className="flex items-center gap-x-3">
                            <input
                              id="to-email"
                              name="notificar-por"
                              type="radio"
                              value="to-email"
                              className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            />
                            <label
                              htmlFor="to-email"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Al correo electrónico
                            </label>
                          </div>
                          <div className="flex items-center gap-x-3">
                            <input
                              id="push-notifications"
                              name="notificar-por"
                              type="radio"
                              value="push-notifications"
                              className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            />
                            <label
                              htmlFor="push-notifications"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Notificación push
                            </label>
                          </div>
                        </div>
                      </fieldset>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-end gap-x-6">
                    <input
                      className="
            cursor-pointer
            rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      type="submit"
                      value="Compartir"
                    />
                  </div>
                </form>
              </Box>
            </Fade>
          </Modal>
          <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={openComment}
            onClose={handleCloseAddComment}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
              backdrop: {
                timeout: 500,
              },
            }}
          >
            <Fade in={openComment}>
              <Box sx={style}>
                <Typography
                  id="transition-modal-title"
                  variant="h6"
                  component="h2"
                >
                  Escribir comentario
                </Typography>

                <form onSubmit={writeComment}>
                  <div className="mt-10 ">
                    <div className="">
                      <label className="block text-md font-medium leading-6 text-gray-900">
                        Comentario
                      </label>
                      <div className="mt-2">
                        <textarea
                          value={newComment}
                          onChange={handleChangeNewComment}
                          id="message"
                          rows="6"
                          className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 "
                          placeholder="Escribir un comentario"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-end gap-x-6">
                    <input
                      className="
                      cursor-pointer
                      rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      type="submit"
                      value="Agregar"
                    />
                  </div>
                </form>
              </Box>
            </Fade>
          </Modal>
          <button
            onClick={handleOpenCompartirList}
            disabled={!isOwner}
            className={`${
              isOwner
                ? "bg-green-500 hover:bg-green-700"
                : "bg-green-500 opacity-50 cursor-not-allowed"
            } text-white font-bold py-2 px-4 rounded-full`}
          >
            Compartir tarea
          </button>
        </div>
      </div>
      <div className="mt-6 border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Titulo
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {listaProp.name}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Descripción
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {listaProp.description}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Tareas
            </dt>
            <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <ul
                role="list"
                className="divide-y divide-gray-100 rounded-md border border-gray-200"
              >
                {listaProp.tasks.length > 0 ? (
                  listaProp.tasks.map((task, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6"
                    >
                      <Modal
                        key={i}
                        aria-labelledby="transition-modal-title"
                        aria-describedby="transition-modal-description"
                        open={openModalComments}
                        onClose={handleCloseComments}
                        closeAfterTransition
                        slots={{ backdrop: Backdrop }}
                        slotProps={{
                          backdrop: {
                            timeout: 500,
                          },
                        }}
                      >
                        <Fade key={i} in={openModalComments}>
                          <Box sx={style}>
                            <Typography
                              id="transition-modal-title"
                              variant="h6"
                              component="h2"
                            >
                              Comentarios
                            </Typography>
                            {comentariosView ? (
                              comentariosView.map((comment, i) => (
                                <article
                                  key={i}
                                  className="p-6 mb-3 text-base bg-[#F3F3F3] border-t border-gray-200 shadow-lg rounded-sm"
                                >
                                  <footer className="flex justify-between items-center mb-2">
                                    <div className="flex items-center">
                                      <p className="inline-flex items-center mr-3 text-sm text-gray-900  font-semibold">
                                        {comment.id}
                                      </p>
                                      <p className="text-sm text-gray-600 italic">
                                        <time>{comment.timestamp}</time>
                                      </p>
                                    </div>

                                    <div
                                      id="dropdownComment3"
                                      className="hidden z-10 w-36 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600"
                                    >
                                      <ul
                                        className="py-1 text-sm text-gray-700 dark:text-gray-200"
                                        aria-labelledby="dropdownMenuIconHorizontalButton"
                                      >
                                        <li>
                                          <a
                                            href="#"
                                            className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                          >
                                            Edit
                                          </a>
                                        </li>
                                        <li>
                                          <a
                                            href="#"
                                            className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                          >
                                            Remove
                                          </a>
                                        </li>
                                        <li>
                                          <a
                                            href="#"
                                            className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                          >
                                            Report
                                          </a>
                                        </li>
                                      </ul>
                                    </div>
                                  </footer>
                                  <p className="text-black">
                                    {comment.comment}
                                  </p>
                                  <div className="flex items-center mt-4 space-x-4"></div>
                                </article>
                              ))
                            ) : (
                              <h1>Esta tarea no tiene comentarios</h1>
                            )}
                          </Box>
                        </Fade>
                      </Modal>

                      <div className="flex   items-center">
                        <a
                          onClick={() => {
                            handleOpenComments(task.comments);
                          }}
                          className="cursor-pointer flex flex-row gap-1"
                        >
                          {task?.comments?.length > 0 ? (
                            <strong>{task?.comments.length}</strong>
                          ) : (
                            <strong>0</strong>
                          )}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                            />
                          </svg>
                        </a>

                        <div className="ml-4 flex min-w-0 flex-1 gap-2">
                          <span className="truncate font-medium">
                            {task.name}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 grid grid-cols-2 gap-2 flex-shrink-0">
                        <button
                         disabled={ !isOwner && !isSharedWithUser}
                          onClick={() => deleteTaskArray(task.name)}
                          href="#"
                          className="font-medium text-red-600 hover:text-red-500"
                        >
                          Remover
                        </button>
                        <button
                          onClick={() => {
                            handleOpenAddComment(task, i),
                              setTaskToComment(task);
                          }}
                          href="#"
                          className="font-medium text-sky-800-600 hover:text-sky-800-500"
                        >
                          Escribir comentario
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    Todavia no agregaste ninguna tarea
                  </span>
                )}
              </ul>
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Creador
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {listaProp.owner}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default ListaInfo;
