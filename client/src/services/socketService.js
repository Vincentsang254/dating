import io from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(window.location.origin, {
      auth: {
        token: `Bearer ${token}`,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log(`[${new Date().toISOString()}] Socket connected: ${this.socket.id}`);
      this.connected = true;
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
      this.connected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.connected = false;
    }
  }

  emitUserOnline(userId) {
    if (this.socket && this.connected) {
      console.log(`[${new Date().toISOString()}] emit user_online: ${userId}`);
      this.socket.emit("user_online", userId);
    }
  }

  emitMessageSend(data) {
    if (this.socket && this.connected) {
      console.log(`[${new Date().toISOString()}] emit message_send:`, data);
      this.socket.emit("message_send", data);
    }
  }

  emitTyping(data) {
    if (this.socket && this.connected) {
      this.socket.emit("typing", data);
    }
  }

  emitStopTyping(data) {
    if (this.socket && this.connected) {
      this.socket.emit("stop_typing", data);
    }
  }

  emitCallInitiate(data) {
    if (this.socket && this.connected) {
      console.log(`[${new Date().toISOString()}] emit call_initiate:`, data);
      this.socket.emit("call_initiate", data);
    }
  }

  emitCallAccept(data) {
    if (this.socket && this.connected) {
      console.log(`[${new Date().toISOString()}] emit call_accept:`, data);
      this.socket.emit("call_accept", data);
    }
  }

  emitCallReject(data) {
    if (this.socket && this.connected) {
      console.log(`[${new Date().toISOString()}] emit call_reject:`, data);
      this.socket.emit("call_reject", data);
    }
  }

  emitCallEnd(data) {
    if (this.socket && this.connected) {
      console.log(`[${new Date().toISOString()}] emit call_end:`, data);
      this.socket.emit("call_end", data);
    }
  }

  emitCallOffer(data) {
    if (this.socket && this.connected) {
      console.log(`[${new Date().toISOString()}] emit call_offer:`, data);
      this.socket.emit("call_offer", data);
    }
  }

  emitCallAnswer(data) {
    if (this.socket && this.connected) {
      console.log(`[${new Date().toISOString()}] emit call_answer:`, data);
      this.socket.emit("call_answer", data);
    }
  }

  emitCallIceCandidate(data) {
    if (this.socket && this.connected) {
      console.log(`[${new Date().toISOString()}] emit call_ice_candidate:`, data);
      this.socket.emit("call_ice_candidate", data);
    }
  }

  emitCallOffer(data) {
    if (this.socket && this.connected) {
      this.socket.emit("call_offer", data);
    }
  }

  emitCallAnswer(data) {
    if (this.socket && this.connected) {
      this.socket.emit("call_answer", data);
    }
  }

  emitCallIceCandidate(data) {
    if (this.socket && this.connected) {
      this.socket.emit("call_ice_candidate", data);
    }
  }

  onMessageReceive(callback) {
    if (this.socket) {
      this.socket.on("message_receive", (data) => {
        console.log(`[${new Date().toISOString()}] on message_receive:`, data);
        callback(data);
      });
    }
  }

  onUserStatus(callback) {
    if (this.socket) {
      this.socket.on("user_status", (data) => {
        console.log(`[${new Date().toISOString()}] on user_status:`, data);
        callback(data);
      });
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on("user_typing", (data) => {
        console.log(`[${new Date().toISOString()}] on user_typing:`, data);
        callback(data);
      });
    }
  }

  onUserStopTyping(callback) {
    if (this.socket) {
      this.socket.on("user_stop_typing", (data) => {
        console.log(`[${new Date().toISOString()}] on user_stop_typing:`, data);
        callback(data);
      });
    }
  }

  onCallIncoming(callback) {
    if (this.socket) {
      this.socket.on("call_incoming", (data) => {
        console.log(`[${new Date().toISOString()}] on call_incoming:`, data);
        callback(data);
      });
    }
  }

  onCallAccepted(callback) {
    if (this.socket) {
      this.socket.on("call_accepted", (data) => {
        console.log(`[${new Date().toISOString()}] on call_accepted:`, data);
        callback(data);
      });
    }
  }

  onCallRejected(callback) {
    if (this.socket) {
      this.socket.on("call_rejected", (data) => {
        console.log(`[${new Date().toISOString()}] on call_rejected:`, data);
        callback(data);
      });
    }
  }

  onCallEnded(callback) {
    if (this.socket) {
      this.socket.on("call_ended", (data) => {
        console.log(`[${new Date().toISOString()}] on call_ended:`, data);
        callback(data);
      });
    }
  }

  onCallOffer(callback) {
    if (this.socket) {
      this.socket.on("call_offer", (data) => {
        console.log(`[${new Date().toISOString()}] on call_offer:`, data);
        callback(data);
      });
    }
  }

  onCallAnswer(callback) {
    if (this.socket) {
      this.socket.on("call_answer", (data) => {
        console.log(`[${new Date().toISOString()}] on call_answer:`, data);
        callback(data);
      });
    }
  }

  onCallIceCandidate(callback) {
    if (this.socket) {
      this.socket.on("call_ice_candidate", (data) => {
        console.log(`[${new Date().toISOString()}] on call_ice_candidate:`, data);
        callback(data);
      });
    }
  }

  onCallOffer(callback) {
    if (this.socket) {
      this.socket.on("call_offer", callback);
    }
  }

  onCallAnswer(callback) {
    if (this.socket) {
      this.socket.on("call_answer", callback);
    }
  }

  onCallIceCandidate(callback) {
    if (this.socket) {
      this.socket.on("call_ice_candidate", callback);
    }
  }

  removeEventListener(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
    }
  }
}

// Export singleton instance
export default new SocketService();
