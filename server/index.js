const cookieParser = require("cookie-parser");
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const matchingRoutes = require("./routes/matchingRoutes");
const messagingRoutes = require("./routes/messagingRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();
const app = express();
const server = http.createServer(app);
const port = 3001;

// Socket.IO initialization with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "https://dating-rpig.onrender.com",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "https://dating-rpig.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Make io available to routes
app.set("io", io);

const db = require("./models");
const jwt = require("jsonwebtoken");
const { checkPremiumStatus } = require("./utils/checkPremiumStatus");

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy.", data: null });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/messaging", messagingRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Internal Server Error", data: null, error: err.message });
});


  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));
  
  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
  });
  }

db.sequelize.sync().then(() => {
  // Socket.IO connection handling
  const onlineUsers = new Map(); // Map of userId -> socketId

  const broadcastUserStatus = (userId, status, lastSeenAt = null) => {
    io.emit("user_status", { userId, status, lastSeenAt });
  };

  io.on("connection", (socket) => {
    console.log(`[${new Date().toISOString()}] New socket connected: ${socket.id}`);

    // Authenticate socket connection using token sent in handshake
    (async () => {
      try {
        const tokenAuth = socket.handshake.auth?.token || socket.handshake.headers?.authorization || socket.handshake.query?.token;
        const token = typeof tokenAuth === "string" && tokenAuth.startsWith("Bearer ") ? tokenAuth.slice(7) : tokenAuth;

        if (!token) {
          socket.emit("unauthorized", { message: "No token provided" });
          socket.disconnect(true);
          return;
        }

        const decoded = jwt.verify(token, "sangkiplaimportantkey");
        const user = await db.Users.findByPk(decoded.id);
        if (!user) {
          socket.emit("unauthorized", { message: "Invalid token - user not found" });
          socket.disconnect(true);
          return;
        }

        socket.userId = user.id;
        onlineUsers.set(user.id, socket.id);
        // Broadcast user online status to all connected users
        broadcastUserStatus(user.id, "online", null);
      } catch (err) {
        socket.emit("unauthorized", { message: "Invalid token" });
        socket.disconnect(true);
        return;
      }
    })();

    // Backwards-compatible explicit online event (keeps behavior if client still emits it)
    socket.on("user_online", (userId) => {
      console.log(`[${new Date().toISOString()}] user_online received from socket ${socket.id} for user ${userId}`);
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      broadcastUserStatus(userId, "online", null);
    });

    // Send message event
    socket.on("message_send", (data) => {
      const { conversationId, recipientId, senderId } = data;
      
      // Emit to recipient if they're online
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("message_receive", data);
      }
    });

    // Typing indicator
    socket.on("typing", (data) => {
      const { conversationId, recipientId } = data;
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("user_typing", {
          conversationId,
          senderId: socket.userId,
        });
      }
    });

    // Stop typing indicator
    socket.on("stop_typing", (data) => {
      const { conversationId, recipientId } = data;
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("user_stop_typing", {
          conversationId,
          senderId: socket.userId,
        });
      }
    });

    // Voice/Video call initiation - verify match and premium status server-side
    socket.on("call_initiate", async (data) => {
      console.log(`[${new Date().toISOString()}] call_initiate from socket ${socket.id}:`, data);
      try {
        const { recipientId, callType, callId } = data;
        const callerId = socket.userId;

        if (!callerId) {
          socket.emit("call_rejected", { callId, reason: "unauthenticated" });
          return;
        }

        // Verify users are matched
        const match = await db.Matches.findOne({
          where: {
            [db.Sequelize.Op.or]: [
              { userId: callerId, matchedUserId: recipientId },
              { userId: recipientId, matchedUserId: callerId },
            ],
            status: "accepted",
          },
        });

        if (!match) {
          socket.emit("call_rejected", { callId, reason: "not_matched" });
          return;
        }

        // For voice/video calls, check premium status
        if (callType === "video" || callType === "voice") {
          const isPremium = await checkPremiumStatus(callerId);
          if (!isPremium) {
            socket.emit("call_rejected", { callId, reason: "premium_required" });
            return;
          }
        }

        const recipientSocketId = onlineUsers.get(recipientId);
        if (recipientSocketId) {
          console.log(`[${new Date().toISOString()}] Relaying call_incoming to socket ${recipientSocketId} for user ${recipientId}`);
          io.to(recipientSocketId).emit("call_incoming", {
            senderId: callerId,
            callType,
            callId,
          });
        } else {
          console.log(`[${new Date().toISOString()}] call_initiate failed: recipient ${recipientId} offline`);
          socket.emit("call_rejected", { callId, reason: "recipient_offline" });
        }
      } catch (error) {
        console.error(error);
        socket.emit("call_rejected", { callId: data.callId, reason: "internal_error" });
      }
    });

    socket.on("call_offer", (data) => {
      console.log(`[${new Date().toISOString()}] call_offer from ${socket.userId}:`, { callId: data.callId, to: data.recipientId });
      const { recipientId, callId, sdp, callType } = data;
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        console.log(`[${new Date().toISOString()}] Relaying call_offer to socket ${recipientSocketId}`);
        io.to(recipientSocketId).emit("call_offer", {
          senderId: socket.userId,
          callId,
          sdp,
          callType,
        });
      } else {
        console.log(`[${new Date().toISOString()}] call_offer failed: recipient ${recipientId} offline`);
      }
    });

    socket.on("call_answer", (data) => {
      console.log(`[${new Date().toISOString()}] call_answer from ${socket.userId}:`, { callId: data.callId, to: data.recipientId });
      const { recipientId, callId, sdp } = data;
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        console.log(`[${new Date().toISOString()}] Relaying call_answer to socket ${recipientSocketId}`);
        io.to(recipientSocketId).emit("call_answer", {
          senderId: socket.userId,
          callId,
          sdp,
        });
      } else {
        console.log(`[${new Date().toISOString()}] call_answer failed: recipient ${recipientId} offline`);
      }
    });

    socket.on("call_ice_candidate", (data) => {
      console.log(`[${new Date().toISOString()}] call_ice_candidate from ${socket.userId}:`, { callId: data.callId, to: data.recipientId });
      const { recipientId, callId, candidate } = data;
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("call_ice_candidate", {
          senderId: socket.userId,
          callId,
          candidate,
        });
      }
    });

    // Call acceptance
    socket.on("call_accept", (data) => {
      const { senderId, callId } = data;
      console.log(`[${new Date().toISOString()}] call_accept from ${socket.userId} for sender ${senderId} call ${callId}`);
      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("call_accepted", {
          callId,
          recipientId: socket.userId,
        });
      }
    });

    // Call rejection
    socket.on("call_reject", (data) => {
      const { senderId, callId } = data;
      console.log(`[${new Date().toISOString()}] call_reject from ${socket.userId} for sender ${senderId} call ${callId}`);
      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("call_rejected", {
          callId,
          recipientId: socket.userId,
        });
      }
    });

    // Call end
    socket.on("call_end", (data) => {
      const { recipientId, callId } = data;
      console.log(`[${new Date().toISOString()}] call_end from ${socket.userId} to ${recipientId} call ${callId}`);
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("call_ended", {
          callId,
          senderId: socket.userId,
        });
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        broadcastUserStatus(socket.userId, "offline", Date.now());
      }
      console.log("User disconnected:", socket.id);
    });
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
