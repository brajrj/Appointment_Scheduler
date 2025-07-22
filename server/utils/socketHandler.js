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

    socket.join(`user_${socket.userId}`);

    if (socket.userRole === 'BUSINESS_OWNER') {
      socket.join(`business_${socket.userId}`);
    }

    if (socket.userRole === 'ADMIN') {
      socket.join('admin');
    }

    socket.on('appointment_booked', (data) => {
      socket.to(`user_${data.providerId}`).emit('new_appointment', data);
      
      socket.to('admin').emit('new_appointment', data);
    });

    
    socket.on('appointment_updated', (data) => {
      socket.to(`user_${data.userId}`).emit('appointment_updated', data);
      
      socket.to(`user_${data.providerId}`).emit('appointment_updated', data);
      
      socket.to('admin').emit('appointment_updated', data);
    });

    socket.on('appointment_cancelled', (data) => {
      socket.to(`user_${data.userId}`).emit('appointment_cancelled', data);
      
      socket.to(`user_${data.providerId}`).emit('appointment_cancelled', data);
      
      socket.to('admin').emit('appointment_cancelled', data);
    });

    socket.on('notification_sent', (data) => {
      socket.to(`user_${data.userId}`).emit('new_notification', data);
    });

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

    socket.on('availability_updated', (data) => {
      socket.broadcast.emit('availability_updated', data);
    });

    socket.on('business_profile_updated', (data) => {
      socket.broadcast.emit('business_profile_updated', data);
    });

    socket.on('service_updated', (data) => {
      socket.broadcast.emit('service_updated', data);
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

module.exports = socketHandler;
