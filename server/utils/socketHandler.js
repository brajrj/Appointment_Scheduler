const jwt = require('jsonwebtoken');

const socketHandler = (io) => {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Join business owners to their business room
    if (socket.userRole === 'BUSINESS_OWNER') {
      socket.join(`business_${socket.userId}`);
    }

    // Join admin to admin room
    if (socket.userRole === 'ADMIN') {
      socket.join('admin');
    }

    // Handle appointment booking events
    socket.on('appointment_booked', (data) => {
      // Notify the provider
      socket.to(`user_${data.providerId}`).emit('new_appointment', data);
      
      // Notify admins
      socket.to('admin').emit('new_appointment', data);
    });

    // Handle appointment updates
    socket.on('appointment_updated', (data) => {
      // Notify the user
      socket.to(`user_${data.userId}`).emit('appointment_updated', data);
      
      // Notify the provider
      socket.to(`user_${data.providerId}`).emit('appointment_updated', data);
      
      // Notify admins
      socket.to('admin').emit('appointment_updated', data);
    });

    // Handle appointment cancellations
    socket.on('appointment_cancelled', (data) => {
      // Notify the user
      socket.to(`user_${data.userId}`).emit('appointment_cancelled', data);
      
      // Notify the provider
      socket.to(`user_${data.providerId}`).emit('appointment_cancelled', data);
      
      // Notify admins
      socket.to('admin').emit('appointment_cancelled', data);
    });

    // Handle notification events
    socket.on('notification_sent', (data) => {
      // Send notification to specific user
      socket.to(`user_${data.userId}`).emit('new_notification', data);
    });

    // Handle typing indicators (for chat if implemented)
    socket.on('typing_start', (data) => {
      socket.to(`user_${data.recipientId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(`user_${data.recipientId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: false
      });
    });

    // Handle availability updates
    socket.on('availability_updated', (data) => {
      // Notify all users about availability changes
      socket.broadcast.emit('availability_updated', data);
    });

    // Handle business profile updates
    socket.on('business_profile_updated', (data) => {
      // Notify all users about business profile changes
      socket.broadcast.emit('business_profile_updated', data);
    });

    // Handle service updates
    socket.on('service_updated', (data) => {
      // Notify all users about service changes
      socket.broadcast.emit('service_updated', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

module.exports = socketHandler;
