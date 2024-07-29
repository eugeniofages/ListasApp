const express = require("express");
const router = express.Router();
const { auth, db } = require("../firebase");

router.post("/login", async (req, res) => {
  const { idToken } = req.body;
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const userRecord = await auth.getUser(uid);
    const customToken = await auth.createCustomToken(uid);

    res.status(200).send({ token: idToken, auth:{ userRecord, uid} });
  } catch (error) {
    res.status(401).send({ error: error.message });
  }
});

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    await db.collection("users").doc(userRecord.uid).set({
      email,
      name,
    });

    res.status(201).send({
      message: "Usuario registrado exitosamente",
      uid: userRecord.uid,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
