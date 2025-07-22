const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { auth, businessOwnerAuth } = require('../middleware/auth');
const { sendEmail } = require('../utils/emailService');
const { createNotification } = require('../utils/notifications');
const moment = require('moment');

const router = express.Router();
const prisma = new PrismaClient();

//all appointments gets here (both admin or user)
router.get('/', businessOwnerAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, date, serviceId } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (req.user.role === 'BUSINESS_OWNER') {
      where.providerId = req.user.userId;
    }
    if (status) where.status = status;
    if (serviceId) where.serviceId = serviceId;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.date = {
        gte: startDate,
        lt: endDate
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    const total = await prisma.appointment.count({ where });

    res.json({
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user appointments
router.get('/my-appointments', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      userId: req.user.userId
    };
    if (status) where.status = status;

    const appointments = await prisma.appointment.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true
          }
        },
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            businessProfile: {
              select: {
                businessName: true,
                phone: true,
                address: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    const total = await prisma.appointment.count({ where });

    res.json({
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create appointment are here
router.post('/', [
  auth,
  body('serviceId').notEmpty(),
  body('providerId').notEmpty(),
  body('date').isISO8601(),
  body('startTime').isISO8601(),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { serviceId, providerId, date, startTime, notes } = req.body;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        businessProfile: {
          include: {
            user: true
          }
        }
      }
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Calculate end time
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(startDateTime.getTime() + service.duration * 60000);

    const overlapping = await prisma.appointment.findFirst({
      where: {
        providerId,
        date: new Date(date),
        status: { not: 'CANCELLED' },
        OR: [
          {
            startTime: { lt: endDateTime },
            endTime: { gt: startDateTime }
          }
        ]
      }
    });

    if (overlapping) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        userId: req.user.userId,
        serviceId,
        providerId,
        date: new Date(date),
        startTime: startDateTime,
        endTime: endDateTime,
        notes
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true
          }
        },
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Send notification to provider
    await createNotification(
      providerId,
      'APPOINTMENT_BOOKED',
      'New Appointment Booked',
      `${appointment.user.firstName} ${appointment.user.lastName} has booked an appointment for ${service.name}`,
      { appointmentId: appointment.id }
    );

    // Send email notifications
    try {
      await sendEmail(
        appointment.user.email,
        'Appointment Booking Confirmation',
        `Your appointment for ${service.name} has been booked for ${moment(startDateTime).format('MMMM DD, YYYY at HH:mm')}`
      );

      await sendEmail(
        appointment.provider.email,
        'New Appointment Booking',
        `You have a new appointment booking from ${appointment.user.firstName} ${appointment.user.lastName} for ${service.name} on ${moment(startDateTime).format('MMMM DD, YYYY at HH:mm')}`
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    req.io.to(`user_${providerId}`).emit('appointment_booked', appointment);

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appointment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true
          }
        },
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            businessProfile: {
              select: {
                businessName: true,
                phone: true,
                address: true
              }
            }
          }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.userId !== req.user.userId && 
        appointment.providerId !== req.user.userId && 
        req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment
router.put('/:id', [
  auth,
  body('date').optional().isISO8601(),
  body('startTime').optional().isISO8601(),
  body('status').optional().isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']),
  body('notes').optional().isString(),
  body('cancelReason').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: {
        service: true,
        user: true,
        provider: true
      }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check permissions
    if (appointment.userId !== req.user.userId && 
        appointment.providerId !== req.user.userId && 
        req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { date, startTime, status, notes, cancelReason } = req.body;
    const updateData = {};

    if (date) updateData.date = new Date(date);
    if (startTime) {
      updateData.startTime = new Date(startTime);
      updateData.endTime = new Date(new Date(startTime).getTime() + appointment.service.duration * 60000);
    }
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;
    if (cancelReason) updateData.cancelReason = cancelReason;

    if (date || startTime) {
      const checkDate = date ? new Date(date) : appointment.date;
      const checkStartTime = startTime ? new Date(startTime) : appointment.startTime;
      const checkEndTime = new Date(checkStartTime.getTime() + appointment.service.duration * 60000);

      const overlapping = await prisma.appointment.findFirst({
        where: {
          id: { not: appointment.id },
          providerId: appointment.providerId,
          date: checkDate,
          status: { not: 'CANCELLED' },
          OR: [
            {
              startTime: { lt: checkEndTime },
              endTime: { gt: checkStartTime }
            }
          ]
        }
      });

      if (overlapping) {
        return res.status(400).json({ message: 'Time slot is already booked' });
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true
          }
        },
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (status) {
      let notificationType, title, message;
      
      switch (status) {
        case 'CONFIRMED':
          notificationType = 'APPOINTMENT_CONFIRMED';
          title = 'Appointment Confirmed';
          message = `Your appointment for ${appointment.service.name} has been confirmed`;
          break;
        case 'CANCELLED':
          notificationType = 'APPOINTMENT_CANCELLED';
          title = 'Appointment Cancelled';
          message = `Your appointment for ${appointment.service.name} has been cancelled`;
          break;
        case 'COMPLETED':
          notificationType = 'APPOINTMENT_COMPLETED';
          title = 'Appointment Completed';
          message = `Your appointment for ${appointment.service.name} has been completed`;
          break;
      }

      if (notificationType) {
        await createNotification(
          appointment.userId,
          notificationType,
          title,
          message,
          { appointmentId: appointment.id }
        );
      }
    }

    // Emit socket event
    req.io.to(`user_${appointment.userId}`).emit('appointment_updated', updatedAppointment);
    req.io.to(`user_${appointment.providerId}`).emit('appointment_updated', updatedAppointment);

    res.json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        service: true
      }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check permissions
    if (appointment.userId !== req.user.userId && 
        appointment.providerId !== req.user.userId && 
        req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.appointment.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available time slots
router.get('/availability/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;
    const { date, serviceId } = req.query;

    if (!date || !serviceId) {
      return res.status(400).json({ message: 'Date and serviceId are required' });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Get business profile with working hours
    const businessProfile = await prisma.businessProfile.findUnique({
      where: { userId: providerId }
    });

    if (!businessProfile) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const workingHours = businessProfile.workingHours || {};
    const daySchedule = workingHours[dayOfWeek];

    if (!daySchedule || !daySchedule.isOpen) {
      return res.json({ availableSlots: [] });
    }

    // Get existing appointments for the day
    const appointments = await prisma.appointment.findMany({
      where: {
        providerId,
        date: requestedDate,
        status: { not: 'CANCELLED' }
      },
      select: {
        startTime: true,
        endTime: true
      }
    });

    // Generate available slots
    const availableSlots = [];
    const startTime = moment(`${date} ${daySchedule.start}`);
    const endTime = moment(`${date} ${daySchedule.end}`);
    const slotDuration = service.duration;

    while (startTime.clone().add(slotDuration, 'minutes').isSameOrBefore(endTime)) {
      const slotStart = startTime.clone();
      const slotEnd = startTime.clone().add(slotDuration, 'minutes');

      // Check if slot conflicts with existing appointments
      const hasConflict = appointments.some(apt => {
        const aptStart = moment(apt.startTime);
        const aptEnd = moment(apt.endTime);
        return slotStart.isBefore(aptEnd) && slotEnd.isAfter(aptStart);
      });

      if (!hasConflict && slotStart.isAfter(moment())) {
        availableSlots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString()
        });
      }

      startTime.add(30, 'minutes'); 
    }

    res.json({ availableSlots });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
