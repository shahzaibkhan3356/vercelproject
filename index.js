                                                                                                                                                               │
 │     1 const admin = require("firebase-admin");                                                                                                                  │
 │     2 const express = require("express");                                                                                                                       │
 │     3                                                                                                                                                           │
 │     4 const app = express();                                                                                                                                    │
 │     5 app.use(express.json());                                                                                                                                  │
 │     6                                                                                                                                                           │
 │     7 // Initialize Firebase Admin SDK                                                                                                                          │
 │     8 // IMPORTANT: Set these as environment variables in your hosting provider                                                                                 │
 │     9 const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);                                                                              │
 │    10                                                                                                                                                           │
 │    11 admin.initializeApp({                                                                                                                                     │
 │    12   credential: admin.credential.cert(serviceAccount),                                                                                                      │
 │    13 });                                                                                                                                                       │
 │    14                                                                                                                                                           │
 │    15 app.post("/send-notification", async (req, res) => {                                                                                                      │
 │    16   const { senderId, receiverId, message } = req.body;                                                                                                     │
 │    17                                                                                                                                                           │
 │    18   if (!senderId || !receiverId || !message) {                                                                                                             │
 │    19     return res.status(400).send("Missing required fields");                                                                                               │
 │    20   }                                                                                                                                                       │
 │    21                                                                                                                                                           │
 │    22   try {                                                                                                                                                   │
 │    23     // Get receiver's FCM token from Firestore                                                                                                            │
 │    24     const receiverDoc = await admin.firestore().collection("Users").doc(receiverId).get();                                                                │
 │    25     const receiver = receiverDoc.data();                                                                                                                  │
 │    26                                                                                                                                                           │
 │    27     if (!receiver || !receiver.fcmToken) {                                                                                                                │
 │    28       return res.status(404).send("Receiver or FCM token not found");                                                                                     │
 │    29     }                                                                                                                                                     │
 │    30                                                                                                                                                           │
 │    31     // Get sender's info                                                                                                                                  │
 │    32     const senderDoc = await admin.firestore().collection("Users").doc(senderId).get();                                                                    │
 │    33     const sender = senderDoc.data();                                                                                                                      │
 │    34                                                                                                                                                           │
 │    35     if (!sender) {                                                                                                                                        │
 │    36       return res.status(404).send("Sender not found");                                                                                                    │
 │    37     }                                                                                                                                                     │
 │    38                                                                                                                                                           │
 │    39     const payload = {                                                                                                                                     │
 │    40       notification: {                                                                                                                                     │
 │    41         title: `New message from ${sender.email}`,                                                                                                        │
 │    42         body: message,                                                                                                                                    │
 │    43         sound: "default",                                                                                                                                 │
 │    44       },                                                                                                                                                  │
 │    45     };                                                                                                                                                    │
 │    46                                                                                                                                                           │
 │    47     await admin.messaging().sendToDevice(receiver.fcmToken, payload);                                                                                     │
 │    48     res.status(200).send("Notification sent successfully");                                                                                               │
 │    49   } catch (error) {                                                                                                                                       │
 │    50     console.error("Error sending notification:", error);                                                                                                  │
 │    51     res.status(500).send("Internal Server Error");                                                                                                        │
 │    52   }                                                                                                                                                       │
 │    53 });                                                                                                                                                       │
 │    54                                                                                                                                                           │
 │    55 // Export the app for serverless environments                                                                                                             │
 │    56 module.exports = app;          