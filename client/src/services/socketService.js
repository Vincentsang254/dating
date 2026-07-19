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
      console.log("Socket connected:", this.socket.id);
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
      this.socket.emit("user_online", userId);
    }
  }

  emitMessageSend(data) {
    if (this.socket && this.connected) {
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
      this.socket.emit("call_initiate", data);
    }
  }

  emitCallAccept(data) {
    if (this.socket && this.connected) {
      this.socket.emit("call_accept", data);
    }
  }

  emitCallReject(data) {
    if (this.socket && this.connected) {
      this.socket.emit("call_reject", data);
    }
  }

  emitCallEnd(data) {
    if (this.socket && this.connected) {
      this.socket.emit("call_end", data);
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
      this.socket.on("message_receive", callback);
    }
  }

  onUserStatus(callback) {
    if (this.socket) {
      this.socket.on("user_status", callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on("user_typing", callback);
    }
  }

  onUserStopTyping(callback) {
    if (this.socket) {
      this.socket.on("user_stop_typing", callback);
    }
  }

  onCallIncoming(callback) {
    if (this.socket) {
      this.socket.on("call_incoming", callback);
    }
  }

  onCallAccepted(callback) {
    if (this.socket) {
      this.socket.on("call_accepted", callback);
    }
  }

  onCallRejected(callback) {
    if (this.socket) {
      this.socket.on("call_rejected", callback);
    }
  }

  onCallEnded(callback) {
    if (this.socket) {
      this.socket.on("call_ended", callback);
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
