const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const connectDB = require("./config/db");

const apiRoutes = require("./routes/api");
const matchRoutes = require('./routes/matchRoutes');
const teamRoutes = require('./routes/teamRoutes')
const draftRoutes = require("./routes/draftroutes");
const liveRoutes = require('./routes/liveRoutes');
const xpressionRoutes = require("./routes/xpressionRoutes");

const { serverLogger } = require("./modules/logger");

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());

// Connect to MongoDB
connectDB();

// Use API routes
app.use("/api", apiRoutes);
app.use("/api/draft", draftRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/teams', teamRoutes);
app.use("/api/xpression", xpressionRoutes);

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST"],
  },
});

// Socket.IO events
io.on("connection", (socket) => {
  serverLogger.info(`User connected: ${socket.id}`);

//   socket.on('init', () => {
//   })

  socket.on("disconnect", () => {
    // serverLogger.info(`Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 9006;
server.listen(PORT, () => 
  serverLogger.warn(`🚀 Server running on port ${PORT}`)
);
