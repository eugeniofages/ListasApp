// firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
require('firebase/auth');
require('firebase/firestore');
const firebase = require('firebase/app');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://<lista-de-tareas-9f5c5>.firebaseio.com'
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth };
