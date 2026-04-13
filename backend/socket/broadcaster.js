class SlideBroadcaster {
  constructor(io) {
    this.io = io;
    this.batchQueue = new Map();
    this.batchTimeout = null;
    this.batchWindowMs = 50; 
    this.lastCommandTime = {};
  }

  throttleCommand(clientId, eventName, limitMs = 100) {
    const key = `${clientId}_${eventName}`;
    const now = Date.now();
    if (this.lastCommandTime[key] && now - this.lastCommandTime[key] < limitMs) {
      return false; // Throttled
    }
    this.lastCommandTime[key] = now;
    return true; 
  }

  batchEmit(room, event, data) {
    const key = `${room}_${event}`;
    this.batchQueue.set(key, { room, event, data });

    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => {
        this.flushBatch();
      }, this.batchWindowMs);
    }
  }

  flushBatch() {
    this.batchQueue.forEach(({ room, event, data }) => {
      this.io.to(room).emit(event, data);
    });
    this.batchQueue.clear();
    this.batchTimeout = null;
  }

  cleanupClientRooms(socket) {
    const rooms = Array.from(socket.rooms);
    rooms.forEach(room => socket.leave(room));
  }
}

module.exports = SlideBroadcaster;
