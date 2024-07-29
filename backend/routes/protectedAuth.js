const express = require("express");
const router = express.Router();
const { auth } = require("../firebase");
const authenticate = require("../middleware/authMiddleware");

router.use(authenticate);


router.get("/searchUsers", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ message: "Query parameter 'q' is required" });
  }

  try {
    const users = [];
    let nextPageToken;
    do {
      const listUsersResult = await auth.listUsers(1000, nextPageToken);
      listUsersResult.users.forEach((userRecord) => {
        if (
          userRecord.email &&
          userRecord.email.toLowerCase().includes(query.toLowerCase())
        ) {
          users.push({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
          });
        }
      });
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});


router.get('/me', async (req, res) => {
  try {
    const user = await auth.getUser(req.uid);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/logout", async (req, res) => {
  const idToken = req.headers.authorization?.split(" ")[1];
  const decodedToken = await auth.verifyIdToken(idToken);
  const uid = decodedToken.uid;

  try {
    await auth.revokeRefreshTokens(uid);
    res.status(200).json({ message: "Cerraste Sesión" });
  } catch (error) {
    console.error("No se pudo cerrar sesion", error);
    res.status(500).json({ error: "No se pudo cerrar sesion" });
  }
});

module.exports = router;
