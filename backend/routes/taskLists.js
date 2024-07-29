const express = require("express");
const router = express.Router();
const { db } = require("../firebase");
const authenticate = require("../middleware/authMiddleware");
const moment = require("moment-timezone");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
module.exports = (io) => {
  router.use(authenticate);

  const socketNotification = async (uid, message, listId) => {
    try {
      const taskListDoc = await db.collection("taskLists").doc(listId).get();
      if (!taskListDoc.exists) {
        throw new Error("Task list not found");
      }

      const sharedWith = taskListDoc.data().sharedWith || [];

      const userIds = new Set();

      userIds.add(uid);

      for (const sharedUser of sharedWith) {
        const { userId } = sharedUser;
        userIds.add(userId);
      }

      for (const userId of userIds) {
        await sendNotification(userId, message);

        const notificationsSnapshot = await db
          .collection("notifications")
          .where("userId", "==", userId)
          .orderBy("timestamp", "asc")
          .get();

        const notifications = notificationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        io.emit("notificationsUpdated", {
          notifications,
          message: message,
        });
      }
    } catch (error) {
      console.error("Error sending notifications:", error);
    }
  };

  const sendNotification = async (idUser, message) => {
    const notification = {
      userId: idUser,
      message,
      timestamp: new Date().toISOString(),
    };
    try {
      await db.collection("notifications").add(notification);
      console.log("Notification saved:", notification);
    } catch (error) {
      console.error("Error saving notification:", error);
    }
  };

  router.get("/shared-lists", async (req, res) => {
    try {
      const listsRef = db.collection("taskLists");
      const snapshot = await listsRef.get();

      const sharedLists = [];

      snapshot.forEach((doc) => {
        const listData = doc.data();
        const sharedWith = listData.sharedWith || [];

        if (sharedWith.some((user) => user.userId === req.uid)) {
          sharedLists.push({ id: doc.id, ...listData });
        }
      });

      res.status(200).json(sharedLists);
    } catch (error) {
      console.error("Error trayendo las listas:", error);
      res.status(500).json({ error: "Error trayendo las listas" });
    }
  });
  router.get("/notifications", async (req, res) => {
    try {
      if (!req.uid) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }
      console.log(req.uid);
      const notificationsSnapshot = await db
        .collection("notifications")
        .where("userId", "==", req.uid)
        .orderBy("timestamp", "asc")
        .get();
      const notifications = notificationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      res.status(200).json(notifications);
    } catch (error) {
      console.log("error backend", error);
    }
  });
  router.post("/removeTask", async (req, res) => {
    const { listId, taskName } = req.body;

    try {
      const listRef = db.collection("taskLists").doc(listId);
      let listDoc = await listRef.get();

      if (!listDoc.exists) {
        return res.status(404).send({ error: "Lista no encontrada" });
      }

      let tasks = listDoc.data().tasks || [];
      tasks = tasks.filter((task) => task.name !== taskName);

      await listRef.update({ tasks });

      listDoc = await listRef.get();
      const updatedList = { id: listRef.id, ...listDoc.data() };

      // const updatedList = (await listRef.get()).data();

      io.emit("listUpdated", { listId: listRef.id, updatedList });
      socketNotification(
        req.uid,
        `La tarea ${taskName} fue eliminada de la lista ${listRef.id} `,
        listId
      );
      res.status(200).send({
        success: true,
        message: "Tarea eliminada con éxito",
        updatedList,
      });
    } catch (error) {
      res.status(500).send({ error: `Error al eliminar la tarea, ${error}` });
    }
  });

  router.post("/share", async (req, res) => {
    const { listId, userId, permissions, typeNotification, user } = req.body;

    if (!listId || !userId || !permissions) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }
    try {
      const listRef = db.collection("taskLists").doc(listId);
      const listDoc = await listRef.get();

      if (!listDoc.exists) {
        return res.status(404).json({ error: "Lista no encontrada" });
      }
      const listData = listDoc.data();
      if (listData.owner !== req.uid) {
        return res.status(403).json({ error: "No permitido." });
      }

      const updatedSharedWith = listData.sharedWith || [];
      const userExists = updatedSharedWith.findIndex(
        (user) => user.userId === userId
      );
      if (userExists !== -1) {
        return res.status(400).json({ error: "El usuario ya existe" });
      }
      updatedSharedWith.push({
        userId,
        permissions,
      });

      await listRef.update({
        sharedWith: updatedSharedWith,
      });

      if (typeNotification === "to-email") {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Acceso a la lista de tareas compartida",
          text: `Hola ${user.displayName},\n\nTe han compartido una lista de tareas.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            return res.status(500).json({ error: "Error al enviar el correo" });
          }
          console.log("Email sent:", info.response);
        });
      } else if (typeNotification === "push-notifications") {
        const message = `Fuiste agregado a la lista ${listRef.id} .`;
        await sendNotification(userId, message);
      }

      res.status(200).json({ message: "Usuario agregado a la lista" });
    } catch (error) {
      console.error("Error adding user to list:", error);

      return res.json(error);
    }
  });
  router.post("/task/comment", async (req, res) => {
    const { listId, comment, idTask } = req.body;
    try {
      const listRef = db.collection("taskLists").doc(listId);
      let listDoc = await listRef.get();
      if (!listDoc.exists) {
        return res.status(404).send({ error: "Lista no encontrada" });
      }
      const tasks = listDoc.data().tasks || [];
      const taskIndex = tasks.findIndex((task) => task.id === idTask);
      if (taskIndex !== -1) {
        const newComment = {
          id: req.uid,
          timestamp: moment().tz("America/Argentina/Buenos_Aires").format(),
          comment: comment,
        };
        tasks[taskIndex].comments = tasks[taskIndex].comments || [];
        tasks[taskIndex].comments.push(newComment);

        await listRef.update({ tasks });

        listDoc = await listRef.get();

        const updatedList = { id: listRef.id, ...listDoc.data() };

        io.emit("listUpdated", { listId: listRef.id, updatedList });
        socketNotification(
          req.uid,
          `Escribieron un comentario en la tarea ${listRef.id} `,
          listId
        );
        res.status(200).send("Comentario agregado exitosamente.");
      } else {
        res.status(404).send("Tarea no encontrada.");
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: error });
    }
  });
  router.post("/addTask", async (req, res) => {
    const { listId, task } = req.body;

    try {
      const listRef = db.collection("taskLists").doc(listId);
      let listDoc = await listRef.get();

      if (!listDoc.exists) {
        return res.status(404).send({ error: "Lista no encontrada" });
      }

      const tasks = listDoc.data().tasks || [];
      const newTask = {
        id: db.collection("lists").doc().id,
        name: task,
      };
      tasks.push(newTask);

      await listRef.update({ tasks });

      listDoc = await listRef.get();

      const updatedList = { id: listRef.id, ...listDoc.data() };

      io.emit("listUpdated", { listId: listRef.id, updatedList });
      socketNotification(
        req.uid,
        `La tarea ${newTask.name} fue agregada a la lista ${listRef.id} `,
        listId
      );
      res.status(200).send({
        success: true,
        message: "Tarea agregada con éxito",
        updatedList: updatedList,
      });
    } catch (error) {
      res.status(500).send({ error: `Error al agregar la tarea, ${error}` });
    }
  });

  router.get("/", async (req, res) => {
    try {
      const taskListsSnapshot = await db
        .collection("taskLists")
        .where("owner", "==", req.uid)
        .get();
      const taskLists = taskListsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      res.status(200).send(taskLists);
    } catch (error) {
      res.status(500).send({ error: "Error obteniendo las listas de tareas" });
    }
  });
  router.get("/:id", async (req, res) => {
    const taskListId = req.params.id;
    const userId = req.uid;
    try {
      const taskListRef = db.collection("taskLists").doc(taskListId);
      const taskListSnapshot = await taskListRef.get();

      if (!taskListSnapshot.exists) {
        return res.status(404).send({ error: "Lista de tareas no encontrada" });
      }

      const checkData = taskListSnapshot.data();
      const isOwner = checkData.owner === userId;
      const isSharedWithUser = checkData.sharedWith.some(
        (user) => user.userId === userId
      );

      if (!isOwner && !isSharedWithUser) {
        return res.status(403).send({ error: "Acceso denegado" });
      }
      const taskList = { id: taskListSnapshot.id, ...taskListSnapshot.data() };
      res.status(200).send(taskList);
    } catch (error) {
      res.status(500).send({ error: "Error obteniendo la lista de tareas" });
    }
  });
  router.post("/create", async (req, res) => {
    const { name, description } = req.body;

    try {
      const taskListRef = await db.collection("taskLists").add({
        name,
        description,
        owner: req.uid,
        sharedWith: [],
        tasks: [],
      });

      const newTaskList = {
        id: taskListRef.id,
        name,
        description,
        owner: req.uid,
        sharedWith: [],
        tasks: [],
      };

      io.emit("newTask", newTaskList);

      res.status(200).send(newTaskList);
    } catch (error) {
      res.status(500).send({ error: "Error creando la lista de tareas" });
    }
  });
  return router;
};
