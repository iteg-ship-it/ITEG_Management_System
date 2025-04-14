// webhookRoutes.js or inside your main route file
const express = require("express");
const router = express.Router();
const admissionController = require('../modules/student/controllers/admissionProcessStudentControllers'); // adjust path

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

// router.post("/receive/data", (req, res) => {
//   const receivedSignature = req.headers["x-webhook-signature"];
//   const payload = req.body;

//   const expectedSignature = crypto
//     .createHmac("sha256", WEBHOOK_SECRET)
//     .update(JSON.stringify(payload))
//     .digest("hex");

//   if (receivedSignature !== expectedSignature) {
//     console.log("❌ Invalid Signature");
//     return res.status(401).send("Unauthorized");
//   }

//   console.log("✅ Webhook received in actual project:");

//   console.log(payload);

//   // 👉 Process the data: Save to DB, update status, etc.

//   res.status(200).send("Webhook received");
// }
// );



router.post("/receive/data",admissionController.addAdmission);

module.exports = router;
