import React, { useEffect } from "react";
import Notificacion from "./Notificacion";
import useLists from "../../hooks/useLists";
import io from "socket.io-client";
const socket = io("http://localhost:3000");
const Notificaciones = () => {
  const { getNotifications, notifications, setNotifications } = useLists();
  useEffect(()=>{
  getNotifications();
      console.log(notifications,'notifications')

},[])
  useEffect(() => {
    socket.on("notificationsUpdated", ({ notifications, message }) => {
      console.log("nueva notificacion", notifications);
      setNotifications(notifications);
    });

    return () => {
      socket.off("notificationsUpdated");
    };
  }, []);

  // useEffect(() => {
  //   getNotificationsSocket();
  // }, []);
  return (
    <div>
      {notifications?.map((notification) => (
        <Notificacion key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

export default Notificaciones;
