import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import useLists from "../../hooks/useLists";
import Listas from "../../components/Listas";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
const socket = io("http://localhost:3000");

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function Home() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const {
    agregarLista,
    addNewTaskFromSocket,
    setNotifications,
    getLists,
    notifications,
    getNotifications,
    addNewNotificationFromSocket
  } = useLists();

  React.useEffect(() => {
    socket.on("notificationsUpdated", ({ notifications, message }) => {
      toast.info('Has recibido una nueva notificación')
    });

    return () => {
      socket.off("notificationsUpdated");
    };
  }, [getLists]);

  React.useEffect(() => {
    socket.on("newTask", (task) => {
      addNewTaskFromSocket(task);
    });

    return () => {
      socket.off("newTask");
    };
  }, [addNewTaskFromSocket]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const resetFilters = () => {
      setName("");
      setDescription("");
      setOpen(false);
    };

    if (name && description != "") {
      try {
        addTask();
        resetFilters();
      } catch (error) {}
    }
  };
  const addTask = async () => {
    await agregarLista(name, description);
  };
  const handleChangeName = (event) => {
    setName(event.target.value);
    console.log(name);
  };

  const handleChangeDescription = (event) => {
    setDescription(event.target.value);
    console.log(description);
  };
  return (
    <div>
      <Button onClick={handleOpen}>Agregar nueva lista</Button>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <Typography id="transition-modal-title" variant="h6" component="h2">
              Nueva lista
            </Typography>

            <form onSubmit={handleSubmit}>
              <label>
                Nombre:
                <input type="text" value={name} onChange={handleChangeName} />
              </label>

              <label>
                Description:
                <input
                  type="text"
                  value={description}
                  onChange={handleChangeDescription}
                />
              </label>
              <input type="submit" value="Agregar" />
            </form>
          </Box>
        </Fade>
      </Modal>

      <Listas />
    </div>
  );
}
