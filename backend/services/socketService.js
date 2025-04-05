let io;

module.exports = {
  init: (httpServer) => {
    io = require('socket.io')(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });
    
    // Authentication middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      // Verify token (simplified - in a real app, use JWT verification)
      // The actual JWT verification would happen here
      socket.userId = 'user_id_from_token';
      next();
    });
    
    // Handle connections
    io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);
      
      // User joins their personal room for notifications
      if (socket.userId) {
        socket.join(`user:${socket.userId}`);
      }
      
      // Join order tracking room
      socket.on('join-order-tracking', ({ orderId }) => {
        socket.join(`order:${orderId}`);
      });
      
      // Leave order tracking room
      socket.on('leave-order-tracking', ({ orderId }) => {
        socket.leave(`order:${orderId}`);
      });
      
      // Disconnect
      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
    
    return io;
  },
  
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized');
    }
    return io;
  },
  
  // Notify restaurant owner about new order
  notifyNewOrder: (userId, order) => {
    if (io) {
      io.to(`user:${userId}`).emit('new-order', {
        orderId: order._id,
        customerName: order.customer.name,
        total: order.total
      });
    }
  },
  
  // Notify customer about order status update
  notifyOrderStatusUpdate: (userId, order) => {
    if (io) {
      io.to(`user:${userId}`).emit('order-status-update', {
        orderId: order._id,
        status: order.status
      });
    }
  },
  
  // Update rider location for an order
  updateRiderLocation: (orderId, location) => {
    if (io) {
      io.to(`order:${orderId}`).emit('rider-location-update', {
        orderId,
        location
      });
    }
  }
};
