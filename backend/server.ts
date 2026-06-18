import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./src/app.js";
import { initSocket } from "./src/services/socketService.js";

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

// Initialize Socket.io
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`👉 Test API: http://localhost:${PORT}`);
});
